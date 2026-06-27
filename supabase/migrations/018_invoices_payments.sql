-- Phase 6: Invoices & Payments (idempotent — safe if a partial invoices table already exists)

create table if not exists public.invoices (
  id bigint generated always as identity primary key
);

alter table public.invoices
  add column if not exists invoice_no text,
  add column if not exists booking_id bigint,
  add column if not exists group_id bigint,
  add column if not exists customer_id bigint,
  add column if not exists total_bill numeric,
  add column if not exists subtotal numeric default 0,
  add column if not exists total numeric default 0,
  add column if not exists amount_paid numeric default 0,
  add column if not exists due_amount numeric default 0,
  add column if not exists status text default 'issued',
  add column if not exists notes text,
  add column if not exists issued_at timestamptz default now(),
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.invoices set amount_paid = 0 where amount_paid is null;
update public.invoices set subtotal = coalesce(total_bill, total, 0) where subtotal is null;
update public.invoices set total = coalesce(total_bill, subtotal, 0) where total is null;
update public.invoices set total_bill = coalesce(subtotal, total, 0) where total_bill is null;
update public.invoices set due_amount = 0 where due_amount is null;
update public.invoices set status = 'issued' where status is null;
update public.invoices set issued_at = now() where issued_at is null;
update public.invoices set created_at = now() where created_at is null;
update public.invoices set updated_at = now() where updated_at is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.invoices'::regclass
      and conname = 'invoices_booking_id_fkey'
  ) then
    alter table public.invoices
      add constraint invoices_booking_id_fkey
      foreign key (booking_id) references public.bookings(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.invoices'::regclass
      and conname = 'invoices_group_id_fkey'
  ) then
    alter table public.invoices
      add constraint invoices_group_id_fkey
      foreign key (group_id) references public.booking_groups(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.invoices'::regclass
      and conname = 'invoices_customer_id_fkey'
  ) then
    alter table public.invoices
      add constraint invoices_customer_id_fkey
      foreign key (customer_id) references public.customers(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.invoices'::regclass
      and conname = 'invoices_status_check'
  ) then
    alter table public.invoices
      add constraint invoices_status_check
      check (status in ('issued', 'partial', 'paid', 'cancelled'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.invoices'::regclass
      and conname = 'invoices_source_check'
  ) then
    alter table public.invoices
      add constraint invoices_source_check
      check (
        (booking_id is not null and group_id is null)
        or (booking_id is null and group_id is not null)
      );
  end if;
end $$;

create unique index if not exists invoices_invoice_no_idx on public.invoices (invoice_no);
create index if not exists invoices_booking_id_idx on public.invoices (booking_id);
create index if not exists invoices_group_id_idx on public.invoices (group_id);
create index if not exists invoices_customer_id_idx on public.invoices (customer_id);
create index if not exists invoices_status_idx on public.invoices (status);

create table if not exists public.payments (
  id bigint generated always as identity primary key
);

alter table public.payments
  add column if not exists invoice_id bigint,
  add column if not exists amount numeric,
  add column if not exists payment_method text default 'cash',
  add column if not exists reference text,
  add column if not exists notes text,
  add column if not exists paid_at timestamptz default now(),
  add column if not exists created_at timestamptz default now();

update public.payments set payment_method = 'cash' where payment_method is null;
update public.payments set paid_at = now() where paid_at is null;
update public.payments set created_at = now() where created_at is null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.payments'::regclass
      and conname = 'payments_invoice_id_fkey'
  ) then
    alter table public.payments
      add constraint payments_invoice_id_fkey
      foreign key (invoice_id) references public.invoices(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.payments'::regclass
      and conname = 'payments_amount_check'
  ) then
    alter table public.payments
      add constraint payments_amount_check
      check (amount > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.payments'::regclass
      and conname = 'payments_payment_method_check'
  ) then
    alter table public.payments
      add constraint payments_payment_method_check
      check (payment_method in ('cash', 'card', 'bank_transfer', 'other'));
  end if;
end $$;

create index if not exists payments_invoice_id_idx on public.payments (invoice_id);

alter table public.invoices enable row level security;
alter table public.payments enable row level security;

drop policy if exists "Authenticated users can select invoices" on public.invoices;
drop policy if exists "Authenticated users can insert invoices" on public.invoices;
drop policy if exists "Authenticated users can update invoices" on public.invoices;
drop policy if exists "Authenticated users can delete invoices" on public.invoices;

create policy "Authenticated users can select invoices"
  on public.invoices for select to authenticated using (true);
create policy "Authenticated users can insert invoices"
  on public.invoices for insert to authenticated with check (true);
create policy "Authenticated users can update invoices"
  on public.invoices for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete invoices"
  on public.invoices for delete to authenticated using (true);

drop policy if exists "Authenticated users can select payments" on public.payments;
drop policy if exists "Authenticated users can insert payments" on public.payments;
drop policy if exists "Authenticated users can update payments" on public.payments;
drop policy if exists "Authenticated users can delete payments" on public.payments;

create policy "Authenticated users can select payments"
  on public.payments for select to authenticated using (true);
create policy "Authenticated users can insert payments"
  on public.payments for insert to authenticated with check (true);
create policy "Authenticated users can update payments"
  on public.payments for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete payments"
  on public.payments for delete to authenticated using (true);
