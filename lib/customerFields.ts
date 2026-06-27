export type CustomerFieldValues = {
  name: string;
  mobile: string;
  email: string;
  address: string;
  national_id: string;
};

export const emptyCustomerFields = (): CustomerFieldValues => ({
  name: "",
  mobile: "",
  email: "",
  address: "",
  national_id: "",
});

export function customerToFieldValues(customer: {
  name: string;
  mobile: string;
  email?: string | null;
  address?: string | null;
  national_id?: string | null;
}): CustomerFieldValues {
  return {
    name: customer.name,
    mobile: customer.mobile,
    email: customer.email ?? "",
    address: customer.address ?? "",
    national_id: customer.national_id ?? "",
  };
}
