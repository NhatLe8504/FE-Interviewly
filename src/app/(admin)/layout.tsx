import "@/styles/admin-globals.css";
import { TooltipProvider } from "@/components/admin/ui/tooltip";
import { Toaster } from "@/components/admin/ui/sonner";
import { AdminRoleGuard } from "@/components/auth/AdminRoleGuard";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-root min-h-screen bg-background text-foreground antialiased">
      <TooltipProvider delayDuration={0}>
        <AdminRoleGuard>{children}</AdminRoleGuard>
        <Toaster />
      </TooltipProvider>
    </div>
  );
}
