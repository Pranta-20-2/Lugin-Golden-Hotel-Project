-- Customers table for Phase 4
create table if not exists public.customers (
  id bigint generated always as identity primary key,
  name text not null,
  mobile text not null,
  email text,
  address text,
  national_id text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create index if not exists customers_name_idx on public.customers (name);
create index if not exists customers_mobile_idx on public.customers (mobile);

alter table public.customers enable row level security;

drop policy if exists "Authenticated users can select customers" on public.customers;
drop policy if exists "Authenticated users can insert customers" on public.customers;
drop policy if exists "Authenticated users can update customers" on public.customers;
drop policy if exists "Authenticated users can delete customers" on public.customers;

create policy "Authenticated users can select customers"
  on public.customers for select
  to authenticated
  using (true);

create policy "Authenticated users can insert customers"
  on public.customers for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update customers"
  on public.customers for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete customers"
  on public.customers for delete
  to authenticated
  using (true);
