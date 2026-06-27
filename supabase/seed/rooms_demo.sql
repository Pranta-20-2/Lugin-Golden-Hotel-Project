-- Demo rooms for Phase 3 preview
-- Requires room_types seed to be present first

insert into public.rooms (room_number, room_type_id, status)
select v.room_number, rt.id, v.status
from (
  values
    ('S-101', 'Single Room', 'available'),
    ('S-102', 'Single Room', 'available'),
    ('S-103', 'Single Room', 'reserved'),
    ('S-104', 'Single Room', 'occupied'),
    ('S-105', 'Single Room', 'maintenance'),
    ('S-106', 'Single Room', 'available'),
    ('D-201', 'Double Room', 'available'),
    ('D-202', 'Double Room', 'reserved'),
    ('D-203', 'Double Room', 'occupied'),
    ('D-204', 'Double Room', 'available'),
    ('D-205', 'Double Room', 'maintenance'),
    ('D-206', 'Double Room', 'available'),
    ('D-207', 'Double Room', 'reserved'),
    ('D-208', 'Double Room', 'available'),
    ('DX-301', 'Deluxe Room', 'available'),
    ('DX-302', 'Deluxe Room', 'occupied'),
    ('DX-303', 'Deluxe Room', 'reserved'),
    ('DX-304', 'Deluxe Room', 'available'),
    ('DX-305', 'Deluxe Room', 'maintenance'),
    ('ST-401', 'Suite Room', 'available'),
    ('ST-402', 'Suite Room', 'reserved'),
    ('ST-403', 'Suite Room', 'occupied'),
    ('VIP-501', 'VIP Room', 'available'),
    ('VIP-502', 'VIP Room', 'reserved')
) as v(room_number, room_type_name, status)
join public.room_types rt on rt.name = v.room_type_name
on conflict (room_number) do update set
  room_type_id = excluded.room_type_id,
  status = excluded.status,
  updated_at = now();

select room_number, status from public.rooms order by room_number;
