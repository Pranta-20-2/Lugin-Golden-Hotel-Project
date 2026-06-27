-- ============================================================
-- Lugin Golden — One-click preview seed (Supabase SQL Editor)
-- Run this entire file if starting fresh or refreshing demo data
-- ============================================================

-- 1. Room types table + RLS
create table if not exists public.room_types (
  id bigint generated always as identity primary key,
  name text not null,
  rate_per_night numeric not null check (rate_per_night > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists room_types_name_key on public.room_types (name);

alter table public.room_types enable row level security;

drop policy if exists "Authenticated users can select room_types" on public.room_types;
drop policy if exists "Authenticated users can insert room_types" on public.room_types;
drop policy if exists "Authenticated users can update room_types" on public.room_types;
drop policy if exists "Authenticated users can delete room_types" on public.room_types;

create policy "Authenticated users can select room_types"
  on public.room_types for select to authenticated using (true);
create policy "Authenticated users can insert room_types"
  on public.room_types for insert to authenticated with check (true);
create policy "Authenticated users can update room_types"
  on public.room_types for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete room_types"
  on public.room_types for delete to authenticated using (true);

alter table public.room_types drop column if exists total_rooms;

-- 2. Client room types
insert into public.room_types (name, rate_per_night, notes)
values
  ('Single Room', 1500, 'For 1 person'),
  ('Double Room', 2500, 'For 2 people'),
  ('Deluxe Room', 3500, 'AC, for 2 people'),
  ('Suite Room', 5500, 'Includes living space'),
  ('VIP Room', 8000, 'Premium')
on conflict (name) do update set
  rate_per_night = excluded.rate_per_night,
  notes = excluded.notes,
  updated_at = now();

-- 3. Bookings table + RLS (dashboard preview until Phase 5)
-- Drop old table if it was created with a different schema (e.g. missing room_type_id)
drop table if exists public.bookings cascade;

create table public.bookings (
  id bigint generated always as identity primary key,
  room_type_id bigint not null references public.room_types(id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  total_amount numeric not null default 0 check (total_amount >= 0),
  check_in date,
  check_out date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_room_type_id_idx on public.bookings (room_type_id);

alter table public.bookings enable row level security;

drop policy if exists "Authenticated users can select bookings" on public.bookings;
drop policy if exists "Authenticated users can insert bookings" on public.bookings;
drop policy if exists "Authenticated users can update bookings" on public.bookings;
drop policy if exists "Authenticated users can delete bookings" on public.bookings;

create policy "Authenticated users can select bookings"
  on public.bookings for select to authenticated using (true);
create policy "Authenticated users can insert bookings"
  on public.bookings for insert to authenticated with check (true);
create policy "Authenticated users can update bookings"
  on public.bookings for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete bookings"
  on public.bookings for delete to authenticated using (true);

-- 4. Demo bookings (dashboard charts)
delete from public.bookings;

insert into public.bookings (room_type_id, status, total_amount, check_in, check_out)
select rt.id, v.status, v.total_amount, v.check_in::date, v.check_out::date
from (
  values
    ('Single Room',  'pending',     1500,  '2026-06-25', '2026-06-26'),
    ('Single Room',  'confirmed',   4500,  '2026-06-28', '2026-07-01'),
    ('Single Room',  'checked_out', 3000,  '2026-06-10', '2026-06-12'),
    ('Double Room',  'confirmed',   5000,  '2026-06-27', '2026-06-29'),
    ('Double Room',  'checked_in',  7500,  '2026-06-26', '2026-06-29'),
    ('Double Room',  'cancelled',   2500,  '2026-07-05', '2026-07-06'),
    ('Deluxe Room',  'confirmed',  10500,  '2026-07-01', '2026-07-04'),
    ('Deluxe Room',  'checked_out', 7000,  '2026-06-15', '2026-06-17'),
    ('Suite Room',   'checked_in',  11000,  '2026-06-26', '2026-06-28'),
    ('Suite Room',   'checked_out', 16500,  '2026-06-01', '2026-06-04'),
    ('VIP Room',     'confirmed',   16000,  '2026-07-10', '2026-07-12'),
    ('VIP Room',     'pending',      8000,  '2026-07-15', '2026-07-16')
) as v(room_type_name, status, total_amount, check_in, check_out)
join public.room_types rt on rt.name = v.room_type_name;
