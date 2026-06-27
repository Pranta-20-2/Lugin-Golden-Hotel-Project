type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
};

const paddingMap = {
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export default function Card({
  children,
  className = "",
  padding = "md",
}: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 ${paddingMap[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
