import AppShell from "@/components/layout/AppShell";
import NavigationLoaderBoundary from "@/components/ui/NavigationLoaderBoundary";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationLoaderBoundary />
      <AppShell>{children}</AppShell>
    </>
  );
}
