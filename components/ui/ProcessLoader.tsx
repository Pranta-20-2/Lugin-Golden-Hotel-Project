"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";

type ProcessLoaderProps = {
  visible: boolean;
  label?: string;
};

export default function ProcessLoader({
  visible,
  label = "Processing",
}: ProcessLoaderProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
      <LoadingSpinner label={label} />
    </div>
  );
}
