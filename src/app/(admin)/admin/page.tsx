import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Users, Video, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | Interviewly",
  description: "Users, interviews, subscriptions, payments, and moderation summary.",
};

export default function AdminDashboardPage() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <Badge variant="outline" className="text-xs">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" /> Live
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Tổng quan hệ thống, người dùng, phiên phỏng vấn và doanh thu.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Export Report</Button>
          <Button size="sm">New Question</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews Conducted</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,842</div>
            <p className="text-xs text-muted-foreground">+24% AI sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">412</div>
            <p className="text-xs text-muted-foreground">89% Pro Monthly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Operational</div>
            <p className="text-xs text-muted-foreground">Tailwind + Shadcn UI Ready</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}