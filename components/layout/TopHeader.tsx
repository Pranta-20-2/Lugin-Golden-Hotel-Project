"use client";

import { LogOutIcon, MenuIcon } from "@/components/ui/icons";

type TopHeaderProps = {
  title: string;
  userName: string;
  userInitials: string;
  onMenuClick: () => void;
  onSignOut: () => void;
};

export default function TopHeader({
  title,
  userName,
  userInitials,
  onMenuClick,
  onSignOut,
}: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-surface/95 backdrop-blur-md">
      <div className="flex min-h-16 items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-slate-900 sm:text-xl">
          {title}
        </h1>

        <div className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white py-1.5 pl-1.5 pr-3 shadow-sm ring-1 ring-slate-200">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 text-xs font-bold text-white">
              {userInitials}
            </div>
            <span className="max-w-[100px] truncate text-sm font-medium text-slate-700 sm:max-w-[140px]">
              {userName}
            </span>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600 sm:px-4"
            aria-label="Logout"
          >
            <LogOutIcon className="h-4 w-4" />
            <span className="hidden text-sm font-medium sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
