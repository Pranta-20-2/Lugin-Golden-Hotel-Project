-- Link group bookings to customers table for inline onboarding

alter table public.booking_groups
  add column if not exists customer_id bigint references public.customers(id) on delete set null;

create index if not exists booking_groups_customer_id_idx
  on public.booking_groups (customer_id);
