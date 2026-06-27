import Link from "next/link";
import type { PaginatedResult } from "@/types/pagination";

type PaginationProps = Pick<
  PaginatedResult<unknown>,
  "total" | "page" | "pageSize" | "totalPages"
> & {
  basePath: string;
  query?: Record<string, string | undefined | null>;
};

function getPageHref(
  basePath: string,
  page: number,
  pageSize: number,
  query?: Record<string, string | undefined | null>
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) params.set(key, value);
  }

  params.set("page", page.toString());
  params.set("pageSize", pageSize.toString());
  return `${basePath}?${params.toString()}`;
}

export default function Pagination({
  total,
  page,
  pageSize,
  totalPages,
  basePath,
  query,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const previousPage = Math.max(page - 1, 1);
  const nextPage = Math.min(page + 1, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{start}</span> to{" "}
        <span className="font-medium text-slate-700">{end}</span> of{" "}
        <span className="font-medium text-slate-700">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        <Link
          href={getPageHref(basePath, previousPage, pageSize, query)}
          aria-disabled={page <= 1}
          className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium ring-1 ring-slate-200 ${
            page <= 1
              ? "pointer-events-none bg-slate-50 text-slate-300"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Previous
        </Link>
        <span className="text-sm font-medium text-slate-600">
          {page} / {totalPages}
        </span>
        <Link
          href={getPageHref(basePath, nextPage, pageSize, query)}
          aria-disabled={page >= totalPages}
          className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium ring-1 ring-slate-200 ${
            page >= totalPages
              ? "pointer-events-none bg-slate-50 text-slate-300"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
