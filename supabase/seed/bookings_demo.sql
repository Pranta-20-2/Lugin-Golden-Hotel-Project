-- Individual bookings demo (room type inventory — no room numbers)
-- Prerequisites: migrations through 017, customers_demo.sql, room_types_demo.sql
-- Safe to re-run: skips rows that already exist by booking_no
--
-- Dates use current_date offsets so availability and list views stay meaningful.

insert into public.bookings (
  booking_no,
  customer_id,
  room_type_id,
  check_in,
  check_out,
  nights,
  rate_per_night,
  total_bill,
  advance_paid,
  due_amount,
  status,
  notes
)
select
  v.booking_no,
  c.id,
  rt.id,
  current_date + v.check_in_offset,
  current_date + v.check_out_offset,
  (current_date + v.check_out_offset) - (current_date + v.check_in_offset),
  rt.rate_per_night,
  ((current_date + v.check_out_offset) - (current_date + v.check_in_offset)) * rt.rate_per_night,
  v.advance_paid,
  ((current_date + v.check_out_offset) - (current_date + v.check_in_offset)) * rt.rate_per_night - v.advance_paid,
  v.status,
  v.notes
from (
  values
    -- Active today (affects Available Today on Room Types)
    ('BK-IND-001', 'Ahmed Al-Rashid', 'Single Room', 0, 3, 1500, 'confirmed', 'Overlaps today'),
    ('BK-IND-002', 'Fatima Al-Harbi', 'Single Room', 0, 2, 3000, 'checked_in', 'Overlaps today'),
    ('BK-IND-003', 'Mohammed Al-Qahtani', 'Double Room', 0, 4, 5000, 'confirmed', 'Overlaps today'),
    ('BK-IND-004', 'Sara Al-Dossari', 'Double Room', 0, 3, 2500, 'confirmed', 'Overlaps today'),
    ('BK-IND-005', 'Khalid Al-Otaibi', 'Double Room', 0, 2, 0, 'checked_in', 'Overlaps today'),
    ('BK-IND-006', 'Noura Al-Shehri', 'Deluxe Room', 0, 3, 7000, 'confirmed', 'Overlaps today'),
    ('BK-IND-007', 'Omar Al-Ghamdi', 'Suite Room', 0, 3, 16500, 'confirmed', 'Overlaps today'),
    ('BK-IND-008', 'Layla Al-Mutairi', 'Suite Room', 0, 2, 11000, 'checked_in', 'Overlaps today'),
    ('BK-IND-009', 'Ahmed Al-Rashid', 'Suite Room', 0, 4, 5500, 'confirmed', 'All suites booked today'),
    ('BK-IND-010', 'Fatima Al-Harbi', 'VIP Room', 0, 3, 16000, 'confirmed', 'Overlaps today'),
    -- Upcoming
    ('BK-IND-011', 'Mohammed Al-Qahtani', 'Deluxe Room', 7, 10, 5000, 'confirmed', 'Family booking — late check-in'),
    ('BK-IND-012', 'Omar Al-Ghamdi', 'Single Room', 3, 5, 3000, 'confirmed', 'Weekend stay'),
    ('BK-IND-013', 'Noura Al-Shehri', 'VIP Room', 14, 18, 0, 'confirmed', 'VIP package — pay on arrival'),
    -- Past / inactive (must not reduce availability today)
    ('BK-IND-014', 'Sara Al-Dossari', 'Double Room', -10, -7, 7500, 'checked_out', 'Paid in full at checkout'),
    ('BK-IND-015', 'Khalid Al-Otaibi', 'Single Room', -5, -2, 4500, 'checked_out', 'Completed stay'),
    ('BK-IND-016', 'Khalid Al-Otaibi', 'Suite Room', 10, 13, 0, 'cancelled', 'Cancelled before arrival'),
    ('BK-IND-017', 'Mohammed Al-Qahtani', 'Single Room', 0, 2, 0, 'cancelled', 'Cancelled — ignored for availability')
) as v(
  booking_no,
  customer_name,
  room_type_name,
  check_in_offset,
  check_out_offset,
  advance_paid,
  status,
  notes
)
join public.customers c on c.name = v.customer_name
join public.room_types rt on rt.name = v.room_type_name
where not exists (
  select 1 from public.bookings b where b.booking_no = v.booking_no
);

-- Individual bookings only
select
  b.booking_no,
  c.name as customer,
  rt.name as room_type,
  b.check_in,
  b.check_out,
  b.nights,
  b.total_bill,
  b.advance_paid,
  b.due_amount,
  b.status
from public.bookings b
join public.customers c on c.id = b.customer_id
join public.room_types rt on rt.id = b.room_type_id
where b.group_id is null
order by b.check_in, b.booking_no;

-- Availability snapshot for tonight
with tonight as (
  select current_date as check_in, current_date + 1 as check_out
),
active_bookings as (
  select b.room_type_id, count(*)::integer as booked_count
  from public.bookings b
  cross join tonight t
  where b.status in ('confirmed', 'checked_in')
    and b.check_in < t.check_out
    and b.check_out > t.check_in
  group by b.room_type_id
)
select
  rt.name,
  rt.total_rooms,
  coalesce(ab.booked_count, 0) as booked_today,
  greatest(rt.total_rooms - coalesce(ab.booked_count, 0), 0) as available_today
from public.room_types rt
left join active_bookings ab on ab.room_type_id = rt.id
order by rt.rate_per_night;
