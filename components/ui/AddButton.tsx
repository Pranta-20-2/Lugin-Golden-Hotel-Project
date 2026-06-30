import Link from "next/link";
import { PlusIcon } from "@/components/ui/icons";

type AddButtonProps = {
  href: string;
  children: React.ReactNode;
};

export default function AddButton({ href, children }: AddButtonProps) {
  return (
    <Link
      href={href}
      className="group inline-flex max-w-[calc(100vw-2rem)] shrink-0 rounded-xl bg-gradient-to-r from-sky-400 via-primary to-indigo-600 p-[2px] shadow-md shadow-primary/25 transition hover:shadow-lg hover:shadow-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:max-w-none sm:shadow-lg sm:shadow-primary/35"
    >
      <span className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[10px] bg-gradient-to-r from-primary to-blue-600 px-3 text-xs font-semibold text-white transition group-hover:from-primary-dark group-hover:to-indigo-600 sm:gap-2 sm:px-5 sm:text-sm">
        <PlusIcon className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">{children}</span>
      </span>
    </Link>
  );
}
