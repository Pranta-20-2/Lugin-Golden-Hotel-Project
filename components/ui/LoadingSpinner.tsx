"use client";

import { CirclesWithBar } from "react-loader-spinner";

const LOADER_BLUE = "#3b82f6";

type LoadingSpinnerProps = {
  height?: number | string;
  width?: number | string;
  visible?: boolean;
  label?: string;
  className?: string;
};

export default function LoadingSpinner({
  height = 100,
  width = 100,
  visible = true,
  label = "Loading",
  className = "",
}: LoadingSpinnerProps) {
  if (!visible) return null;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <CirclesWithBar
        height={String(height)}
        width={String(width)}
        color={LOADER_BLUE}
        outerCircleColor={LOADER_BLUE}
        innerCircleColor={LOADER_BLUE}
        barColor={LOADER_BLUE}
        ariaLabel={`${label}…`}
        wrapperStyle={{}}
        wrapperClass=""
        visible
      />
      {label ? (
        <p className="text-sm font-medium text-slate-500">{label}…</p>
      ) : null}
    </div>
  );
}

export { LOADER_BLUE };
