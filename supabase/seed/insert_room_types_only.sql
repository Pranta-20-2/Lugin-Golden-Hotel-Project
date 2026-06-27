-- Paste into Supabase → SQL Editor → Run
-- Step 1: ensure unique name index exists (needed for upsert)
create unique index if not exists room_types_name_key on public.room_types (name);

-- Step 2: insert client room types
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

-- Step 3: verify
select id, name, rate_per_night, notes from public.room_types order by name;
