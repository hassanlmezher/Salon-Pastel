-- Older deployments may have a constraint that only accepts booked/cancelled.
-- Keep legacy values valid while allowing the admin's Confirmed status.
alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
  check (status in ('booked', 'confirmed', 'completed', 'cancelled', 'no_show'));

-- Confirmed appointments still hold their time, so the no-double-booking rule covers them too.
alter table public.appointments
  drop constraint if exists no_employee_overlap;

alter table public.appointments
  add constraint no_employee_overlap
  exclude using gist (employee_id with =, tsrange(appointment_start, appointment_end, '[)') with &&)
  where (status in ('booked', 'confirmed'));
