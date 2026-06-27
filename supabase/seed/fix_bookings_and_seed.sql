-- Run this if room_types are already seeded but bookings insert failed
-- Fixes: column "room_type_id" does not exist

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

-- Demo bookings
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

select count(*) as booking_count from public.bookings;
