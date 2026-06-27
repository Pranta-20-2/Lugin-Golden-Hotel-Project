-- Phase 5 schema: bookings + booking_groups aligned with client spec

-- ── Bookings ────────────────────────────────────────────────────────────────

alter table public.bookings
  add column if not exists booking_no text,
  add column if not exists nights integer,
  add column if not exists rate_per_night numeric,
  add column if not exists total_bill numeric,
  add column if not exists advance_paid numeric default 0,
  add column if not exists due_amount numeric default 0,
  add column if not exists notes text;

-- Rename legacy columns when present
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'total_amount'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'total_bill'
  ) then
    alter table public.bookings rename column total_amount to total_bill;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'booking_group_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings' and column_name = 'group_id'
  ) then
    alter table public.bookings rename column booking_group_id to group_id;
  end if;
end $$;

-- Backfill from legacy data
update public.bookings b
set
  booking_no = coalesce(b.booking_no, 'BK-LEGACY-' || b.id),
  nights = coalesce(
    b.nights,
    greatest(
      1,
      (b.check_out::date - b.check_in::date)
    )
  ),
  rate_per_night = coalesce(
    b.rate_per_night,
    (
      select rt.rate_per_night
      from public.room_types rt
      where rt.id = b.room_type_id
    ),
    (
      select rt.rate_per_night
      from public.rooms r
      join public.room_types rt on rt.id = r.room_type_id
      where r.id = b.room_id
    ),
    0
  ),
  total_bill = coalesce(b.total_bill, 0),
  advance_paid = coalesce(b.advance_paid, 0),
  due_amount = coalesce(
    b.due_amount,
    greatest(0, coalesce(b.total_bill, 0) - coalesce(b.advance_paid, 0))
  )
where b.check_in is not null and b.check_out is not null;

update public.bookings
set status = 'confirmed'
where status = 'pending';

alter table public.bookings
  alter column check_in set not null,
  alter column check_out set not null;

alter table public.bookings
  drop constraint if exists bookings_status_check;

alter table public.bookings
  add constraint bookings_status_check
  check (status in ('confirmed', 'checked_in', 'checked_out', 'cancelled'));

alter table public.bookings
  alter column status set default 'confirmed';

create unique index if not exists bookings_booking_no_idx
  on public.bookings (booking_no);

-- Booking groups schema is handled in 012_booking_groups.sql
-- room_type_id is finalized in 015_bookings_room_type_id.sql
