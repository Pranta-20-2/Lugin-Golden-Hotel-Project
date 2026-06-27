-- Room types seed (client sheet)
-- Prerequisites: migration 014 (room_types.total_rooms column)
-- Safe to re-run: upserts by unique name
--
-- Next: bookings_demo.sql, booking_groups_demo.sql (see seed/README.md)

create unique index if not exists room_types_name_key on public.room_types (name);

insert into public.room_types (name, rate_per_night, total_rooms, notes)
values
  ('Single Room', 1500, 6, 'For 1 person'),
  ('Double Room', 2500, 8, 'For 2 people'),
  ('Deluxe Room', 3500, 5, 'AC, for 2 people'),
  ('Suite Room', 5500, 3, 'Includes living space'),
  ('VIP Room', 8000, 2, 'Premium')
on conflict (name) do update set
  rate_per_night = excluded.rate_per_night,
  total_rooms = excluded.total_rooms,
  notes = excluded.notes,
  updated_at = now();

select id, name, rate_per_night, total_rooms, notes
from public.room_types
order by rate_per_night;
