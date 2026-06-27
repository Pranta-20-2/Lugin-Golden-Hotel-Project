export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email?: string | null;
  address?: string | null;
  national_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreateCustomerInput = {
  name: string;
  mobile: string;
  email?: string | null;
  address?: string | null;
  national_id?: string | null;
};

export type UpdateCustomerInput = CreateCustomerInput;
