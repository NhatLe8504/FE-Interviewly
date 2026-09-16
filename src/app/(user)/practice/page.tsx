"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Keyboard, Mic, Sparkles, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import {
  MOCK_DOMAINS,
  MOCK_LANGUAGES,
  MOCK_LEVELS,
  MOCK_ROLES,
} from "@/mock/practice";
import type { PracticeMode } from "@/types/practice";
import {
  interviewApi,
  CatalogDomain,
  CatalogRole,
  SubscriptionQuota,
} from "@/services/interviewApi";
import shared from "./shared.module.css";

export default function PracticeSetupPage() {
  const router = useRouter();

  // Dynamic Catalog State
  const [domains, setDomains] = useState<CatalogDomain[]>([]);
  const [roles, setRoles] = useState<CatalogRole[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<number>(1);
  const [selectedRoleId, setSelectedRoleId] = useState<number>(1);
  const [levelId, setLevelId] = useState<string>("junior");
  const [languageId, setLanguageId] = useState<string>("vi");
  const [mode, setMode] = useState<PracticeMode>("text");

  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Quota checking state
  const [quota, setQuota] = useState<SubscriptionQuota | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  // 1. Fetch initial catalog & quota on mount
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const [domainList, quotaData] = await Promise.all([
          interviewApi.getDomains(),
          interviewApi.checkSubscriptionQuota(),
        ]);

        if (!isMounted) return;

        if (domainList && domainList.length > 0) {
          setDomains(domainList);
          setSelectedDomainId(domainList[0].id);

          const roleList = await interviewApi.getRoles(domainList[0].id);
          if (isMounted) {
            setRoles(roleList);
            if (roleList.length > 0) setSelectedRoleId(roleList[0].id);
          }
        }
        setQuota(quotaData);
      } catch (err) {
        // Fallback to static mock if backend catalog is unreachable
        if (isMounted) {
          const fallbackDomains = MOCK_DOMAINS.map((d, idx) => ({
            id: idx + 1,
            name: d.label,
            code: d.id,
          }));
          setDomains(fallbackDomains);
          setSelectedDomainId(1);
          const fallbackRoles = MOCK_ROLES.filter((r) => r.domainId === MOCK_DOMAINS[0].id).map(
            (r, idx) => ({
              id: idx + 1,
              domain_id: 1,
              name: r.label,
              code: r.id,
            })
          );
          setRoles(fallbackRoles);
        }
      } finally {
        if (isMounted) setLoadingCatalog(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch roles when domain changes
  const handleDomainChange = async (newDomainId: number) => {
    setSelectedDomainId(newDomainId);
    setLoadingRoles(true);
    try {
      const roleList = await interviewApi.getRoles(newDomainId);
      setRoles(roleList);
      if (roleList.length > 0) {
        setSelectedRoleId(roleList[0].id);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingRoles(false);
    }
  };

  // 3. Start interview handler
  const startInterview = async () => {
    // Check quota condition first
    if (quota && !quota.can_start) {
      setShowQuotaModal(true);
      return;
    }

    setIsStarting(true);
    try {
      const activeRole = roles.find((r) => r.id === selectedRoleId);
      const activeDomain = domains.find((d) => d.id === selectedDomainId);

      const session = await interviewApi.startSession({
        domain_id: selectedDomainId,
        role_id: selectedRoleId,
        role_name: activeRole?.name || "Software Engineer",
        level: levelId,
        language: languageId,
        mode,
      });

      router.push(`/practice/${session.session_id}`);
    } catch (err) {
      // Direct navigation fallback in case of emergency
      const localSessionId = `sess-${Date.now().toString(36)}`;
      router.push(`/practice/${localSessionId}`);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className={shared.shell}>
      <p className={shared.eyebrow}>Practice setup</p>
      <h1 className={shared.title}>Configure your session</h1>
      <p className={shared.sub}>
        Chọn vị trí ứng tuyển, cấp bậc chuyên môn và ngôn ngữ. Động cơ AI Coach sẽ thiết lập phiên phỏng vấn tương tác thực tế dựa trên lựa chọn của bạn.
      </p>

      {/* Quota information banner */}
      {quota && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderRadius: "16px",
            backgroundColor: quota.can_start ? "rgba(255, 122, 69, 0.08)" : "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${quota.can_start ? "rgba(255, 122, 69, 0.25)" : "rgba(239, 68, 68, 0.3)"}`,
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={18} color={quota.can_start ? "#ea580c" : "#dc2626"} />
            <span style={{ fontSize: "13px", color: "#1f2937", fontWeight: "600" }}>
              Gói hiện tại: <strong>{quota.plan.toUpperCase()}</strong> (Đã dùng {quota.used_interviews}/{quota.limit_interviews} lượt trong tháng)
            </span>
          </div>
          {quota.plan === "free" && (
            <Link
              href="/pricing"
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#ea580c",
                textDecoration: "none",
              }}
            >
              Nâng cấp Pro không giới hạn →
            </Link>
          )}
        </div>
      )}

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Target position (Vị trí ứng tuyển)</h2>
        <p className={shared.cardHint}>
          Hệ thống câu hỏi và thang điểm Rubric sẽ tự động tương thích theo ngành và chức danh bạn chọn.
        </p>

        <div className={shared.grid2}>
          {/* Domain selection */}
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Ngành nghề (Domain)</span>
            <select
              className={shared.select}
              value={selectedDomainId}
              disabled={loadingCatalog}
              onChange={(e) => handleDomainChange(Number(e.target.value))}
            >
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </label>

          {/* Role selection */}
          <label className={shared.field}>
            <span className={shared.fieldLabel}>
              Vị trí công việc (Job role) {loadingRoles && "• Đang tải..."}
            </span>
            <select
              className={shared.select}
              value={selectedRoleId}
              disabled={loadingRoles || roles.length === 0}
              onChange={(e) => setSelectedRoleId(Number(e.target.value))}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          {/* Level selection */}
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Cấp bậc kinh nghiệm (Level)</span>
            <select
              className={shared.select}
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
            >
              <option value="intern">Intern (Thực tập sinh)</option>
              <option value="fresher">Fresher (Mới tốt nghiệp)</option>
              <option value="junior">Junior (1 - 2 năm kinh nghiệm)</option>
              <option value="mid">Middle (3 - 5 năm kinh nghiệm)</option>
              <option value="senior">Senior (5+ năm kinh nghiệm & Lead)</option>
            </select>
          </label>

          {/* Language selection */}
          <label className={shared.field}>
            <span className={shared.fieldLabel}>Ngôn ngữ phỏng vấn (Language)</span>
            <select
              className={shared.select}
              value={languageId}
              onChange={(e) => setLanguageId(e.target.value)}
            >
              <option value="vi">Tiếng Việt (Vietnamese)</option>
              <option value="en">English (Professional Working)</option>
            </select>
          </label>
        </div>
      </div>

      <div className={shared.card}>
        <h2 className={shared.cardTitle}>Answer mode (Hình thức phỏng vấn)</h2>
        <p className={shared.cardHint}>
          Gõ văn bản để tập trung cấu trúc ý tứ, hoặc nói trực tiếp qua micro với công nghệ nhận diện giọng nói và phân tích phát âm.
        </p>

        <div className={shared.modeGrid}>
          <button
            type="button"
            onClick={() => setMode("text")}
            aria-pressed={mode === "text"}
            className={`${shared.modeCard} ${mode === "text" ? shared.modeOn : ""}`}
          >
            <span className={shared.modeIcon}>
              <Keyboard size={20} />
            </span>
            <span>
              <span className={shared.modeName}>Text Mode (Văn bản)</span>
              <span className={shared.modeDesc}>
                Nhập câu trả lời bằng bàn phím. Tối ưu cho việc rèn luyện tư duy logic và cấu trúc câu.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("voice")}
            aria-pressed={mode === "voice"}
            className={`${shared.modeCard} ${mode === "voice" ? shared.modeOn : ""}`}
          >
            <span className={shared.modeIcon}>
              <Mic size={20} />
            </span>
            <span>
              <span className={shared.modeName}>Voice Mode (Giọng nói trực tiếp)</span>
              <span className={shared.modeDesc}>
                Phản hồi trực tiếp bằng micro. Tích hợp bóc băng Speech-to-Text, đo tốc độ WPM và phân tích từ đệm.
              </span>
            </span>
          </button>
        </div>

        <div className={shared.actions}>
          <button
            type="button"
            onClick={startInterview}
            disabled={isStarting || loadingCatalog}
            className={shared.primaryBtn}
          >
            {isStarting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Đang khởi tạo phòng phỏng vấn…</span>
              </>
            ) : (
              <>
                <span>Bắt đầu phỏng vấn ngay</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quota Exceeded Modal */}
      {showQuotaModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "460px",
              width: "100%",
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.2)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                backgroundColor: "#fff1f2",
                color: "#e11d48",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ margin: "0 0 10px", fontSize: "20px", fontWeight: "800", color: "#111827" }}>
              Đã dùng hết lượt phỏng vấn miễn phí
            </h3>

            <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#4b5563", lineHeight: "1.6" }}>
              Tài khoản Free của bạn đã đạt giới hạn <strong>3 lượt phỏng vấn trong tháng</strong>. Hãy nâng cấp lên gói <strong>Pro</strong> để trải nghiệm phỏng vấn không giới hạn, mở khóa toàn bộ câu hỏi và xuất báo cáo PDF chuẩn quốc tế.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #ff7a45 0%, #ff4d4f 100%)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(255, 77, 79, 0.35)",
                }}
              >
                <Sparkles size={16} />
                <span>Nâng cấp Pro ngay (Chỉ từ 99k/tháng)</span>
              </Link>

              <button
                type="button"
                onClick={() => setShowQuotaModal(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#f3f4f6",
                  color: "#6b7280",
                  fontSize: "13px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
