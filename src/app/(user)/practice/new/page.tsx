"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { JDInterviewWorkspace } from "@/components/user-component/practice/JDInterviewWorkspace";
import styles from "./newPractice.module.css";

export default function NewPracticeSessionPage() {
  return (
    <div className={styles.shell}>
      {/* Back Link */}
      <Link href="/practice" className={styles.backLink}>
        <ArrowLeft size={15} />
        <span>Quay lại danh sách buổi phỏng vấn</span>
      </Link>

      {/* Main Intelligent JD Workspace wrapped in Suspense for searchParams */}
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <Loader2 className="size-8 animate-spin text-[#d98236]" />
            <p className="text-xs text-muted-foreground">Đang tải không gian làm việc JD...</p>
          </div>
        }
      >
        <JDInterviewWorkspace />
      </Suspense>
    </div>
  );
}