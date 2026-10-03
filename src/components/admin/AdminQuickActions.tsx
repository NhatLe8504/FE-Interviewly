import Link from "next/link"
import {
  ArrowUpRightIcon,
  CreditCardIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  UsersIcon,
} from "lucide-react"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const actions = [
  {
    href: "/admin/courses",
    title: "Quản lý khóa học",
    description: "Tạo lộ trình, chương và bài học mới.",
    icon: GraduationCapIcon,
  },
  {
    href: "/admin/questions",
    title: "Ngân hàng câu hỏi",
    description: "Kiểm duyệt và cập nhật nội dung phỏng vấn.",
    icon: HelpCircleIcon,
  },
  {
    href: "/admin/users",
    title: "Quản lý người dùng",
    description: "Theo dõi tài khoản, vai trò và trạng thái.",
    icon: UsersIcon,
  },
  {
    href: "/admin/payments",
    title: "Thanh toán & doanh thu",
    description: "Theo dõi giao dịch và đối soát xGate.",
    icon: CreditCardIcon,
  },
]

export function AdminQuickActions() {
  return (
    <section className="flex flex-col gap-4 px-4 lg:px-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Truy cập nhanh</h2>
        <p className="text-sm text-muted-foreground">
          Các khu vực quản trị được sử dụng thường xuyên.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link key={action.href} href={action.href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-primary/[0.02]">
                <CardHeader>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                  <CardAction>
                    <ArrowUpRightIcon className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </CardAction>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
