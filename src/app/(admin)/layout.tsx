import "@/styles/admin-globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-root min-h-screen bg-background text-foreground antialiased">
      <TooltipProvider delayDuration={0}>{children}<Toaster /></TooltipProvider>
    </div>
  );
}