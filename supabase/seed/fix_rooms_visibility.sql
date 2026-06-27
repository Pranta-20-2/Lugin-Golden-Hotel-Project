-- Fix / verify Rooms visibility for the website
-- Run in Supabase SQL Editor for the same project used by .env.local

-- 1. Ensure client room types exist first.
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

-- 2. Ensure rooms table schema/policies match the app.
create table if not exists public.rooms (
  id bigint generated always as identity primary key,
  room_number text unique not null,
  room_type_id bigint references public.room_types(id) on delete restrict,
  status text not null default 'available'
    check (status in ('available', 'occupied', 'maintenance', 'reserved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists rooms_room_number_key on public.rooms (room_number);
create index if not exists rooms_room_type_id_idx on public.rooms (room_type_id);
create index if not exists rooms_status_idx on public.rooms (status);

alter table public.rooms enable row level security;

drop policy if exists "Authenticated users can select rooms" on public.rooms;
drop policy if exists "Authenticated users can insert rooms" on public.rooms;
drop policy if exists "Authenticated users can update rooms" on public.rooms;
drop policy if exists "Authenticated users can delete rooms" on public.rooms;

create policy "Authenticated users can select rooms"
  on public.rooms for select to authenticated using (true);
create policy "Authenticated users can insert rooms"
  on public.rooms for insert to authenticated with check (true);
create policy "Authenticated users can update rooms"
  on public.rooms for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete rooms"
  on public.rooms for delete to authenticated using (true);

-- 3. Insert demo rooms. This depends on matching room_types.name values.
insert into public.rooms (room_number, room_type_id, status)
select v.room_number, rt.id, v.status
from (
  values
    ('S-101', 'Single Room', 'available'),
    ('S-102', 'Single Room', 'available'),
    ('S-103', 'Single Room', 'reserved'),
    ('S-104', 'Single Room', 'occupied'),
    ('S-105', 'Single Room', 'maintenance'),
    ('S-106', 'Single Room', 'available'),
    ('D-201', 'Double Room', 'available'),
    ('D-202', 'Double Room', 'reserved'),
    ('D-203', 'Double Room', 'occupied'),
    ('D-204', 'Double Room', 'available'),
    ('D-205', 'Double Room', 'maintenance'),
    ('D-206', 'Double Room', 'available'),
    ('D-207', 'Double Room', 'reserved'),
    ('D-208', 'Double Room', 'available'),
    ('DX-301', 'Deluxe Room', 'available'),
    ('DX-302', 'Deluxe Room', 'occupied'),
    ('DX-303', 'Deluxe Room', 'reserved'),
    ('DX-304', 'Deluxe Room', 'available'),
    ('DX-305', 'Deluxe Room', 'maintenance'),
    ('ST-401', 'Suite Room', 'available'),
    ('ST-402', 'Suite Room', 'reserved'),
    ('ST-403', 'Suite Room', 'occupied'),
    ('VIP-501', 'VIP Room', 'available'),
    ('VIP-502', 'VIP Room', 'reserved')
) as v(room_number, room_type_name, status)
join public.room_types rt on rt.name = v.room_type_name
on conflict (room_number) do update set
  room_type_id = excluded.room_type_id,
  status = excluded.status,
  updated_at = now();

-- 4. Verify. Expected room_type_count = 5 and room_count = 24.
select
  (select count(*) from public.room_types) as room_type_count,
  (select count(*) from public.rooms) as room_count;

select r.room_number, rt.name as room_type, r.status
from public.rooms r
left join public.room_types rt on rt.id = r.room_type_id
order by r.room_number;
