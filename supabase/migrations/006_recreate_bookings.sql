-- Recreate bookings table with correct schema for dashboard preview
-- Use when an older bookings table exists without room_type_id

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
