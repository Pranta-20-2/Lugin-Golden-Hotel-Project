-- Room type inventory: total physical units per category

alter table public.room_types
  add column if not exists total_rooms integer not null default 1
  check (total_rooms >= 0);

-- Backfill from existing physical rooms where present
update public.room_types rt
set total_rooms = greatest(
  coalesce(
    (select count(*)::integer from public.rooms r where r.room_type_id = rt.id),
    0
  ),
  1
)
where total_rooms = 1;

-- Client sheet defaults (override when name matches)
update public.room_types set total_rooms = 6 where name = 'Single Room';
update public.room_types set total_rooms = 8 where name = 'Double Room';
update public.room_types set total_rooms = 5 where name = 'Deluxe Room';
update public.room_types set total_rooms = 3 where name = 'Suite Room';
update public.room_types set total_rooms = 2 where name = 'VIP Room';
