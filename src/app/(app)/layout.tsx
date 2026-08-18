import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return (
    <AppShell role={profile?.role ?? "staff"} fullName={profile?.full_name ?? ""}>
      {children}
    </AppShell>
  );
}
