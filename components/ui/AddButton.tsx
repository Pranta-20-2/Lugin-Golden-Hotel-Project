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
      className="group relative inline-flex shrink-0 rounded-xl bg-gradient-to-r from-sky-400 via-primary to-indigo-600 p-[2px] shadow-lg shadow-primary/35 transition hover:shadow-xl hover:shadow-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <span className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-primary to-blue-600 px-5 text-sm font-semibold text-white transition group-hover:from-primary-dark group-hover:to-indigo-600">
        <PlusIcon className="h-4 w-4" />
        {children}
      </span>
    </Link>
  );
}
