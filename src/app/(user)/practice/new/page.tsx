"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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

      {/* Main Intelligent JD Workspace */}
      <JDInterviewWorkspace />
    </div>
  );
}
