import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
      <div className="premium-ambient" aria-hidden="true" />
      <div className="premium-grid" aria-hidden="true" />
      <div className="premium-noise" aria-hidden="true" />
      <div className="premium-particles" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <Sidebar userRole={session.user?.role} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar
          userName={session.user?.name || "Admin"}
          userRole={session.user?.role}
        />
        <main className="flex-1 overflow-auto px-4 pb-8 pt-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
