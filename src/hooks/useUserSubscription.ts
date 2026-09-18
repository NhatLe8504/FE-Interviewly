"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGetMySubscriptionQuery } from "@/redux/api/billingApi";
import { useCheckSubscriptionQuotaQuery } from "@/redux/api/interviewApi";

export function useUserSubscription() {
  const { user, isAuthenticated } = useAuth();

  // RTK Queries
  const {
    data: subData,
    isLoading: isSubLoading,
    refetch: refetchSub,
  } = useGetMySubscriptionQuery(undefined, {
    skip: !isAuthenticated,
  });

  const {
    data: quotaData,
    isLoading: isQuotaLoading,
    refetch: refetchQuota,
  } = useCheckSubscriptionQuotaQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Local storage backup flag (for local testing, demo checkout or simulation)
  const [localSub, setLocalSub] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return (
        localStorage.getItem("interviewly_subscription_active") === "true" ||
        localStorage.getItem("interviewly_is_pro") === "true"
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateLocal = () => {
      try {
        const active =
          localStorage.getItem("interviewly_subscription_active") === "true" ||
          localStorage.getItem("interviewly_is_pro") === "true";
        setLocalSub(active);
      } catch {
        // Ignore
      }
    };

    window.addEventListener("storage", updateLocal);
    window.addEventListener("interviewly_subscription_change", updateLocal);
    return () => {
      window.removeEventListener("storage", updateLocal);
      window.removeEventListener("interviewly_subscription_change", updateLocal);
    };
  }, []);

  // Determine if user has active Pro/Paid subscription:
  // - User role is "admin" or "pro"
  // - subData is active and plan is not free
  // - quotaData plan is "pro"
  // - localSub flag is active
  const isSubscribed = Boolean(
    isAuthenticated &&
      (user?.role === "admin" ||
        user?.role === "pro" ||
        (subData && subData.status === "active" && subData.plan?.billing_cycle !== "free") ||
        quotaData?.plan === "pro" ||
        localSub)
  );

  const planName =
    user?.role === "admin"
      ? "Administrator"
      : subData?.plan?.plan_name ||
        (quotaData?.plan === "pro" ? "Pro Plan" : isSubscribed ? "Pro Plan" : "Free Plan");

  return {
    isSubscribed,
    planName,
    subscription: subData,
    quota: quotaData,
    isLoading: isSubLoading || isQuotaLoading,
    refetch: () => {
      refetchSub();
      refetchQuota();
    },
  };
}
