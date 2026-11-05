-- Lets the owner move an appointment to another free time from the admin.
-- Free times follow the same rules as customer booking: opening hours, 30-minute steps,
-- the appointment's full length, and no overlap with the same employee's other bookings.

create or replace function public.admin_get_reschedule_slots(p_appointment_id uuid, p_date date)
returns table(slot_start timestamp without time zone)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_employee_id uuid;
  v_minutes integer;
  v_opens_at time;
  v_closes_at time;
begin
  if not public.is_owner_user(auth.uid()) then
    raise exception 'Only owner users can change appointments';
  end if;

  select
    a.employee_id,
    greatest(
      1,
      coalesce((extract(epoch from (a.appointment_end - a.appointment_start)) / 60)::integer, a.total_duration_minutes, 30)
    )
  into v_employee_id, v_minutes
  from public.appointments a
  where a.id = p_appointment_id;

  if v_employee_id is null then
    raise exception 'Appointment not found';
  end if;

  if p_date < (now() at time zone 'Asia/Beirut')::date then
    return;
  end if;

  select h.opens_at::time, h.closes_at::time
  into v_opens_at, v_closes_at
  from public.weekly_working_hours h
  where h.is_closed = false
    and (
      h.day_of_week::text = extract(dow from p_date)::integer::text
      or lower(h.day_of_week::text) = lower(to_char(p_date, 'FMDay'))
      or lower(h.day_of_week::text) = lower(to_char(p_date, 'Dy'))
    )
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
  select slots.s
  from slots
  where slots.s >= (now() at time zone 'Asia/Beirut')
    and not exists (
      select 1
      from public.appointments other
      where other.employee_id = v_employee_id
        and other.id <> p_appointment_id
        and coalesce(other.status, '') <> 'cancelled'
        and other.appointment_start < slots.s + make_interval(mins => v_minutes)
        and other.appointment_end > slots.s
    )
  order by slots.s;
end;
$function$;

create or replace function public.admin_reschedule_appointment(p_appointment_id uuid, p_appointment_start timestamp without time zone)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_status text;
  v_minutes integer;
begin
  if not public.is_owner_user(auth.uid()) then
    raise exception 'Only owner users can change appointments';
  end if;

  select
    coalesce(a.status, 'booked'),
    greatest(
      1,
      coalesce((extract(epoch from (a.appointment_end - a.appointment_start)) / 60)::integer, a.total_duration_minutes, 30)
    )
  into v_status, v_minutes
  from public.appointments a
  where a.id = p_appointment_id
  for update;

  if v_minutes is null then
    raise exception 'Appointment not found';
  end if;

  if v_status not in ('booked', 'confirmed') then
    raise exception 'Only pending or confirmed appointments can be moved';
  end if;

  if not exists (
    select 1
    from public.admin_get_reschedule_slots(p_appointment_id, p_appointment_start::date) slots
    where slots.slot_start = p_appointment_start
  ) then
    raise exception 'This time is not free. Please choose another time.';
  end if;

  update public.appointments
  set appointment_start = p_appointment_start,
      appointment_end = p_appointment_start + make_interval(mins => v_minutes),
      updated_at = now()
  where id = p_appointment_id;
exception
  when exclusion_violation then
    raise exception 'This time is not free. Please choose another time.';
end;
$function$;
