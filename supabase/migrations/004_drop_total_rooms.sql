-- Remove total_rooms from room_types (inventory lives in `rooms` table — Phase 3)
alter table public.room_types drop column if exists total_rooms;
