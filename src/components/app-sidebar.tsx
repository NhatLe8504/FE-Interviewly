"use client"

import * as React from "react"
import Link from "next/link"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  HelpCircleIcon,
  UsersIcon,
  CreditCardIcon,
  FolderTreeIcon,
  ShieldAlertIcon,
  FileClockIcon,
  Settings2Icon,
  SparklesIcon,
  ShieldCheckIcon,
  GlobeIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Admin",
    email: "admin@interviewly.ai",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Question Bank",
      url: "/admin/questions",
      icon: <HelpCircleIcon />,
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: <UsersIcon />,
    },
    {
      title: "Payments & Revenue",
      url: "/admin/payments",
      icon: <CreditCardIcon />,
    },
    {
      title: "Subscriptions",
      url: "/admin/subscriptions",
      icon: <SparklesIcon />,
    },
    {
      title: "Domains & Roles",
      url: "/admin/domains",
      icon: <FolderTreeIcon />,
    },
    {
      title: "Content Moderation",
      url: "/admin/moderation",
      icon: <ShieldAlertIcon />,
    },
    {
      title: "Audit Logs",
      url: "/admin/audit-logs",
      icon: <FileClockIcon />,
    },
  ],
  documents: [
    {
      name: "Question Explorer",
      url: "/questions",
      icon: <GlobeIcon />,
    },
    {
      name: "Candidate View",
      url: "/practice",
      icon: <SparklesIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Admin Settings",
      url: "/admin/settings",
      icon: <Settings2Icon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/admin">
                <ShieldCheckIcon className="size-5! text-primary" />
                <span className="text-base font-semibold">Interviewly Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}