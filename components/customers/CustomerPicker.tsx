"use client";

import type { Customer } from "@/types/customer";
import type { CustomerFieldValues } from "@/lib/customerFields";
import SearchableSelect from "@/components/ui/SearchableSelect";
import CustomerFields from "@/components/customers/CustomerFields";

export type CustomerPickerMode = "existing" | "new";

type CustomerPickerProps = {
  mode: CustomerPickerMode;
  onModeChange: (mode: CustomerPickerMode) => void;
  customers: Customer[];
  customerId: string;
  onCustomerIdChange: (customerId: string) => void;
  newCustomer: CustomerFieldValues;
  onNewCustomerChange: (values: CustomerFieldValues) => void;
  showModeToggle?: boolean;
};

export default function CustomerPicker({
  mode,
  onModeChange,
  customers,
  customerId,
  onCustomerIdChange,
  newCustomer,
  onNewCustomerChange,
  showModeToggle = true,
}: CustomerPickerProps) {
  const customerOptions = customers.map((customer) => ({
    value: String(customer.id),
    label: `${customer.name} (${customer.mobile})`,
    searchText: `${customer.name} ${customer.mobile} ${customer.email ?? ""}`,
  }));

  return (
    <div className="space-y-3">
      {showModeToggle && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onModeChange("existing")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition ${
              mode === "existing"
                ? "bg-primary text-white ring-primary"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            Existing customer
          </button>
          <button
            type="button"
            onClick={() => onModeChange("new")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition ${
              mode === "new"
                ? "bg-primary text-white ring-primary"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            New customer
          </button>
        </div>
      )}

      {mode === "existing" ? (
        <div>
          <SearchableSelect
            id="bookingCustomerId"
            value={customerId}
            onChange={onCustomerIdChange}
            options={customerOptions}
            placeholder="Select customer"
            searchPlaceholder="Search by name or mobile…"
            required
            disabled={customers.length === 0}
            emptyMessage="No customers found"
          />
          {customers.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-700">
              No customers yet. Switch to New customer to add guest details here.
            </p>
          )}
        </div>
      ) : (
        <CustomerFields
          values={newCustomer}
          onChange={onNewCustomerChange}
          idPrefix="booking-new-customer"
        />
      )}
    </div>
  );
}
