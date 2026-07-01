"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/ui/icons";

type BackButtonProps = {
  href?: string;
  label?: string;
  useHistoryBack?: boolean;
};

const buttonClassName =
  "no-print mb-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900";

export default function BackButton({
  href,
  label = "Back",
  useHistoryBack = false,
}: BackButtonProps) {
  const router = useRouter();

  if (useHistoryBack) {
    return (
      <button
        type="button"
        onClick={() => router.back()}
        className={buttonClassName}
      >
        <ChevronLeftIcon className="h-4 w-4" />
        {label}
      </button>
    );
  }

  if (!href) return null;

  return (
    <Link href={href} className={buttonClassName}>
      <ChevronLeftIcon className="h-4 w-4" />
      {label}
    </Link>
  );
}
