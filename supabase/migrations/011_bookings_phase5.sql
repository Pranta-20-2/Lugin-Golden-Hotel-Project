-- Phase 5: link bookings to customers
alter table public.bookings
  add column if not exists customer_id bigint references public.customers(id) on delete set null;

create index if not exists bookings_customer_id_idx on public.bookings (customer_id);
