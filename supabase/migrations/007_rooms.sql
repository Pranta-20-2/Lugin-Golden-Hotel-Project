-- Rooms table for Phase 3
create table if not exists public.rooms (
  id bigint generated always as identity primary key,
  room_number text unique not null,
  room_type_id bigint references public.room_types(id) on delete restrict,
  status text not null default 'available'
    check (status in ('available', 'occupied', 'maintenance', 'reserved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rooms_room_type_id_idx on public.rooms (room_type_id);
create index if not exists rooms_status_idx on public.rooms (status);

update public.rooms set status = 'available' where status is null;

alter table public.rooms
  alter column status set default 'available',
  alter column status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_status_check'
  ) then
    alter table public.rooms
      add constraint rooms_status_check
      check (status in ('available', 'occupied', 'maintenance', 'reserved'));
  end if;
end $$;

alter table public.rooms enable row level security;

drop policy if exists "Authenticated users can select rooms" on public.rooms;
drop policy if exists "Authenticated users can insert rooms" on public.rooms;
drop policy if exists "Authenticated users can update rooms" on public.rooms;
drop policy if exists "Authenticated users can delete rooms" on public.rooms;

create policy "Authenticated users can select rooms"
  on public.rooms for select
  to authenticated
  using (true);

create policy "Authenticated users can insert rooms"
  on public.rooms for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update rooms"
  on public.rooms for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete rooms"
  on public.rooms for delete
  to authenticated
  using (true);
