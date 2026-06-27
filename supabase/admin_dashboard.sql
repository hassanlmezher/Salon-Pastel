-- Run this in the Supabase SQL Editor after the existing booking schema is installed.
-- It preserves existing appointments, adds owner-only admin access, and upgrades booking metadata.

create extension if not exists pgcrypto;

create table if not exists public.owner_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.owner_users enable row level security;

drop policy if exists "Owner users can read own owner row" on public.owner_users;
create policy "Owner users can read own owner row"
  on public.owner_users
  for select
  to authenticated
  using (auth.uid() = user_id);

alter table public.appointments
  add column if not exists customer_first_name text,
  add column if not exists customer_last_name text,
  add column if not exists selected_services jsonb,
  add column if not exists total_price numeric(10, 2),
  add column if not exists total_duration_minutes integer,
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
before update on public.appointments
for each row
execute function public.set_updated_at();

create or replace function public.is_owner_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.owner_users
    where owner_users.user_id = p_user_id
  );
$$;

revoke all on function public.is_owner_user(uuid) from public;
grant execute on function public.is_owner_user(uuid) to authenticated;

alter table public.appointments enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointments'
      and cmd in ('SELECT', 'ALL')
  loop
    execute format('drop policy if exists %I on public.appointments', policy_record.policyname);
  end loop;
end $$;

drop policy if exists "Owners can read appointments" on public.appointments;
create policy "Owners can read appointments"
  on public.appointments
  for select
  to authenticated
  using (public.is_owner_user(auth.uid()));

drop function if exists public.create_appointment(uuid, text, text, timestamp);

create function public.create_appointment(
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
language plpgsql
security definer
set search_path = public
as $$
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

  v_requested_duration_minutes := greatest(coalesce(p_total_duration_minutes, v_duration_minutes), v_duration_minutes);
  v_appointment_end := p_appointment_start + make_interval(mins => v_requested_duration_minutes);

  if exists (
    select 1
    from public.appointments appointments
    where appointments.employee_id = v_employee_id
      and coalesce(appointments.status, '') <> 'cancelled'
      and appointments.appointment_start < v_appointment_end
      and appointments.appointment_end > p_appointment_start
  ) then
    raise exception 'This time was just booked. Please choose another time.';
  end if;

  v_selected_services := case
    when p_selected_services is not null and jsonb_typeof(p_selected_services) = 'array' then p_selected_services
    else null
  end;

  v_appointment_id := gen_random_uuid();

  insert into public.appointments (
    id,
    service_id,
    employee_id,
    customer_full_name,
    customer_first_name,
    customer_last_name,
    customer_phone,
    appointment_start,
    appointment_end,
    selected_services,
    total_price,
    total_duration_minutes,
    status
  )
  values (
    v_appointment_id,
    p_service_id,
    v_employee_id,
    v_customer_full_name,
    v_customer_first_name,
    v_customer_last_name,
    trim(p_customer_phone),
    p_appointment_start,
    v_appointment_end,
    v_selected_services,
    p_total_price,
    v_requested_duration_minutes,
    'booked'
  );

  return v_appointment_id;
end;
$$;

grant execute on function public.create_appointment(uuid, text, text, timestamp, text, text, jsonb, numeric, integer) to anon;
grant execute on function public.create_appointment(uuid, text, text, timestamp, text, text, jsonb, numeric, integer) to authenticated;

create or replace function public.admin_update_appointment_status(
  p_appointment_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_owner_user(auth.uid()) then
    raise exception 'Only owner users can update appointment status';
  end if;

  if p_status not in ('booked', 'confirmed', 'completed', 'cancelled', 'no_show') then
    raise exception 'Invalid appointment status';
  end if;

  update public.appointments
  set status = p_status,
      updated_at = now()
  where id = p_appointment_id;

  if not found then
    raise exception 'Appointment not found';
  end if;
end;
$$;

revoke all on function public.admin_update_appointment_status(uuid, text) from public;
grant execute on function public.admin_update_appointment_status(uuid, text) to authenticated;

create index if not exists appointments_start_idx
  on public.appointments (appointment_start);

create index if not exists appointments_status_idx
  on public.appointments (status);

-- After creating an owner in Supabase Auth, grant access with:
-- insert into public.owner_users (user_id) values ('AUTH_USER_UUID_HERE');
