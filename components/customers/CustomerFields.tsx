"use client";

import type { CustomerFieldValues } from "@/lib/customerFields";

const inputClass =
  "h-11 w-full rounded-xl border-0 bg-slate-50 px-4 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary";

const textareaClass =
  "min-h-24 w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm text-slate-800 ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary";

type CustomerFieldsProps = {
  values: CustomerFieldValues;
  onChange: (values: CustomerFieldValues) => void;
  idPrefix?: string;
  nameLabel?: string;
};

export default function CustomerFields({
  values,
  onChange,
  idPrefix = "customer",
  nameLabel = "Customer Name",
}: CustomerFieldsProps) {
  function updateField<K extends keyof CustomerFieldValues>(
    field: K,
    value: CustomerFieldValues[K]
  ) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${idPrefix}-name`}
            className="mb-1.5 block text-sm font-medium text-slate-600"
          >
            {nameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id={`${idPrefix}-name`}
            type="text"
            required
            value={values.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={inputClass}
            placeholder="Guest name"
          />
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-mobile`}
            className="mb-1.5 block text-sm font-medium text-slate-600"
          >
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            id={`${idPrefix}-mobile`}
            type="tel"
            required
            value={values.mobile}
            onChange={(e) => updateField("mobile", e.target.value)}
            className={inputClass}
            placeholder="e.g. 0501234567"
          />
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-email`}
            className="mb-1.5 block text-sm font-medium text-slate-600"
          >
            Email <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id={`${idPrefix}-email`}
            type="email"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-nationalId`}
            className="mb-1.5 block text-sm font-medium text-slate-600"
          >
            National ID <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id={`${idPrefix}-nationalId`}
            type="text"
            value={values.national_id}
            onChange={(e) => updateField("national_id", e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-address`}
          className="mb-1.5 block text-sm font-medium text-slate-600"
        >
          Address <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id={`${idPrefix}-address`}
          value={values.address}
          onChange={(e) => updateField("address", e.target.value)}
          className={textareaClass}
          placeholder="Optional"
        />
      </div>
    </div>
  );
}
