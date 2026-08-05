-- Run this after fix_booking_availability.sql and admin_dashboard.sql.
-- Availability must use the same total duration that create_appointment stores.

create or replace function public.get_available_slots(
  p_service_id uuid,
  p_date date,
  p_duration_minutes integer
)
returns table (
  appointment_start timestamp
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service_duration_minutes integer;
  v_requested_duration_minutes integer;
  v_category_id uuid;
  v_employee_id uuid;
  v_opens_at time;
  v_closes_at time;
  v_day_of_week integer;
begin
  if p_date < (now() at time zone 'Asia/Beirut')::date then
    return;
  end if;

  select duration_minutes, category_id
  into v_service_duration_minutes, v_category_id
  from public.services
  where id = p_service_id
    and is_active = true;

  if v_category_id is null then
    return;
  end if;

  -- Some legacy service rows have a zero duration. The website supplies the
  -- canonical total, and the one-minute floor keeps exact booked starts hidden
  -- even for older clients that do not yet supply it.
  v_requested_duration_minutes := greatest(
    coalesce(p_duration_minutes, 0),
    coalesce(v_service_duration_minutes, 0),
    1
  );

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

  v_day_of_week := extract(dow from p_date)::integer;

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
      p_date::timestamp + v_closes_at - make_interval(mins => v_requested_duration_minutes),
      interval '30 minutes'
    ) as slot_start
  )
  select slots.slot_start
  from slots
  where slots.slot_start >= (now() at time zone 'Asia/Beirut')
    and not exists (
      select 1
      from public.appointments appointments
      where appointments.employee_id = v_employee_id
        and coalesce(appointments.status, '') <> 'cancelled'
        and appointments.appointment_start < slots.slot_start + make_interval(mins => v_requested_duration_minutes)
        and appointments.appointment_end > slots.slot_start
    )
  order by slots.slot_start;
end;
$$;

-- Backward-compatible wrapper for clients that only send service and date.
create or replace function public.get_available_slots(
  p_service_id uuid,
  p_date date
)
returns table (
  appointment_start timestamp
)
language sql
security definer
set search_path = public
as $$
  select slots.appointment_start
  from public.get_available_slots(p_service_id, p_date, null) as slots;
$$;

create or replace function public.get_available_slots_for_month(
  p_service_id uuid,
  p_month_start date,
  p_duration_minutes integer
)
returns table (
  appointment_start timestamp
)
language sql
security definer
set search_path = public
as $$
  select slots.appointment_start
  from generate_series(
    date_trunc('month', p_month_start)::date,
    (date_trunc('month', p_month_start)::date + interval '1 month - 1 day')::date,
    interval '1 day'
  ) as month_days(day)
  cross join lateral public.get_available_slots(
    p_service_id,
    month_days.day::date,
    p_duration_minutes
  ) as slots
  order by slots.appointment_start;
$$;

-- Backward-compatible wrapper for clients that only send service and month.
create or replace function public.get_available_slots_for_month(
  p_service_id uuid,
  p_month_start date
)
returns table (
  appointment_start timestamp
)
language sql
security definer
set search_path = public
as $$
  select slots.appointment_start
  from public.get_available_slots_for_month(p_service_id, p_month_start, null) as slots;
$$;

grant execute on function public.get_available_slots(uuid, date, integer) to anon, authenticated;
grant execute on function public.get_available_slots(uuid, date) to anon, authenticated;
grant execute on function public.get_available_slots_for_month(uuid, date, integer) to anon, authenticated;
grant execute on function public.get_available_slots_for_month(uuid, date) to anon, authenticated;
