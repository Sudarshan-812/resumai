import { DashboardIconProvider } from "./dashboard/dashboard-icon-provider";
import DashboardShell from "./dashboard/DashboardShell";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardIconProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardIconProvider>
  );
}
