"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";
import BackButton from "@/components/layout/BackButton";
import { CloseIcon } from "@/components/ui/icons";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/room-types": "Room Types",
  "/room-types/new": "Add Room Type",
  "/rooms": "Rooms",
  "/rooms/new": "Add Room",
  "/customers/new": "Add Customer",
  "/customers": "Customers",
  "/bookings/new": "Add Booking",
  "/bookings": "Bookings",
  "/booking-groups/new": "Add Group Booking",
  "/booking-groups": "Booking Groups",
  "/invoices": "Invoices",
  "/reports": "Reports",
};

const sidebarRoutes = new Set([
  "/dashboard",
  "/room-types",
  "/rooms",
  "/customers",
  "/bookings",
  "/booking-groups",
  "/invoices",
  "/reports",
]);

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (/^\/room-types\/\d+$/.test(pathname)) return "Room Type Details";
  if (/^\/room-types\/\d+\/edit$/.test(pathname)) return "Edit Room Type";
  if (/^\/rooms\/\d+$/.test(pathname)) return "Room Details";
  if (/^\/rooms\/\d+\/edit$/.test(pathname)) return "Edit Room";
  if (/^\/customers\/\d+$/.test(pathname)) return "Customer Details";
  if (/^\/customers\/\d+\/edit$/.test(pathname)) return "Edit Customer";
  if (/^\/bookings\/\d+$/.test(pathname)) return "Booking Details";
  if (/^\/bookings\/\d+\/edit$/.test(pathname)) return "Edit Booking";
  if (/^\/booking-groups\/\d+$/.test(pathname)) return "Group Booking Details";
  if (/^\/booking-groups\/\d+\/edit$/.test(pathname)) return "Edit Group Booking";
  if (/^\/invoices\/\d+$/.test(pathname)) return "Invoice Details";
  return "Dashboard";
}

function getBackHref(pathname: string): string | null {
  if (sidebarRoutes.has(pathname)) return null;

  const editMatch = pathname.match(
    /^\/(room-types|rooms|customers|bookings|booking-groups)\/(\d+)\/edit$/
  );
  if (editMatch) return `/${editMatch[1]}/${editMatch[2]}`;

  const detailMatch = pathname.match(
    /^\/(room-types|rooms|customers|bookings|booking-groups|invoices)\/\d+$/
  );
  if (detailMatch) return `/${detailMatch[1]}`;

  if (pathname.startsWith("/room-types/")) return "/room-types";
  if (pathname.startsWith("/rooms/")) return "/rooms";
  if (pathname.startsWith("/customers/")) return "/customers";
  if (pathname.startsWith("/bookings/")) return "/bookings";
  if (pathname.startsWith("/booking-groups/")) return "/booking-groups";
  if (pathname.startsWith("/invoices/")) return "/invoices";

  const parent = `/${pathname.split("/").filter(Boolean)[0]}`;
  return sidebarRoutes.has(parent) ? parent : null;
}

function getBackLabel(href: string, pathname: string): string {
  const editMatch = pathname.match(
    /^\/(room-types|rooms|customers|bookings|booking-groups)\/(\d+)\/edit$/
  );
  if (editMatch && href === `/${editMatch[1]}/${editMatch[2]}`) {
    return "Back to Details";
  }
  return `Back to ${pageTitles[href] ?? "Previous"}`;
}

function getDisplayName(email?: string | null, fullName?: string | null) {
  if (fullName?.trim()) return fullName.trim();
  if (email) {
    const local = email.split("@")[0];
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return "Admin";
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Admin");
  const [userInitials, setUserInitials] = useState("AD");

  const title = getPageTitle(pathname);
  const backHref = getBackHref(pathname);
  const backLabel = backHref ? getBackLabel(backHref, pathname) : "";

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const name = getDisplayName(
        user.email,
        user.user_metadata?.full_name as string | undefined
      );
      setUserName(name);
      setUserInitials(getInitials(name));
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[min(85vw,280px)] transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute right-3 top-5 flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-hover text-white"
            aria-label="Close sidebar"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <TopHeader
          title={title}
          userName={userName}
          userInitials={userInitials}
          onMenuClick={() => setSidebarOpen(true)}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {backHref && <BackButton href={backHref} label={backLabel} />}
          {children}
        </main>
      </div>
    </div>
  );
}
