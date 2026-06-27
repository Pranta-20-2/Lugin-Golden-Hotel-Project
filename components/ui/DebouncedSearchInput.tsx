"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "@/components/ui/icons";

type DebouncedSearchInputProps = {
  placeholder?: string;
  className?: string;
};

function DebouncedSearchInputContent({
  placeholder = "Search...",
  className = "",
}: DebouncedSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const value = search.trim();

      if (value === (searchParams.get("q") ?? "")) {
        return;
      }

      const current = new URLSearchParams(searchParams.toString());

      if (value) {
        current.set("q", value);
      } else {
        current.delete("q");
      }

      current.set("page", "1");

      const query = current.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, search, searchParams]);

  return (
    <div className={`relative ${className}`}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}

export default function DebouncedSearchInput(props: DebouncedSearchInputProps) {
  return (
    <Suspense
      fallback={
        <div className={`relative ${props.className ?? ""}`}>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder={props.placeholder ?? "Search..."}
            disabled
            className="h-10 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-sm text-slate-400 shadow-sm ring-1 ring-slate-200"
          />
        </div>
      }
    >
      <DebouncedSearchInputContent {...props} />
    </Suspense>
  );
}
