-- Bookings link to room type inventory (not individual room numbers)

alter table public.bookings
  add column if not exists room_type_id bigint references public.room_types(id) on delete restrict;

create index if not exists bookings_room_type_id_idx on public.bookings (room_type_id);

-- Backfill from assigned physical room when present
update public.bookings b
set room_type_id = r.room_type_id
from public.rooms r
where b.room_id = r.id
  and b.room_type_id is null;

-- Fallback: first room type (legacy rows)
update public.bookings
set room_type_id = (select id from public.room_types order by id limit 1)
where room_type_id is null;

alter table public.bookings
  alter column room_type_id set not null;

-- room_id kept nullable for optional future physical assignment
alter table public.bookings
  alter column room_id drop not null;
