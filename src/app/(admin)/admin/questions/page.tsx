"use client";

import React, { useState } from "react";
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
import { MOCK_QUESTION_SETS, MOCK_QUESTION_SET_STATS } from "@/mock/questionSetsMock";
import { Layers, RefreshCw, FolderKanban, HelpCircle, Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminQuestionsPage() {
  const [chartData, setChartData] = useState(() => generateQuestionsChartData());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setChartData(generateQuestionsChartData());
    setRefreshKey((k) => k + 1);
    toast.success("Đã làm mới dữ liệu ngân hàng câu hỏi & bộ đề");
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      {/* Top Banner Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6 pt-4 gap-3">
        <div className="flex items-center gap-2">
          <Layers className="size-5 text-primary" />
          <p className="text-xs text-muted-foreground">
            Quản trị <strong className="text-foreground">Ngân hàng câu hỏi</strong> & <strong className="text-foreground">Bộ đề phỏng vấn chuẩn hóa</strong> theo phương pháp STAR và Rubric AI.
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
            size="sm"
            className="h-8 gap-1.5 text-xs shadow-xs"
          >
            <Link href="/admin/questions/new">
              <Plus className="size-3.5" />
              <span>Tạo Bộ Câu Hỏi Mới</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
        {/* Top KPI Section Cards */}
        <QuestionSectionCards
          totalQuestions={MOCK_QUESTION_STATS.totalQuestions}
          approvedCount={MOCK_QUESTION_STATS.approvedCount}
          pendingCount={MOCK_QUESTION_STATS.pendingCount}
          totalPracticeSessions={MOCK_QUESTION_STATS.totalPracticeSessions}
          starCoverageRate={MOCK_QUESTION_STATS.starCoverageRate}
        />

        {/* View Mode Tabs: Question Sets vs Individual Questions */}
        <div className="px-4 lg:px-6">
          <Tabs defaultValue="sets" className="space-y-4">
            <div className="flex items-center justify-between border-b pb-1">
              <TabsList className="h-9 p-1 bg-muted/60">
                <TabsTrigger value="sets" className="text-xs gap-2 font-semibold">
                  <FolderKanban className="size-3.5" />
                  <span>Bộ Đề Phỏng Vấn (Question Sets)</span>
                </TabsTrigger>
                <TabsTrigger value="bank" className="text-xs gap-2 font-semibold">
                  <HelpCircle className="size-3.5" />
                  <span>Câu Hỏi Đơn Lẻ (Question Bank)</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab 1: Question Sets */}
            <TabsContent value="sets" className="m-0 space-y-4">
              <QuestionSetDataTable
                key={`sets-${refreshKey}`}
                initialSets={MOCK_QUESTION_SETS}
              />
            </TabsContent>

            {/* Tab 2: Individual Questions Bank */}
            <TabsContent value="bank" className="m-0 space-y-4">
              {/* Interactive Trends Area Chart */}
              <QuestionInteractiveChart data={chartData} />

              {/* Questions Data Table */}
              <QuestionDataTable
                key={`bank-${refreshKey}`}
                initialQuestions={MOCK_ADMIN_QUESTIONS}
                onRefresh={handleRefresh}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
