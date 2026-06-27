"use client";

import { Suspense } from "react";
import NavigationLoader from "@/components/ui/NavigationLoader";

export default function NavigationLoaderBoundary() {
  return (
    <Suspense fallback={null}>
      <NavigationLoader />
    </Suspense>
  );
}
