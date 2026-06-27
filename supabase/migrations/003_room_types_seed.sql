-- Client room setup data (Phase 2 — room types only)
-- Room counts from client sheet will become individual rows in `rooms` table (Phase 3)
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
