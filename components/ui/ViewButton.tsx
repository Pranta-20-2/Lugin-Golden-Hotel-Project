import Link from "next/link";

type ViewButtonProps = {
  href: string;
  className?: string;
};

export default function ViewButton({ href, className = "" }: ViewButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 w-full items-center justify-center rounded-lg bg-emerald-50 px-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 sm:w-auto ${className}`}
    >
      View
    </Link>
  );
}
