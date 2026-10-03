import { AdminQuickActions } from "@/components/admin/AdminQuickActions"
import { AdminSystemOverview } from "@/components/admin/AdminSystemOverview"
import { SectionCards } from "@/components/section-cards"

export default function AdminDashboardPage() {
  return (
    <div className="@container/main flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <AdminSystemOverview />
        <AdminQuickActions />
      </div>
    </div>
  )
}
