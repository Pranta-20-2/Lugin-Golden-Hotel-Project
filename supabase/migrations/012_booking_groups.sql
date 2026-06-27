-- Booking groups (client spec: group_name, contact_person, mobile — no customer_id)

do $migrate$
begin
  if not exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'booking_groups'
  ) then
    create table public.booking_groups (
      id bigint generated always as identity primary key,
      group_name text not null,
      contact_person text not null,
      mobile text not null,
      check_in date not null,
      check_out date not null,
      status text not null default 'confirmed'
        check (status in ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  end if;
end
$migrate$;

-- Upgrade legacy booking_groups if an older draft was partially applied
alter table public.booking_groups
  add column if not exists group_name text,
  add column if not exists contact_person text,
  add column if not exists mobile text,
  add column if not exists check_in date,
  add column if not exists check_out date,
  add column if not exists status text default 'confirmed',
  add column if not exists notes text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

do $migrate$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'booking_groups' and column_name = 'name'
  ) then
    update public.booking_groups
    set group_name = coalesce(group_name, name)
    where group_name is null;

    alter table public.booking_groups drop column name;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'booking_groups' and column_name = 'customer_id'
  ) then
    update public.booking_groups bg
    set
      contact_person = coalesce(
        bg.contact_person,
        (select c.name from public.customers c where c.id = bg.customer_id)
      ),
      mobile = coalesce(
        bg.mobile,
        (select c.mobile from public.customers c where c.id = bg.customer_id)
      )
    where bg.customer_id is not null;

    alter table public.booking_groups drop column customer_id;
  end if;

  alter table public.booking_groups drop column if exists total_amount;
  alter table public.booking_groups drop column if exists advance_paid;
end
$migrate$;

update public.booking_groups
set group_name = coalesce(nullif(group_name, ''), 'Group ' || id)
where group_name is null or group_name = '';

update public.booking_groups
set contact_person = coalesce(nullif(contact_person, ''), 'Unknown')
where contact_person is null or contact_person = '';

update public.booking_groups
set mobile = coalesce(nullif(mobile, ''), '0000000000')
where mobile is null or mobile = '';

update public.booking_groups
set check_in = coalesce(check_in, current_date)
where check_in is null;

update public.booking_groups
set check_out = coalesce(check_out, current_date + 1)
where check_out is null;

update public.booking_groups
set status = 'confirmed'
where status is null or status = 'pending';

alter table public.booking_groups
  alter column group_name set not null,
  alter column contact_person set not null,
  alter column mobile set not null,
  alter column check_in set not null,
  alter column check_out set not null;

alter table public.booking_groups
  drop constraint if exists booking_groups_status_check;

alter table public.booking_groups
  add constraint booking_groups_status_check
  check (status in ('confirmed', 'checked_in', 'checked_out', 'cancelled'));

alter table public.bookings
  add column if not exists group_id bigint references public.booking_groups(id) on delete cascade;

do $migrate$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'booking_group_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'group_id'
  ) then
    alter table public.bookings rename column booking_group_id to group_id;
  end if;
end
$migrate$;

create index if not exists bookings_group_id_idx on public.bookings (group_id);
create index if not exists booking_groups_status_idx on public.booking_groups (status);

alter table public.booking_groups enable row level security;

drop policy if exists "Authenticated users can select booking_groups" on public.booking_groups;
drop policy if exists "Authenticated users can insert booking_groups" on public.booking_groups;
drop policy if exists "Authenticated users can update booking_groups" on public.booking_groups;
drop policy if exists "Authenticated users can delete booking_groups" on public.booking_groups;

create policy "Authenticated users can select booking_groups"
  on public.booking_groups for select to authenticated using (true);
create policy "Authenticated users can insert booking_groups"
  on public.booking_groups for insert to authenticated with check (true);
create policy "Authenticated users can update booking_groups"
  on public.booking_groups for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete booking_groups"
  on public.booking_groups for delete to authenticated using (true);
