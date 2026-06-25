-- Run this in the Supabase SQL Editor before enabling production Web Push sending.
-- The website inserts rows only after a customer clicks "Enable appointment reminders".
-- iOS Web Push works only for supported iOS versions when the PWA is installed to the Home Screen.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  customer_phone text,
  endpoint text not null unique,
  subscription jsonb not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_appointment_id_idx
  on public.push_subscriptions (appointment_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Public can create reminder subscriptions" on public.push_subscriptions;
create policy "Public can create reminder subscriptions"
  on public.push_subscriptions
  for insert
  to anon
  with check (true);

drop policy if exists "Public can update own endpoint subscriptions" on public.push_subscriptions;
create policy "Public can update own endpoint subscriptions"
  on public.push_subscriptions
  for update
  to anon
  using (true)
  with check (true);
