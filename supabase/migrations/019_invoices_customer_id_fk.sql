-- Ensure invoice FK columns and constraints exist (idempotent if 018 was partially applied)

alter table public.invoices
  add column if not exists booking_id bigint,
  add column if not exists group_id bigint,
  add column if not exists customer_id bigint;

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
end $$;

create index if not exists invoices_booking_id_idx on public.invoices (booking_id);
create index if not exists invoices_group_id_idx on public.invoices (group_id);
create index if not exists invoices_customer_id_idx on public.invoices (customer_id);
