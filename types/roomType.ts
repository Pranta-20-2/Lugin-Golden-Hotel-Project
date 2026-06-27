export interface RoomType {
  id: number;
  name: string;
  rate_per_night: number;
  total_rooms: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type RoomTypeWithAvailability = RoomType & {
  booked_count: number;
  available_count: number;
};

export type CreateRoomTypeInput = {
  name: string;
  rate_per_night: number;
  total_rooms: number;
  notes?: string;
};

export type UpdateRoomTypeInput = CreateRoomTypeInput;
