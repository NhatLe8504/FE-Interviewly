"use client"

import * as React from "react"
import Link from "next/link"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { useAuth } from "@/context/AuthContext"
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
  CompassIcon,
  GraduationCapIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Admin",
    email: "admin@interviewly.ai",
    avatar: "",
  },
  navMain: [
    {
      title: "Tổng quan",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Ngân hàng câu hỏi",
      url: "/admin/questions",
      icon: <HelpCircleIcon />,
    },
    {
      title: "Thư viện khóa học",
      url: "/admin/courses",
      icon: <GraduationCapIcon />,
    },
    {
      title: "Quản lý người dùng",
      url: "/admin/users",
      icon: <UsersIcon />,
    },
    {
      title: "Thanh toán & Doanh thu",
      url: "/admin/payments",
      icon: <CreditCardIcon />,
    },
    {
      title: "Gói đăng ký",
      url: "/admin/subscriptions",
      icon: <SparklesIcon />,
    },
    {
      title: "Luồng giới thiệu",
      url: "/admin/onboarding",
      icon: <CompassIcon />,
    },
    {
      title: "Ngành nghề & Vai trò",
      url: "/admin/domains",
      icon: <FolderTreeIcon />,
    },
    {
      title: "Kiểm duyệt nội dung",
      url: "/admin/moderation",
      icon: <ShieldAlertIcon />,
    },
    {
      title: "Nhật ký hệ thống",
      url: "/admin/audit-logs",
      icon: <FileClockIcon />,
    },
  ],
  documents: [
    {
      name: "Khám phá câu hỏi",
      url: "/questions",
      icon: <GlobeIcon />,
    },
    {
      name: "Giao diện ứng viên",
      url: "/practice",
      icon: <SparklesIcon />,
    },
  ],
  navSecondary: [
    {
      title: "Cài đặt hệ thống",
      url: "/admin/settings",
      icon: <Settings2Icon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const currentUser = {
    name: user?.full_name || "Admin",
    email: user?.email || "admin@interviewly.ai",
    avatar: "",
  };
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
                <span className="text-base font-semibold">Quản trị Interviewly</span>
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
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}