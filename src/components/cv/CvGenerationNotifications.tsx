"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/user-component/toast";
import { cvApi } from "@/services/cvApi";

export function CvGenerationNotifications() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    let polling = false;

    const check = async () => {
      if (!active || polling) return;
      polling = true;
      try {
        const notifications = await cvApi.getGenerationNotifications();
        for (const job of notifications) {
          if (!active) return;
          const currentTask = new URLSearchParams(window.location.search).get("task");
          if (window.location.pathname === "/cv-builder/setup" && currentTask === job.job_id) continue;
          const url = job.status === "COMPLETED" && job.cv_id
            ? `/cv-builder?id=${job.cv_id}`
            : `/cv-builder/setup?task=${encodeURIComponent(job.job_id)}`;
          if (job.status === "COMPLETED") {
            toast.success("CV từ JD đã sẵn sàng", <Link href={url}>Xem CV</Link>, 12000);
          } else if (job.status === "QUESTIONS_READY") {
            toast.info("Câu hỏi cho CV đã sẵn sàng", <Link href={url}>Trả lời câu hỏi</Link>, 12000);
          } else {
            toast.error("Tạo CV chưa hoàn tất", <Link href={url}>Xem và thử lại</Link>, 12000);
          }
          if (document.visibilityState === "hidden" && "Notification" in window && Notification.permission === "granted") {
            try {
              const title = job.status === "COMPLETED" ? "CV của bạn đã sẵn sàng" : job.status === "QUESTIONS_READY" ? "Câu hỏi CV đã sẵn sàng" : "Tạo CV cần thử lại";
              const notice = new Notification(title, {
                body: job.job_title,
              });
              notice.onclick = () => { window.focus(); window.location.href = url; };
            } catch (cause) { console.warn("Browser notification unavailable:", cause); }
          }
          await cvApi.acknowledgeGenerationNotification(job.job_id);
        }
      } catch {
        return;
      } finally {
        polling = false;
      }
    };

    void check();
    const timer = window.setInterval(check, 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, [isAuthenticated]);

  return null;
}
