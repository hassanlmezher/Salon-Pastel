-- Pastel salon database (Neon Postgres).
-- The sites never touch tables directly. Each site's server code signs in with its own role,
-- and that role may only run the functions it needs:
--   pastel_booking  (customer site): list services, see free times, create an appointment
--   pastel_admin    (owner admin):   sign in/out, list and change appointments, behind a session
-- Run as the database owner. Safe to run again: everything is create-or-replace / if-not-exists.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- ---------- Tables ----------

create table if not exists service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references service_categories(id),
  name text not null,
  price numeric(10,2),
  duration_minutes integer not null default 60,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists service_addons (
  id uuid primary key default gen_random_uuid(),
  main_service_id uuid references services(id) on delete cascade,
  addon_service_id uuid references services(id) on delete cascade,
  created_at timestamptz default timezone('utc', now()),
  constraint unique_main_addon unique (main_service_id, addon_service_id)
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid not null references service_categories(id),
  is_active boolean default true
);

-- A service done by one particular staff member (not the category's usual employee) points at
-- them here, so its bookings only clash with that person's other bookings.
alter table services add column if not exists employee_id uuid references employees(id);

create table if not exists weekly_working_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null check (day_of_week between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean default false
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id),
  employee_id uuid not null references employees(id),
  customer_full_name text not null,
  customer_phone text not null,
  appointment_start timestamp not null,
  appointment_end timestamp not null,
  status text not null default 'booked'
    constraint appointments_status_check check (status in ('booked', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz default now(),
  customer_first_name text,
  customer_last_name text,
  selected_services jsonb,
  total_price numeric(10,2),
  total_duration_minutes integer,
  updated_at timestamptz not null default now(),
  -- One employee can't have two live bookings that overlap.
  constraint no_employee_overlap exclude using gist (
    employee_id with =,
    tsrange(appointment_start, appointment_end, '[)') with &&
  ) where (status in ('booked', 'confirmed'))
);
create index if not exists appointments_start_idx on appointments (appointment_start);
create index if not exists appointments_status_idx on appointments (status);

create table if not exists appointment_reminders (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  remind_at timestamp not null,
  reminder_type text not null check (reminder_type in ('7_days', '3_days', '1_day')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  created_at timestamptz default now()
);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references appointments(id) on delete set null,
  customer_phone text,
  endpoint text not null unique,
  subscription jsonb not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists push_subscriptions_appointment_id_idx on push_subscriptions (appointment_id);

-- Owner accounts. password_hash is bcrypt (the hash carried over from the old sign-in system).
create table if not exists owners (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Signed-in admin browsers. Only a SHA-256 hash of each session token is stored.
create table if not exists admin_sessions (
  token_hash text primary key,
  owner_id uuid not null references owners(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- Failed sign-ins, so guessing passwords gets locked out.
create table if not exists admin_login_attempts (
  email text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists admin_login_attempts_email_idx on admin_login_attempts (email, attempted_at);

create or replace function set_updated_at()
returns trigger language plpgsql set search_path to 'public' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists appointments_set_updated_at on appointments;
create trigger appointments_set_updated_at before update on appointments
  for each row execute function set_updated_at();

-- ---------- Booking (customer site) ----------

create or replace function list_active_services()
returns table(id uuid, name text, price numeric, duration_minutes integer, category text)
language sql stable security definer set search_path to 'public' as $$
  select s.id, s.name, s.price, s.duration_minutes, c.name
  from services s join service_categories c on c.id = s.category_id
  where s.is_active
  order by s.name;
$$;

create or replace function get_available_slots(p_service_id uuid, p_date date, p_duration_minutes integer)
returns table(appointment_start timestamp)
language plpgsql security definer set search_path to 'public' as $$
declare
  v_service_duration_minutes integer;
  v_requested_duration_minutes integer;
  v_category_id uuid;
  v_employee_id uuid;
  v_opens_at time;
  v_closes_at time;
begin
  if p_date < (now() at time zone 'Asia/Beirut')::date then
    return;
  end if;

  select s.duration_minutes, s.category_id
  into v_service_duration_minutes, v_category_id
  from services s
  where s.id = p_service_id and s.is_active = true;

  if v_category_id is null then
    return;
  end if;

  v_requested_duration_minutes := greatest(coalesce(p_duration_minutes, 0), coalesce(v_service_duration_minutes, 0), 1);

  -- The service's own staff member if it has one, otherwise the category's first employee.
  select coalesce(
    (select s.employee_id from services s where s.id = p_service_id),
    (select e.id from employees e where e.is_active = true and e.category_id = v_category_id order by e.name limit 1)
  ) into v_employee_id;

  if v_employee_id is null then
    return;
  end if;

  select h.opens_at, h.closes_at into v_opens_at, v_closes_at
  from weekly_working_hours h
  where h.is_closed = false and h.day_of_week = extract(dow from p_date)::integer
  limit 1;

  if v_opens_at is null or v_closes_at is null then
    return;
  end if;

  return query
  with slots as (
    select generate_series(
      p_date::timestamp + v_opens_at,
      p_date::timestamp + v_closes_at - make_interval(mins => v_requested_duration_minutes),
      interval '30 minutes'
    ) as slot_start
  )
  select slots.slot_start
  from slots
  where slots.slot_start >= (now() at time zone 'Asia/Beirut')
    and not exists (
      select 1 from appointments a
      where a.employee_id = v_employee_id
        and coalesce(a.status, '') <> 'cancelled'
        and a.appointment_start < slots.slot_start + make_interval(mins => v_requested_duration_minutes)
        and a.appointment_end > slots.slot_start
    )
  order by slots.slot_start;
end;
$$;

create or replace function get_available_slots_for_month(p_service_id uuid, p_month_start date, p_duration_minutes integer)
returns table(appointment_start timestamp)
language sql security definer set search_path to 'public' as $$
  select slots.appointment_start
  from generate_series(
    date_trunc('month', p_month_start)::date,
    (date_trunc('month', p_month_start)::date + interval '1 month - 1 day')::date,
    interval '1 day'
  ) as month_days(day)
  cross join lateral get_available_slots(p_service_id, month_days.day::date, p_duration_minutes) as slots
  order by slots.appointment_start;
$$;

create or replace function create_appointment(
  p_service_id uuid,
  p_customer_full_name text,
  p_customer_phone text,
  p_appointment_start timestamp,
  p_customer_first_name text default null,
  p_customer_last_name text default null,
  p_selected_services jsonb default null,
  p_total_price numeric default null,
  p_total_duration_minutes integer default null
)
returns uuid
language plpgsql security definer set search_path to 'public' as $$
declare
  v_duration_minutes int;
  v_requested_duration_minutes int;
  v_category_id uuid;
  v_employee_id uuid;
  v_appointment_end timestamp;
  v_appointment_id uuid;
  v_customer_first_name text;
  v_customer_last_name text;
  v_customer_full_name text;
  v_selected_services jsonb;
begin
  v_customer_first_name := nullif(trim(coalesce(p_customer_first_name, '')), '');
  v_customer_last_name := nullif(trim(coalesce(p_customer_last_name, '')), '');
  v_customer_full_name := nullif(trim(coalesce(p_customer_full_name, concat_ws(' ', v_customer_first_name, v_customer_last_name))), '');

  if v_customer_full_name is null then
    raise exception 'Customer full name is required';
  end if;

  if v_customer_first_name is null then
    v_customer_first_name := split_part(v_customer_full_name, ' ', 1);
  end if;

  if v_customer_last_name is null then
    v_customer_last_name := nullif(trim(regexp_replace(v_customer_full_name, '^\S+\s*', '')), '');
  end if;

  if nullif(trim(p_customer_phone), '') is null then
    raise exception 'Customer phone is required';
  end if;

  select s.duration_minutes, s.category_id into v_duration_minutes, v_category_id
  from services s where s.id = p_service_id and s.is_active = true;

  if v_duration_minutes is null then
    raise exception 'Service is not available';
  end if;

  -- The service's own staff member if it has one, otherwise the category's first employee.
  select coalesce(
    (select s.employee_id from services s where s.id = p_service_id),
    (select e.id from employees e where e.is_active = true and e.category_id = v_category_id order by e.name limit 1)
  ) into v_employee_id;

  if v_employee_id is null then
    raise exception 'No active employee is available';
  end if;

  -- The full length (service plus extras) must fit before closing time.
  v_requested_duration_minutes := greatest(coalesce(p_total_duration_minutes, v_duration_minutes), v_duration_minutes);

  if not exists (
    select 1 from get_available_slots(p_service_id, p_appointment_start::date, v_requested_duration_minutes) slots
    where slots.appointment_start = p_appointment_start
  ) then
    raise exception 'This time was just booked. Please choose another time.';
  end if;

  v_appointment_end := p_appointment_start + make_interval(mins => v_requested_duration_minutes);

  if exists (
    select 1 from appointments a
    where a.employee_id = v_employee_id
      and coalesce(a.status, '') <> 'cancelled'
      and a.appointment_start < v_appointment_end
      and a.appointment_end > p_appointment_start
  ) then
    raise exception 'This time was just booked. Please choose another time.';
  end if;

  v_selected_services := case
    when p_selected_services is not null and jsonb_typeof(p_selected_services) = 'array' then p_selected_services
    else null
  end;

  v_appointment_id := gen_random_uuid();

  insert into appointments (
    id, service_id, employee_id, customer_full_name, customer_first_name, customer_last_name,
    customer_phone, appointment_start, appointment_end, selected_services, total_price,
    total_duration_minutes, status
  ) values (
    v_appointment_id, p_service_id, v_employee_id, v_customer_full_name, v_customer_first_name,
    v_customer_last_name, trim(p_customer_phone), p_appointment_start, v_appointment_end,
    v_selected_services, p_total_price, v_requested_duration_minutes, 'booked'
  );

  return v_appointment_id;
exception
  when exclusion_violation then
    raise exception 'This time was just booked. Please choose another time.';
end;
$$;

-- ---------- Admin sign-in ----------

-- Signs in with email and password. Returns 'ok', 'invalid' or 'locked' (10 misses in 15 minutes).
create or replace function admin_login(p_email text, p_password text, p_token_hash text)
returns text
language plpgsql security definer set search_path to 'public' as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_owner owners%rowtype;
begin
  if (select count(*) from admin_login_attempts
      where email = v_email and attempted_at > now() - interval '15 minutes') >= 10 then
    return 'locked';
  end if;

  select * into v_owner from owners where email = v_email;

  if v_owner.id is null or crypt(coalesce(p_password, ''), v_owner.password_hash) <> v_owner.password_hash then
    insert into admin_login_attempts (email) values (v_email);
    return 'invalid';
  end if;

  delete from admin_login_attempts where email = v_email or attempted_at < now() - interval '1 day';
  delete from admin_sessions where expires_at < now();
  insert into admin_sessions (token_hash, owner_id, expires_at)
  values (p_token_hash, v_owner.id, now() + interval '30 days');
  return 'ok';
end;
$$;

create or replace function admin_logout(p_token_hash text)
returns void
language sql security definer set search_path to 'public' as $$
  delete from admin_sessions where token_hash = p_token_hash;
$$;

-- The signed-in owner's email, or null when the session is missing or expired.
create or replace function admin_session_email(p_token_hash text)
returns text
language sql stable security definer set search_path to 'public' as $$
  select o.email from admin_sessions s join owners o on o.id = s.owner_id
  where s.token_hash = p_token_hash and s.expires_at > now();
$$;

-- Every admin action starts here. Raises "not_signed_in" (SQLSTATE 28000) without a live session.
create or replace function admin_require_session(p_token_hash text)
returns uuid
language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_owner_id uuid;
begin
  select s.owner_id into v_owner_id from admin_sessions s
  where s.token_hash = p_token_hash and s.expires_at > now();
  if v_owner_id is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  return v_owner_id;
end;
$$;

-- ---------- Admin actions ----------

-- Appointments between p_from and p_to (either may be null) matching the search.
-- A search looks at names and phone; phone digits match with or without spaces.
create or replace function admin_list_appointments(
  p_token_hash text,
  p_from timestamp,
  p_to timestamp,
  p_search text,
  p_newest_first boolean
)
returns json
language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_search text := lower(trim(coalesce(p_search, '')));
  v_digits text := regexp_replace(coalesce(p_search, ''), '[\s+().-]', '', 'g');
  v_phone_pattern text;
  v_result json;
begin
  perform admin_require_session(p_token_hash);

  if v_digits ~ '^\d{3,}$' then
    v_phone_pattern := array_to_string(regexp_split_to_array(v_digits, ''), '\D*');
  end if;

  select coalesce(json_agg(row_data order by
    case when p_newest_first then null else start_at end asc,
    case when p_newest_first then start_at end desc), '[]'::json)
  into v_result
  from (
    select a.appointment_start as start_at, json_build_object(
      'id', a.id,
      'customer_first_name', a.customer_first_name,
      'customer_last_name', a.customer_last_name,
      'customer_full_name', a.customer_full_name,
      'customer_phone', a.customer_phone,
      'selected_services', a.selected_services,
      'total_price', a.total_price,
      'total_duration_minutes', a.total_duration_minutes,
      'appointment_start', to_char(a.appointment_start, 'YYYY-MM-DD"T"HH24:MI:SS'),
      'appointment_end', to_char(a.appointment_end, 'YYYY-MM-DD"T"HH24:MI:SS'),
      'status', a.status,
      'services', json_build_object('id', s.id, 'name', s.name, 'price', s.price, 'duration_minutes', s.duration_minutes)
    ) as row_data
    from appointments a
    left join services s on s.id = a.service_id
    where (p_from is null or a.appointment_start >= p_from)
      and (p_to is null or a.appointment_start < p_to)
      and (
        v_search = ''
        or strpos(lower(coalesce(a.customer_first_name, '')), v_search) > 0
        or strpos(lower(coalesce(a.customer_last_name, '')), v_search) > 0
        or strpos(lower(coalesce(a.customer_full_name, '')), v_search) > 0
        or strpos(lower(coalesce(a.customer_phone, '')), v_search) > 0
        or (v_phone_pattern is not null and a.customer_phone ~ v_phone_pattern)
      )
    order by
      case when p_newest_first then null else a.appointment_start end asc,
      case when p_newest_first then a.appointment_start end desc
    limit 500
  ) rows;

  return v_result;
end;
$$;

create or replace function admin_update_appointment_status(p_token_hash text, p_appointment_id uuid, p_status text)
returns void
language plpgsql security definer set search_path to 'public' as $$
begin
  perform admin_require_session(p_token_hash);

  if p_status not in ('booked', 'confirmed', 'completed', 'cancelled', 'no_show') then
    raise exception 'Invalid appointment status';
  end if;

  update appointments set status = p_status where id = p_appointment_id;

  if not found then
    raise exception 'Appointment not found';
  end if;
exception
  when exclusion_violation then
    raise exception 'This time is not free. Please choose another time.';
end;
$$;

-- Free start times on one day for moving this appointment. Its own current time counts as free.
create or replace function admin_get_reschedule_slots(p_token_hash text, p_appointment_id uuid, p_date date)
returns table(slot_start text)
language plpgsql security definer set search_path to 'public' as $$
declare
  v_employee_id uuid;
  v_minutes integer;
  v_opens_at time;
  v_closes_at time;
begin
  perform admin_require_session(p_token_hash);

  select a.employee_id,
    greatest(1, coalesce((extract(epoch from (a.appointment_end - a.appointment_start)) / 60)::integer, a.total_duration_minutes, 30))
  into v_employee_id, v_minutes
  from appointments a where a.id = p_appointment_id;

  if v_employee_id is null then
    raise exception 'Appointment not found';
  end if;

  if p_date < (now() at time zone 'Asia/Beirut')::date then
    return;
  end if;

  select h.opens_at, h.closes_at into v_opens_at, v_closes_at
  from weekly_working_hours h
  where h.is_closed = false and h.day_of_week = extract(dow from p_date)::integer
  limit 1;

  if v_opens_at is null or v_closes_at is null then
    return;
  end if;

  return query
  with slots as (
    select generate_series(
      p_date::timestamp + v_opens_at,
      p_date::timestamp + v_closes_at - make_interval(mins => v_minutes),
      interval '30 minutes'
    ) as s
  )
  select to_char(slots.s, 'YYYY-MM-DD"T"HH24:MI:SS')
  from slots
  where slots.s >= (now() at time zone 'Asia/Beirut')
    and not exists (
      select 1 from appointments other
      where other.employee_id = v_employee_id
        and other.id <> p_appointment_id
        and coalesce(other.status, '') <> 'cancelled'
        and other.appointment_start < slots.s + make_interval(mins => v_minutes)
        and other.appointment_end > slots.s
    )
  order by slots.s;
end;
$$;

create or replace function admin_reschedule_appointment(p_token_hash text, p_appointment_id uuid, p_appointment_start timestamp)
returns void
language plpgsql security definer set search_path to 'public' as $$
declare
  v_status text;
  v_minutes integer;
begin
  perform admin_require_session(p_token_hash);

  select coalesce(a.status, 'booked'),
    greatest(1, coalesce((extract(epoch from (a.appointment_end - a.appointment_start)) / 60)::integer, a.total_duration_minutes, 30))
  into v_status, v_minutes
  from appointments a where a.id = p_appointment_id
  for update;

  if v_minutes is null then
    raise exception 'Appointment not found';
  end if;

  if v_status not in ('booked', 'confirmed') then
    raise exception 'Only pending or confirmed appointments can be moved';
  end if;

  if not exists (
    select 1 from admin_get_reschedule_slots(p_token_hash, p_appointment_id, p_appointment_start::date) slots
    where slots.slot_start = to_char(p_appointment_start, 'YYYY-MM-DD"T"HH24:MI:SS')
  ) then
    raise exception 'This time is not free. Please choose another time.';
  end if;

  update appointments
  set appointment_start = p_appointment_start,
      appointment_end = p_appointment_start + make_interval(mins => v_minutes)
  where id = p_appointment_id;
exception
  when exclusion_violation then
    raise exception 'This time is not free. Please choose another time.';
end;
$$;

-- ---------- Opening hours ----------

-- One row per weekday (0 = Sunday), with "HH:MM" times; a closed day has null times.
create or replace function opening_hours_json()
returns jsonb
language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'day', d.day,
    'open', coalesce(not h.is_closed and h.opens_at is not null and h.closes_at is not null, false),
    'opensAt', case when h.is_closed then null else to_char(h.opens_at, 'HH24:MI') end,
    'closesAt', case when h.is_closed then null else to_char(h.closes_at, 'HH24:MI') end
  ) order by d.day), '[]'::jsonb)
  from generate_series(0, 6) as d(day)
  left join lateral (
    select * from weekly_working_hours w where w.day_of_week = d.day limit 1
  ) h on true;
$$;

create or replace function get_opening_hours()
returns jsonb
language sql stable security definer set search_path to 'public' as $$
  select opening_hours_json();
$$;

create or replace function admin_get_working_hours(p_token_hash text)
returns jsonb
language plpgsql stable security definer set search_path to 'public' as $$
begin
  perform admin_require_session(p_token_hash);
  return opening_hours_json();
end;
$$;

-- p_hours: all seven days, each {"day": 0-6, "open": true/false, "opensAt": "HH:MM", "closesAt": "HH:MM"}.
create or replace function admin_set_working_hours(p_token_hash text, p_hours jsonb)
returns void
language plpgsql security definer set search_path to 'public' as $$
declare
  v_item jsonb;
  v_day integer;
  v_open boolean;
  v_opens time;
  v_closes time;
begin
  perform admin_require_session(p_token_hash);

  if jsonb_typeof(p_hours) <> 'array' or jsonb_array_length(p_hours) <> 7
    or (select count(distinct (x->>'day')::integer) from jsonb_array_elements(p_hours) x where (x->>'day') ~ '^[0-6]$') <> 7 then
    raise exception 'Invalid opening hours';
  end if;

  delete from weekly_working_hours;

  for v_item in select * from jsonb_array_elements(p_hours) loop
    v_day := (v_item->>'day')::integer;
    v_open := coalesce((v_item->>'open')::boolean, false);
    v_opens := null;
    v_closes := null;

    if v_open then
      if coalesce(v_item->>'opensAt', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        or coalesce(v_item->>'closesAt', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
        raise exception 'Invalid opening hours';
      end if;
      v_opens := (v_item->>'opensAt')::time;
      v_closes := (v_item->>'closesAt')::time;
      if v_closes <= v_opens then
        raise exception 'Closing time must be after opening time';
      end if;
    end if;

    insert into weekly_working_hours (day_of_week, opens_at, closes_at, is_closed)
    values (v_day, v_opens, v_closes, not v_open);
  end loop;
end;
$$;

-- ---------- Who may run what ----------

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'pastel_booking') then
    create role pastel_booking login;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'pastel_admin') then
    create role pastel_admin login;
  end if;
end;
$$;

revoke all on all tables in schema public from public, pastel_booking, pastel_admin;
revoke all on all functions in schema public from public;
grant usage on schema public to pastel_booking, pastel_admin;

grant execute on function list_active_services() to pastel_booking;
grant execute on function get_available_slots(uuid, date, integer) to pastel_booking;
grant execute on function get_available_slots_for_month(uuid, date, integer) to pastel_booking;
grant execute on function create_appointment(uuid, text, text, timestamp, text, text, jsonb, numeric, integer) to pastel_booking;
grant execute on function get_opening_hours() to pastel_booking;

grant execute on function admin_login(text, text, text) to pastel_admin;
grant execute on function admin_logout(text) to pastel_admin;
grant execute on function admin_session_email(text) to pastel_admin;
grant execute on function admin_list_appointments(text, timestamp, timestamp, text, boolean) to pastel_admin;
grant execute on function admin_update_appointment_status(text, uuid, text) to pastel_admin;
grant execute on function admin_get_reschedule_slots(text, uuid, date) to pastel_admin;
grant execute on function admin_reschedule_appointment(text, uuid, timestamp) to pastel_admin;
grant execute on function admin_get_working_hours(text) to pastel_admin;
grant execute on function admin_set_working_hours(text, jsonb) to pastel_admin;
