"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowUpRightIcon, BookOpenIcon, CheckCircle2Icon, CrownIcon, StarIcon, UsersIcon } from "lucide-react"

import { DEFAULT_PLANS } from "@/services/billingApi"
import { courseAdminApi } from "@/services/admin/courseAdminApi"
import { useGetPaymentsQuery } from "@/redux/api/admin/paymentApi"
import { useGetPlansQuery } from "@/redux/api/billingApi"
import type { CourseItem } from "@/types/course"
import type { SubscriptionPlan } from "@/types/billing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function formatCount(value?: number) {
  return typeof value === "number" ? value.toLocaleString("vi-VN") : "—"
}

function formatPrice(value: number) {
  if (value === 0) return "Miễn phí"

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value)
}

function getBillingLabel(plan: SubscriptionPlan) {
  switch (plan.billing_cycle) {
    case "weekly":
      return "/ 7 ngày"
    case "monthly":
      return "/ tháng"
    case "yearly":
      return "/ năm"
    default:
      return ""
  }
}

function getPlanPurchaseCount(plan: SubscriptionPlan, paymentPlanNames: Map<string, number>) {
  return paymentPlanNames.get(plan.plan_name.trim().toLowerCase()) ?? 0
}

export function AdminCatalogOverview() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const { data: plansData } = useGetPlansQuery()
  const { data: paymentsData } = useGetPaymentsQuery({ limit: 100 })

  useEffect(() => {
    let isMounted = true

    courseAdminApi
      .getCourses()
      .then((items) => {
        if (isMounted) setCourses(items)
      })
      .catch(() => {
        if (isMounted) setCourses([])
      })
      .finally(() => {
        if (isMounted) setIsLoadingCourses(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const featuredCourses = useMemo(
    () =>
      [...courses]
        .sort((first, second) => {
          const enrollmentDifference = (second.enrolledCount || 0) - (first.enrolledCount || 0)
          return enrollmentDifference || (second.rating || 0) - (first.rating || 0)
        })
        .slice(0, 3),
    [courses]
  )

  const plans = plansData?.length ? plansData : DEFAULT_PLANS
  const paymentPlanNames = useMemo(() => {
    const counts = new Map<string, number>()

    for (const payment of paymentsData?.items ?? []) {
      if (payment.status?.toLowerCase() !== "success" || !payment.plan_name) continue

      const key = payment.plan_name.trim().toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    return counts
  }, [paymentsData?.items])

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Khóa học nổi bật</CardTitle>
          <CardDescription>Ưu tiên theo số lượng học viên và đánh giá.</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href="/admin/courses">
                <span className="hidden sm:inline">Quản lý</span>
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingCourses ? (
            <p className="py-4 text-sm text-muted-foreground">Đang tải danh sách khóa học...</p>
          ) : featuredCourses.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Chưa có khóa học để hiển thị.</p>
          ) : (
            featuredCourses.map((course, index) => (
              <div key={course.id} className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{course.title}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{course.role}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <UsersIcon className="size-3.5" /> {formatCount(course.enrolledCount)} học viên
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <StarIcon className="size-3.5 fill-amber-400 text-amber-400" /> {course.rating.toFixed(2)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BookOpenIcon className="size-3.5" /> {formatCount(course.totalLessonsCount)} bài
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
                  {course.levelLabel}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Các gói đăng ký</CardTitle>
          <CardDescription>Danh mục gói dịch vụ đang cung cấp cho người dùng.</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href="/admin/subscriptions">
                <span className="hidden sm:inline">Quản lý</span>
                <ArrowUpRightIcon className="size-4" />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.plan_id} className="flex items-center gap-3 border-b pb-4 last:border-0 last:pb-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {plan.price === 0 ? <CheckCircle2Icon className="size-4" /> : <CrownIcon className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{plan.plan_name}</p>
                  {plan.is_active ? (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600">
                      Đang bán
                    </Badge>
                  ) : (
                    <Badge variant="outline">Tạm dừng</Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatPrice(plan.price)} {getBillingLabel(plan)} · {getPlanPurchaseCount(plan, paymentPlanNames)} giao dịch gần đây
                </p>
              </div>
              <span className="hidden text-right text-sm font-semibold tabular-nums sm:block">
                {typeof plan.feature_limits?.interview_turns === "number"
                  ? `${plan.feature_limits.interview_turns} lượt`
                  : "—"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
