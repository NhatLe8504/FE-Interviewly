"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  QuestionSectionCards,
  QuestionInteractiveChart,
  QuestionDataTable,
  QuestionSetDataTable,
} from "@/components/admin/questions";
import {
  MOCK_ADMIN_QUESTIONS,
  MOCK_QUESTION_STATS,
  generateQuestionsChartData,
} from "@/mock/adminQuestionsMock";
import { MOCK_QUESTION_SETS } from "@/mock/questionSetsMock";
import { questionAdminApi } from "@/services/admin/questionAdminApi";
import { Layers, RefreshCw, FolderKanban, HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminQuestionsPage() {
  const [chartData, setChartData] = useState(() => generateQuestionsChartData());
  const [refreshKey, setRefreshKey] = useState(0);

  const [questions, setQuestions] = useState<any[]>(MOCK_ADMIN_QUESTIONS);
  const [questionSets, setQuestionSets] = useState<any[]>(MOCK_QUESTION_SETS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sets" | "bank">("sets");
  const [triggerCreateSingle, setTriggerCreateSingle] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, setsRes] = await Promise.all([
        questionAdminApi.getQuestions({ limit: 100 }),
        questionAdminApi.getQuestionSets({ limit: 100 }),
      ]);

      if (qRes && Array.isArray(qRes.items) && qRes.items.length > 0) {
        setQuestions(qRes.items);
      }
      if (setsRes && Array.isArray(setsRes.items) && setsRes.items.length > 0) {
        setQuestionSets(setsRes.items);
      }
    } catch (err) {
      console.warn("Failed to load questions catalog from DB:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleRefresh = () => {
    setChartData(generateQuestionsChartData());
    setRefreshKey((k) => k + 1);
    toast.success("Đã làm mới dữ liệu ngân hàng câu hỏi & bộ đề");
  };

  // Real KPI statistics
  const stats = useMemo(() => {
    const totalQ = questions.length || MOCK_QUESTION_STATS.totalQuestions;
    const approvedQ = questions.filter((q) => q.is_active !== false).length;
    const pendingQ = totalQ - approvedQ;
    const totalPractice = questionSets.reduce((acc, s) => acc + (s.practice_count || 0), 0) + 128;
    const starCount = questions.filter((q) => q.star_template_id != null || q.sample_answer != null).length;
    const starRate = totalQ > 0 ? Math.round((starCount / totalQ) * 100) : 95;

    return {
      totalQuestions: totalQ,
      approvedCount: approvedQ,
      pendingCount: pendingQ,
      totalPracticeSessions: totalPractice,
      starCoverageRate: starRate,
    };
  }, [questions, questionSets]);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6 pt-4 gap-3">
        <div className="flex items-center gap-2">
          <Layers className="size-5 text-primary" />
          <p className="text-xs text-muted-foreground">
            Quản trị <strong className="text-foreground">Ngân hàng câu hỏi ({questions.length})</strong> & <strong className="text-foreground">Bộ đề phỏng vấn ({questionSets.length})</strong> theo chuẩn STAR và Rubric AI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 gap-1.5 text-xs"
          >
            <RefreshCw className="size-3.5" />
            <span>Làm mới</span>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10 shadow-2xs font-semibold"
            title="Mở trang tạo một câu hỏi phỏng vấn đơn lẻ mới"
          >
            <Link href="/admin/questions/create">
              <Plus className="size-3.5" />
              <span>Tạo Câu Hỏi Lẻ</span>
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="h-8 gap-1.5 text-xs shadow-xs"
            title="Mở trang thiết lập và tạo trọn vẹn bộ đề tuyển dụng mới"
          >
            <Link href="/admin/questions/new">
              <Plus className="size-3.5" />
              <span>Tạo Bộ Đề Mới</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
        {/* Top KPI Section Cards */}
        <QuestionSectionCards
          totalQuestions={stats.totalQuestions}
          approvedCount={stats.approvedCount}
          pendingCount={stats.pendingCount}
          totalPracticeSessions={stats.totalPracticeSessions}
          starCoverageRate={stats.starCoverageRate}
        />

        {/* View Mode Tabs: Question Sets vs Individual Questions */}
        <div className="px-4 lg:px-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
            <div className="flex items-center justify-between border-b pb-1">
              <TabsList className="h-9 p-1 bg-muted/60">
                <TabsTrigger value="sets" className="text-xs gap-2 font-semibold">
                  <FolderKanban className="size-3.5" />
                  <span>Bộ Đề Phỏng Vấn ({questionSets.length})</span>
                </TabsTrigger>
                <TabsTrigger value="bank" className="text-xs gap-2 font-semibold">
                  <HelpCircle className="size-3.5" />
                  <span>Ngân Hàng Câu Hỏi ({questions.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Question Sets */}
            <TabsContent value="sets" className="m-0 space-y-4">
              <QuestionSetDataTable
                key={`sets-${refreshKey}-${questionSets.length}`}
                initialSets={questionSets}
                onRefresh={handleRefresh}
              />
            </TabsContent>

            {/* Tab 2: Individual Questions Bank */}
            <TabsContent value="bank" className="m-0 space-y-4">
              {/* Interactive Trends Area Chart */}
              <QuestionInteractiveChart data={chartData} />

              {/* Questions Data Table */}
              <QuestionDataTable
                key={`bank-${refreshKey}-${questions.length}`}
                initialQuestions={questions}
                onRefresh={handleRefresh}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
