import Link from "next/link";
import Card from "@/components/ui/Card";

export type DetailField = {
  label: string;
  value: React.ReactNode;
};

type DetailViewProps = {
  title: string;
  subtitle?: string;
  editHref?: string;
  deleteSlot?: React.ReactNode;
  extraActions?: React.ReactNode;
  fields: DetailField[];
};

export default function DetailView({
  title,
  subtitle,
  editHref,
  deleteSlot,
  extraActions,
  fields,
}: DetailViewProps) {
  return (
    <Card>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className="no-print flex flex-wrap gap-2">
          {extraActions}
          {editHref ? (
            <Link
              href={editHref}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-50 px-4 text-sm font-semibold text-primary transition hover:bg-blue-100"
            >
              Edit
            </Link>
          ) : null}
          {deleteSlot}
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100"
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {field.label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-slate-900 break-words">
              {field.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export { formatDate };
