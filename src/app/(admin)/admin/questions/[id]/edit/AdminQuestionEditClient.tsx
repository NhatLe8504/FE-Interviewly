"use client";

import React, { useEffect, useState } from "react";
import { SingleQuestionForm } from "@/components/admin/questions";
import { questionAdminApi } from "@/services/admin/questionAdminApi";
import { Sparkles } from "lucide-react";

export default function AdminQuestionEditClient({ questionId }: { questionId: string }) {
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestion() {
      try {
        const data = await questionAdminApi.getQuestionDetail(questionId);
        if (data) setQuestion(data);
      } catch (err) {
        console.warn("Failed to load question for edit:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestion();
  }, [questionId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Sparkles className="size-6 animate-spin text-primary" />
        <span className="text-xs">Đang tải thông tin câu hỏi #{questionId}...</span>
      </div>
    );
  }

  return <SingleQuestionForm initialQuestion={question} isEdit={true} />;
}
