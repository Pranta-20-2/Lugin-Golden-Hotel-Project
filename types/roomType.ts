export interface RoomType {
  id: number;
  name: string;
  rate_per_night: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateRoomTypeInput = {
  name: string;
  rate_per_night: number;
  notes?: string;
};

export type UpdateRoomTypeInput = CreateRoomTypeInput;
