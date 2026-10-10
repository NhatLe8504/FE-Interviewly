import { CvColorTheme, CvFontFamily } from "@/types/cv";

export interface ColorThemeDefinition {
  primary: string;
  primaryLight: string;
  accent: string;
  border: string;
  bgLight: string;
  badgeBg: string;
  badgeText: string;
  headerGradient: string;
}

export const CV_COLOR_THEMES: Record<CvColorTheme, ColorThemeDefinition> = {
  navy: {
    primary: "#1e3a8a",
    primaryLight: "#2563eb",
    accent: "#3b82f6",
    border: "#bfdbfe",
    bgLight: "#eff6ff",
    badgeBg: "#dbeafe",
    badgeText: "#1e40af",
    headerGradient: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
  },
  emerald: {
    primary: "#065f46",
    primaryLight: "#059669",
    accent: "#10b981",
    border: "#a7f3d0",
    bgLight: "#ecfdf5",
    badgeBg: "#d1fae5",
    badgeText: "#065f46",
    headerGradient: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
  },
  crimson: {
    primary: "#991b1b",
    primaryLight: "#dc2626",
    accent: "#ef4444",
    border: "#fecaca",
    bgLight: "#fef2f2",
    badgeBg: "#fee2e2",
    badgeText: "#991b1b",
    headerGradient: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)",
  },
  indigo: {
    primary: "#3730a3",
    primaryLight: "#4f46e5",
    accent: "#6366f1",
    border: "#c7d2fe",
    bgLight: "#eef2ff",
    badgeBg: "#e0e7ff",
    badgeText: "#3730a3",
    headerGradient: "linear-gradient(135deg, #3730a3 0%, #6366f1 100%)",
  },
  amber: {
    primary: "#92400e",
    primaryLight: "#d97706",
    accent: "#f59e0b",
    border: "#fde68a",
    bgLight: "#fffbeb",
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
    headerGradient: "linear-gradient(135deg, #92400e 0%, #f59e0b 100%)",
  },
  slate: {
    primary: "#1e293b",
    primaryLight: "#475569",
    accent: "#64748b",
    border: "#cbd5e1",
    bgLight: "#f8fafc",
    badgeBg: "#f1f5f9",
    badgeText: "#1e293b",
    headerGradient: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
  },
};

export const CV_FONT_FAMILIES: Record<CvFontFamily, { name: string; fontClass: string; cssFamily: string }> = {
  inter: {
    name: "Inter (Modern Sans)",
    fontClass: "font-sans",
    cssFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  roboto: {
    name: "Roboto (Clean Standard)",
    fontClass: "font-sans",
    cssFamily: "'Roboto', 'Helvetica Neue', Arial, sans-serif",
  },
  merriweather: {
    name: "Merriweather (Classic Editorial)",
    fontClass: "font-serif",
    cssFamily: "'Merriweather', Georgia, serif",
  },
  playfair: {
    name: "Playfair Display (Executive Serif)",
    fontClass: "font-serif",
    cssFamily: "'Playfair Display', Times New Roman, serif",
  },
  fira_code: {
    name: "Fira Code (Tech Mono)",
    fontClass: "font-mono",
    cssFamily: "'Fira Code', 'Courier New', monospace",
  },
};

export const CV_TEMPLATES_INFO = [
  {
    id: "modern_tech" as const,
    name: "Modern Tech",
    badge: "Phổ biến nhất",
    description: "Thiết kế hiện đại, tinh gọn với thẻ kỹ năng và điểm nhấn màu sắc cho Software Engineer & Data Specialist.",
    accent: "bg-blue-600",
  },
  {
    id: "minimalist_ats" as const,
    name: "Minimalist ATS",
    badge: "Tối ưu ATS 99%",
    description: "Định dạng 1 cột tiêu chuẩn quốc tế, bố cục mạch lạc không rào cản cho mọi phần mềm quét hồ sơ tự động.",
    accent: "bg-emerald-600",
  },
  {
    id: "executive_leader" as const,
    name: "Executive Leader",
    badge: "Quản lý & Senior",
    description: "Phong cách sang trọng, vương giả, nhấn mạnh vào tóm tắt năng lực lãnh đạo, chiến lược và tác động kinh doanh.",
    accent: "bg-indigo-700",
  },
  {
    id: "creative_product" as const,
    name: "Creative & Product",
    badge: "Sidebar hiện đại",
    description: "Bố cục 2 cột năng động với thanh kỹ năng trực quan, phù hợp cho Product Manager, UI/UX Designer và Fullstack.",
    accent: "bg-amber-600",
  },
  {
    id: "compact_swiss" as const,
    name: "Compact Swiss",
    badge: "1 Trang xúc tích",
    description: "Phong cách lưới đồ họa Thụy Sĩ với mật độ thông tin tối ưu, gói trọn toàn bộ sự nghiệp trên một trang duy nhất.",
    accent: "bg-slate-700",
  },
];
