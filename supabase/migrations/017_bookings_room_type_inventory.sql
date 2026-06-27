-- Bookings use room type inventory only (no physical room numbers)

drop index if exists public.bookings_room_id_idx;

alter table public.bookings
  drop column if exists room_id;

-- Ensure room-type model is enforced
alter table public.bookings
  alter column room_type_id set not null;

comment on column public.bookings.room_type_id is
  'Room category; availability = room_types.total_rooms minus overlapping confirmed/checked_in bookings';

comment on column public.bookings.group_id is
  'Set when this row is a child unit of a group booking; individual bookings have customer_id instead';
