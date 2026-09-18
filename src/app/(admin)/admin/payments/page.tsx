"use client";

import React, { useMemo } from "react";
import {
  PaymentSectionCards,
  RevenueAreaChart,
  PaymentDataTable,
  type DailyRevenuePoint,
} from "@/components/admin/payments";
import { Button } from "@/components/admin/ui/button";
import { toast } from "sonner";
import { RefreshCw, RotateCcw, ShieldCheck } from "lucide-react";
import {
  useGetPaymentsQuery,
  useSyncXGateMutation,
} from "@/redux/api/admin/paymentApi";
import { useGetAdminStatsQuery } from "@/redux/api/admin/statsApi";

export default function AdminPaymentsPage() {
  const {
    data: paymentsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetPaymentsQuery();

  const { data: statsData, refetch: refetchStats } = useGetAdminStatsQuery();
  const [syncXGate, { isLoading: isSyncing }] = useSyncXGateMutation();

  const transactions = useMemo(() => {
    return paymentsData?.items || [];
  }, [paymentsData]);

  // Handle manual xGate sync
  const handleSyncXGate = async () => {
    try {
      const res = await syncXGate().unwrap();
      if (res.new_confirmed_count > 0) {
        toast.success(
          `Đồng bộ xGate thành công! Đã tự động xác nhận ${res.new_confirmed_count} đơn hàng mới.`
        );
      } else {
        toast.info(res.message || "Đã đối soát xGate: Không có giao dịch chuyển tiền mới.");
      }
      refetch();
      refetchStats();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Không thể kết nối đối soát với cổng xGate.");
    }
  };

  // Aggregate stats from 100% real database records
  const totalRevenue = useMemo(() => {
    if (statsData && statsData.total_revenue > 0) {
      return statsData.total_revenue;
    }
    return transactions
      .filter((t) => t.status?.toLowerCase() === "success")
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [statsData, transactions]);

  const successTransactionsCount = useMemo(() => {
    return transactions.filter((t) => t.status?.toLowerCase() === "success").length;
  }, [transactions]);

  const payingUsersCount = useMemo(() => {
    const uniqueUserIds = new Set(
      transactions
        .filter((t) => t.status?.toLowerCase() === "success" && t.user_id)
        .map((t) => t.user_id)
    );
    return uniqueUserIds.size;
  }, [transactions]);

  // Compute daily revenue points strictly from real transaction records
  const chartData: DailyRevenuePoint[] = useMemo(() => {
    const map = new Map<string, { revenue: number; count: number }>();

    // Prepare calendar slots for the past 90 days
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      map.set(key, { revenue: 0, count: 0 });
    }

    // Accumulate real transaction values
    transactions.forEach((t) => {
      if (t.status?.toLowerCase() === "success" && (t.paid_at || t.created_at)) {
        const key = new Date(t.paid_at || t.created_at!).toISOString().split("T")[0];
        if (map.has(key)) {
          const entry = map.get(key)!;
          entry.revenue += t.amount;
          entry.count += 1;
        } else {
          map.set(key, { revenue: t.amount, count: 1 });
        }
      }
    });

    return Array.from(map.entries()).map(([date, val]) => ({
      date,
      revenue: val.revenue,
      transactionsCount: val.count,
    }));
  }, [transactions]);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6 pt-4 gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-amber-500" />
          <p className="text-xs text-muted-foreground">
            Cổng thanh toán tự động liên kết tài khoản MB Bank <strong className="text-foreground">9394441571</strong> (LE VAN NHAT) qua xGate API.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncXGate}
            disabled={isSyncing}
            className="gap-1.5 text-xs h-8"
            title="Truy vấn lịch sử giao dịch từ cổng xGate và đối soát tự động"
          >
            <RotateCcw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Đang đối soát..." : "Đồng bộ xGate"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              refetchStats();
            }}
            disabled={isFetching}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
        {/* Top Section Cards */}
        <PaymentSectionCards
          totalRevenue={totalRevenue}
          successCount={successTransactionsCount}
          totalTransactions={transactions.length}
          payingUsersCount={payingUsersCount}
        />

        {/* Interactive Revenue Area Chart */}
        <div className="px-4 lg:px-6">
          <RevenueAreaChart
            data={chartData}
            totalRevenue={totalRevenue}
          />
        </div>

        {/* Transactions Data Table */}
        <PaymentDataTable
          items={transactions}
          isLoading={isLoading}
          isFetching={isFetching}
          onRefresh={() => {
            refetch();
            refetchStats();
          }}
        />
      </div>
    </div>
  );
}
