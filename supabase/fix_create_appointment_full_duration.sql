-- Run after fix_duration_aware_availability.sql. Both were applied to production on 2026-11-02.
-- create_appointment now checks the full length (service plus extras) against
-- opening hours, so a long booking can no longer run past closing time.

CREATE OR REPLACE FUNCTION public.create_appointment(p_service_id uuid, p_customer_full_name text, p_customer_phone text, p_appointment_start timestamp without time zone, p_customer_first_name text DEFAULT NULL::text, p_customer_last_name text DEFAULT NULL::text, p_selected_services jsonb DEFAULT NULL::jsonb, p_total_price numeric DEFAULT NULL::numeric, p_total_duration_minutes integer DEFAULT NULL::integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  -- The full length (service plus extras) must fit before closing time.
  v_requested_duration_minutes := greatest(coalesce(p_total_duration_minutes, v_duration_minutes), v_duration_minutes);

  if not exists (
    select 1
    from public.get_available_slots(p_service_id, p_appointment_start::date, v_requested_duration_minutes) slots
    where slots.appointment_start = p_appointment_start
  ) then
    raise exception 'This time was just booked. Please choose another time.';
  end if;

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
$function$;

-- Services shown on the website that were missing from the database.
insert into public.services (category_id, name, price, duration_minutes, is_active)
select c.id, v.name, v.price, v.duration, true
from public.service_categories c
cross join (values ('Pedicure + Ombré', 20.00, 105), ('Pedicure Fungal Nail Care Treatment', 20.00, 30)) as v(name, price, duration)
where c.name = 'Pedicure'
  and not exists (select 1 from public.services s where s.name = v.name);
