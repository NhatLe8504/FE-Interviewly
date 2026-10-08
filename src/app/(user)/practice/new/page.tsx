"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { JDInterviewWorkspace } from "@/components/user-component/practice/JDInterviewWorkspace";
import { Button } from "@/components/ui/button";
import styles from "./newPractice.module.css";

export default function NewPracticeSessionPage() {
  return (
    <div className={styles.shell}>
      {/* Back Link */}
      <Button asChild variant="home-quiet" size="home-compact" className={styles.backLink}>
        <Link href="/practice">
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Quay lại các buổi luyện</span>
        </Link>
      </Button>

      {/* Main Intelligent JD Workspace wrapped in Suspense for searchParams */}
      <Suspense
        fallback={
          <div className={styles.loading} role="status">
            <Loader2 className="size-6 animate-spin" aria-hidden="true" />
            <p>Đang tải không gian luyện tập…</p>
          </div>
        }
      >
        <JDInterviewWorkspace />
      </Suspense>
    </div>
  );
}
