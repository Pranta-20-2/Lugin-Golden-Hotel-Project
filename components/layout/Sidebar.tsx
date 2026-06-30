"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BuildingIcon,
  CalendarIcon,
  ChartIcon,
  DashboardIcon,
  InvoiceIcon,
  PlusIcon,
  UsersIcon,
} from "@/components/ui/icons";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  quickAdd?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/bookings", label: "Bookings", icon: CalendarIcon, quickAdd: true },
  { href: "/room-types", label: "Room Types", icon: BuildingIcon, quickAdd: true },
  { href: "/customers", label: "Customers", icon: UsersIcon },
  { href: "/booking-groups", label: "Booking Groups", icon: UsersIcon },
  { href: "/invoices", label: "Invoices", icon: InvoiceIcon },
  { href: "/reports", label: "Reports", icon: ChartIcon },
];

type SidebarProps = {
  onNavigate?: () => void;
};

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-sidebar text-white">
      <div className="relative z-10 flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand shadow-lg shadow-brand/30">
          <BuildingIcon className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold leading-tight tracking-wide">
          Al Asdiqa Al Masia Hotel
        </span>
      </div>

      <nav className="relative z-10 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-active font-medium text-white"
                  : "text-slate-300 hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${
                  isActive ? "text-brand" : "text-slate-400 group-hover:text-slate-200"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {item.quickAdd && (
                <PlusIcon className="h-4 w-4 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100" />
              )}
            </Link>
          );
        })}
      </nav>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 translate-y-2 px-3 pb-4 opacity-20"
      >
        <svg
          viewBox="0 0 200 80"
          className="w-full text-white"
          fill="currentColor"
          preserveAspectRatio="xMidYMax meet"
        >
          <rect x="10" y="30" width="20" height="50" rx="2" />
          <rect x="35" y="20" width="18" height="60" rx="2" />
          <rect x="58" y="35" width="22" height="45" rx="2" />
          <rect x="85" y="15" width="16" height="65" rx="2" />
          <rect x="106" y="28" width="24" height="52" rx="2" />
          <rect x="135" y="22" width="18" height="58" rx="2" />
          <rect x="158" y="38" width="20" height="42" rx="2" />
        </svg>
      </div>
    </div>
  );
}
