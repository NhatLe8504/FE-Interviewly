"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface ProUpgradeJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle?: string;
}

export function ProUpgradeJobModal({
  open,
  onOpenChange,
  jobTitle,
}: ProUpgradeJobModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 sm:p-7 rounded-3xl border border-[var(--border,#e2d9cc)] bg-[var(--surface-primary,#ffffff)] shadow-2xl">
        <DialogHeader className="text-left space-y-3">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider w-fit">
            <Crown className="size-3.5" />
            <span>Đặc quyền gói Pro</span>
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-serif font-bold text-[var(--foreground,#1c1917)] leading-snug">
            Tạo kịch bản phỏng vấn AI từ tin tuyển dụng
          </DialogTitle>

          <DialogDescription className="text-sm text-[var(--foreground-secondary,#6b6359)] leading-relaxed">
            {jobTitle ? (
              <>
                Vị trí <strong className="text-[var(--foreground,#1c1917)] font-medium">“{jobTitle}”</strong> hiện chưa có sẵn kịch bản luyện tập.
              </>
            ) : (
              "Vị trí tuyển dụng này hiện chưa có sẵn kịch bản luyện tập."
            )}{" "}
            Thành viên Pro có thể tạo mới không giới hạn kịch bản phỏng vấn chuyên sâu bám sát mọi mô tả công việc (JD) thực tế.
          </DialogDescription>
        </DialogHeader>

        {/* Feature benefits box */}
        <div className="my-2 p-4 rounded-2xl bg-[var(--surface-secondary,#fbf9f5)] border border-[var(--border,#ece5db)] space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--foreground,#1c1917)]">
                Bóc tách yêu cầu công việc tự động
              </p>
              <p className="text-[11px] text-[var(--foreground-secondary,#78716c)] leading-normal mt-0.5">
                AI phân tích sâu kỹ năng trọng yếu, công nghệ bắt buộc và cấp bậc từ bản mô tả công việc.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--foreground,#1c1917)]">
                Kịch bản câu hỏi độc quyền chuẩn STAR
              </p>
              <p className="text-[11px] text-[var(--foreground-secondary,#78716c)] leading-normal mt-0.5">
                Tạo bộ câu hỏi chuyên môn, giải quyết tình huống kỹ thuật và câu hỏi hành vi theo đúng JD.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <Crown className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--foreground,#1c1917)]">
                Luyện tập phỏng vấn AI hai chiều
              </p>
              <p className="text-[11px] text-[var(--foreground-secondary,#78716c)] leading-normal mt-0.5">
                Phỏng vấn giọng nói tương tác trực tiếp với AI Coach, nhận phản hồi và thang điểm chi tiết.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <Button
            asChild
            variant="home-primary"
            className="w-full sm:flex-1 h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md border-0"
          >
            <Link href="/pricing" onClick={() => onOpenChange(false)}>
              <span>Nâng cấp Pro ngay</span>
              <ArrowRight className="size-4 ml-1.5" />
            </Link>
          </Button>

          <Button
            type="button"
            variant="home-quiet"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11 text-sm text-[var(--foreground-secondary,#78716c)] hover:text-[var(--foreground,#1c1917)] rounded-xl"
          >
            Để sau
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
