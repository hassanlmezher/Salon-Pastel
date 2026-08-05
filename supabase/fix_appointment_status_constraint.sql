-- Older deployments may have a constraint that only accepts booked/cancelled.
-- Keep legacy values valid while allowing the admin's Confirmed status.
alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
  check (status in ('booked', 'confirmed', 'completed', 'cancelled', 'no_show'));
