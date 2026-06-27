-- Group bookings demo (room type inventory — no room numbers)
-- Prerequisites: migrations through 017, customers_demo.sql, room_types_demo.sql
-- Safe to re-run: skips existing group names and booking numbers

-- Contact customer for ABC Company (inline onboarding equivalent)
insert into public.customers (name, mobile, email, address, national_id)
select 'Mr. Imran Khan', '0509876543', 'imran.khan@abc-company.example.com', 'Riyadh', '9988776655'
where not exists (
  select 1 from public.customers c where c.mobile = '0509876543'
);

-- ── Group 1: ABC Company (5 × Double Room) ──────────────────────────────────

insert into public.booking_groups (
  group_name,
  customer_id,
  contact_person,
  mobile,
  check_in,
  check_out,
  status,
  notes
)
select
  'ABC Company',
  c.id,
  c.name,
  c.mobile,
  current_date + 14,
  current_date + 17,
  'confirmed',
  'Corporate block — 5 Double rooms'
from public.customers c
where c.mobile = '0509876543'
  and not exists (
    select 1 from public.booking_groups bg where bg.group_name = 'ABC Company'
  );

with group_row as (
  select id, check_in, check_out, status
  from public.booking_groups
  where group_name = 'ABC Company'
),
type_line as (
  select
    g.id as group_id,
    g.check_in,
    g.check_out,
    g.status,
    rt.id as room_type_id,
    rt.rate_per_night,
    (g.check_out - g.check_in) as nights,
    generate_series(1, 5) as unit_no
  from group_row g
  join public.room_types rt on rt.name = 'Double Room'
)
insert into public.bookings (
  booking_no,
  group_id,
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
  'BK-GRP-ABC-' || lpad(tl.unit_no::text, 2, '0'),
  tl.group_id,
  tl.room_type_id,
  tl.check_in,
  tl.check_out,
  tl.nights,
  tl.rate_per_night,
  tl.nights * tl.rate_per_night,
  case when tl.unit_no = 1 then 15000 else 0 end,
  case
    when tl.unit_no = 1 then (5 * tl.nights * tl.rate_per_night) - 15000
    else tl.nights * tl.rate_per_night
  end,
  tl.status,
  'ABC Company group booking'
from type_line tl
where not exists (
  select 1 from public.bookings b where b.booking_no = 'BK-GRP-ABC-' || lpad(tl.unit_no::text, 2, '0')
);

-- ── Group 2: Al-Rashid Wedding (2 Single + 2 Deluxe) ───────────────────────

insert into public.booking_groups (
  group_name,
  customer_id,
  contact_person,
  mobile,
  check_in,
  check_out,
  status,
  notes
)
select
  'Al-Rashid Wedding',
  c.id,
  c.name,
  c.mobile,
  current_date + 7,
  current_date + 10,
  'confirmed',
  'Wedding party — mixed room types'
from public.customers c
where c.name = 'Ahmed Al-Rashid'
  and not exists (
    select 1 from public.booking_groups bg where bg.group_name = 'Al-Rashid Wedding'
  );

with group_row as (
  select id, check_in, check_out, status
  from public.booking_groups
  where group_name = 'Al-Rashid Wedding'
),
units as (
  select g.id as group_id, g.check_in, g.check_out, g.status, rt.id as room_type_id, rt.rate_per_night,
         (g.check_out - g.check_in) as nights, u.unit_no, u.room_type_name
  from group_row g
  cross join (
    values
      (1, 'Single Room'),
      (2, 'Single Room'),
      (3, 'Deluxe Room'),
      (4, 'Deluxe Room')
  ) as u(unit_no, room_type_name)
  join public.room_types rt on rt.name = u.room_type_name
)
insert into public.bookings (
  booking_no,
  group_id,
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
  'BK-GRP-WED-' || lpad(u.unit_no::text, 2, '0'),
  u.group_id,
  u.room_type_id,
  u.check_in,
  u.check_out,
  u.nights,
  u.rate_per_night,
  u.nights * u.rate_per_night,
  case when u.unit_no = 1 then 10000 else 0 end,
  case
    when u.unit_no = 1 then (4 * u.nights * u.rate_per_night) - 10000
    else u.nights * u.rate_per_night
  end,
  u.status,
  'Al-Rashid Wedding group booking'
from units u
where not exists (
  select 1 from public.bookings b where b.booking_no = 'BK-GRP-WED-' || lpad(u.unit_no::text, 2, '0')
);

-- Summary
select
  bg.group_name,
  bg.contact_person,
  bg.mobile,
  count(b.id) as room_units,
  string_agg(distinct rt.name, ', ' order by rt.name) as room_types,
  bg.check_in,
  bg.check_out,
  bg.status
from public.booking_groups bg
join public.bookings b on b.group_id = bg.id
join public.room_types rt on rt.id = b.room_type_id
where bg.group_name in ('ABC Company', 'Al-Rashid Wedding')
group by bg.id, bg.group_name, bg.contact_person, bg.mobile, bg.check_in, bg.check_out, bg.status
order by bg.group_name;
