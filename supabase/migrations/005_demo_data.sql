-- Demo / preview data for Phase 2 UI (room types + dashboard charts)
-- Safe to re-run: clears demo bookings then re-inserts

delete from public.bookings;

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
