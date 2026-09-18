import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { AdminFooter } from "@/components/admin";
import { SidebarInset, SidebarProvider } from "@/components/admin/ui/sidebar";

export default function AdminSharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <AdminFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
