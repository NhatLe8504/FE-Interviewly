"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { jdInterviewApi } from "@/services/jdInterviewApi";
import { toast } from "@/components/user-component/toast";

export function JDCompletionNotifications() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    let polling = false;

    const check = async () => {
      if (polling || !active) return;
      polling = true;
      try {
        const notifications = await jdInterviewApi.getNotifications();
        for (const notification of notifications) {
          if (!active) return;
          await jdInterviewApi.acknowledgeNotification(notification.job_id);
          toast.success(
            "Buổi phỏng vấn từ JD đã sẵn sàng",
            <Link href={`/practice/new?job_id=${encodeURIComponent(notification.job_id)}`}>Xem bộ câu hỏi</Link>,
            12000
          );
        }
      } catch {
        // Keep unread notifications for the next poll.
      } finally {
        polling = false;
      }
    };

    void check();
    const timer = window.setInterval(check, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [isAuthenticated]);

  return null;
}
