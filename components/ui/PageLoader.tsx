"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";

type PageLoaderProps = {
  label?: string;
  minHeight?: string;
};

export default function PageLoader({
  label = "Loading",
  minHeight = "min-h-[40vh]",
}: PageLoaderProps) {
  return (
    <div className={`flex w-full items-center justify-center ${minHeight}`}>
      <LoadingSpinner label={label} />
    </div>
  );
}
