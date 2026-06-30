import Link from "next/link";

export type FilterTabItem = {
  href: string;
  label: string;
  active: boolean;
};

type FilterTabsProps = {
  label?: string;
  tabs: FilterTabItem[];
};

export default function FilterTabs({ label, tabs }: FilterTabsProps) {
  return (
    <div className="space-y-2">
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex min-h-10 items-center justify-center rounded-xl px-2 py-2 text-center text-xs font-semibold ring-1 transition sm:min-h-0 sm:inline-flex sm:px-4 sm:text-sm ${
              tab.active
                ? "bg-primary text-white ring-primary"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
