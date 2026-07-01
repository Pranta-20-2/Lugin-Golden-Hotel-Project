import Link from "next/link";
import { PlusIcon } from "./icons";


interface AddButtonProps {
  href: string;
  children: React.ReactNode;
}

export default function AddButton({
  href,
  children,
}: AddButtonProps) {
  return (
    <Link
      href={href}
      className="
        group inline-flex w-fit shrink-0 justify-self-start
        rounded-xl
        bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600
        p-[2px]
        shadow-md shadow-blue-500/30
        transition-all duration-300
        hover:scale-[1.02]
        hover:shadow-lg hover:shadow-blue-500/40
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-blue-500
        focus-visible:ring-offset-2
      "
    >
      <span
        className="
          inline-flex h-10 items-center justify-center gap-2
          rounded-[10px]
          bg-gradient-to-r from-blue-600 to-indigo-600
          px-4
          text-sm font-semibold text-white
          transition-all duration-300
          group-hover:from-blue-700
          group-hover:to-indigo-700
          whitespace-nowrap
        "
      >
        <PlusIcon className="h-4 w-4 shrink-0" />
        <span>{children}</span>
      </span>
    </Link>
  );
}