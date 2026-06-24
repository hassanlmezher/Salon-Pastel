-- Run this in the Supabase SQL Editor.
-- It makes public booking availability work without exposing private keys.

create extension if not exists pgcrypto;

insert into public.employees (id, name, category_id, is_active)
select gen_random_uuid(), 'Haifa Salman Mezher', service_categories.id, true
from public.service_categories service_categories
where not exists (
  select 1
  from public.employees
  where lower(name) = lower('Haifa Salman Mezher')
    and category_id = service_categories.id
);

do $$
declare
  day_column_type text;
  day_names text[] := array['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  day_short_names text[] := array['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  day_index int;
  day_value text;
  closed boolean;
begin
  select data_type
  into day_column_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'weekly_working_hours'
    and column_name = 'day_of_week';

  for day_index in 0..6 loop
    closed := day_index = 1;

    if not exists (
      select 1
      from public.weekly_working_hours
      where lower(day_of_week::text) in (
        day_index::text,
        lower(day_names[day_index + 1]),
        lower(day_short_names[day_index + 1])
      )
    ) then
      if day_column_type in ('smallint', 'integer', 'bigint', 'numeric') then
        execute
          'insert into public.weekly_working_hours (id, day_of_week, opens_at, closes_at, is_closed)
           values (gen_random_uuid(), $1, $2, $3, $4)'
        using day_index, time '08:30', time '18:00', closed;
      else
        day_value := day_names[day_index + 1];
        execute
          'insert into public.weekly_working_hours (id, day_of_week, opens_at, closes_at, is_closed)
           values (gen_random_uuid(), $1, $2, $3, $4)'
        using day_value, time '08:30', time '18:00', closed;
      end if;
    end if;

    update public.weekly_working_hours
    set
      opens_at = time '08:30',
      closes_at = time '18:00',
      is_closed = closed
    where lower(day_of_week::text) in (
      day_index::text,
      lower(day_names[day_index + 1]),
      lower(day_short_names[day_index + 1])
    );
  end loop;
end $$;

drop function if exists public.create_appointment(uuid, text, text, timestamp);
drop function if exists public.get_available_slots(uuid, date);

create function public.get_available_slots(
  p_service_id uuid,
  p_date date
)
returns table (
  appointment_start timestamp
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration_minutes int;
  v_category_id uuid;
  v_employee_id uuid;
  v_opens_at time;
  v_closes_at time;
  v_day_of_week int;
begin
  select duration_minutes, category_id
  into v_duration_minutes, v_category_id
  from public.services
  where id = p_service_id
    and is_active = true;

  if v_duration_minutes is null then
    return;
  end if;

  select id
  into v_employee_id
  from public.employees
  where is_active = true
    and category_id = v_category_id
  order by name
  limit 1;

  if v_employee_id is null then
    return;
  end if;

  v_day_of_week := extract(dow from p_date)::int;

  select opens_at::time, closes_at::time
  into v_opens_at, v_closes_at
  from public.weekly_working_hours
  where is_closed = false
    and (
      day_of_week::text = v_day_of_week::text
      or lower(day_of_week::text) = lower(to_char(p_date, 'FMDay'))
      or lower(day_of_week::text) = lower(to_char(p_date, 'Dy'))
    )
  limit 1;

  if v_opens_at is null or v_closes_at is null then
    return;
  end if;

  return query
  with slots as (
    select generate_series(
      p_date::timestamp + v_opens_at,
      p_date::timestamp + v_closes_at - make_interval(mins => v_duration_minutes),
      interval '30 minutes'
    ) as slot_start
  )
  select slots.slot_start
  from slots
  where not exists (
    select 1
    from public.appointments appointments
    where appointments.employee_id = v_employee_id
      and coalesce(appointments.status, '') <> 'cancelled'
      and appointments.appointment_start < slots.slot_start + make_interval(mins => v_duration_minutes)
      and appointments.appointment_end > slots.slot_start
  )
  order by slots.slot_start;
end;
$$;

create function public.create_appointment(
  p_service_id uuid,
  p_customer_full_name text,
  p_customer_phone text,
  p_appointment_start timestamp
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration_minutes int;
  v_category_id uuid;
  v_employee_id uuid;
  v_appointment_end timestamp;
  v_appointment_id uuid;
begin
  if nullif(trim(p_customer_full_name), '') is null then
    raise exception 'Customer full name is required';
  end if;

  if nullif(trim(p_customer_phone), '') is null then
    raise exception 'Customer phone is required';
  end if;

  select duration_minutes, category_id
  into v_duration_minutes, v_category_id
  from public.services
  where id = p_service_id
    and is_active = true;

  if v_duration_minutes is null then
    raise exception 'Service is not available';
  end if;

  select id
  into v_employee_id
  from public.employees
  where is_active = true
    and category_id = v_category_id
  order by name
  limit 1;

  if v_employee_id is null then
    raise exception 'No active employee is available';
  end if;

  if not exists (
    select 1
    from public.get_available_slots(p_service_id, p_appointment_start::date) slots
    where slots.appointment_start = p_appointment_start
  ) then
    raise exception 'This time was just booked. Please choose another time.';
  end if;

  v_appointment_end := p_appointment_start + make_interval(mins => v_duration_minutes);
  v_appointment_id := gen_random_uuid();

  insert into public.appointments (
    id,
    service_id,
    employee_id,
    customer_full_name,
    customer_phone,
    appointment_start,
    appointment_end,
    status
  )
  values (
    v_appointment_id,
    p_service_id,
    v_employee_id,
    trim(p_customer_full_name),
    trim(p_customer_phone),
    p_appointment_start,
    v_appointment_end,
    'booked'
  );

  return v_appointment_id;
end;
$$;

grant execute on function public.get_available_slots(uuid, date) to anon;
grant execute on function public.create_appointment(uuid, text, text, timestamp) to anon;

alter table public.services enable row level security;
alter table public.service_categories enable row level security;

drop policy if exists "Public can read active services" on public.services;
create policy "Public can read active services"
on public.services
for select
using (is_active = true);

drop policy if exists "Public can read service categories" on public.service_categories;
create policy "Public can read service categories"
on public.service_categories
for select
using (true);
