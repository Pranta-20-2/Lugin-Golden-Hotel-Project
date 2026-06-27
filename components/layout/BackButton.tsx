import Link from "next/link";
import { ChevronLeftIcon } from "@/components/ui/icons";

type BackButtonProps = {
  href: string;
  label?: string;
};

export default function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
    >
      <ChevronLeftIcon className="h-4 w-4" />
      {label}
    </Link>
  );
}
