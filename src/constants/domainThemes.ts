export interface DomainTheme {
  domainId: number;
  name: string;
  nameEn: string;
  shortName: string;
  shortNameEn: string;
  imageUrl: string;
  localFallback: string;
  gradient: string;
  accentColor: string;
  badgeBg: string;
  badgeColor: string;
}

export const DOMAIN_THEMES: Record<number, DomainTheme> = {
  1: {
    domainId: 1,
    name: "Công nghệ thông tin (IT)",
    nameEn: "Software & IT (IT)",
    shortName: "Software & IT",
    shortNameEn: "Software & IT",
    imageUrl:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80",
    localFallback: "/images/domains/it.svg",
    gradient: "linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(2, 132, 199, 0.7))",
    accentColor: "#0284c7",
    badgeBg: "rgba(2, 132, 199, 0.14)",
    badgeColor: "#0369a1",
  },
  2: {
    domainId: 2,
    name: "Marketing & Truyền thông",
    nameEn: "Marketing & Communications",
    shortName: "Digital Marketing",
    shortNameEn: "Digital Marketing",
    imageUrl:
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=700&auto=format&fit=crop&q=80",
    localFallback: "/images/domains/marketing.svg",
    gradient: "linear-gradient(135deg, rgba(76, 5, 25, 0.85), rgba(225, 29, 72, 0.7))",
    accentColor: "#e11d48",
    badgeBg: "rgba(225, 29, 72, 0.14)",
    badgeColor: "#be123c",
  },
  3: {
    domainId: 3,
    name: "Kinh doanh & Bán hàng (Sales)",
    nameEn: "Sales & Business Development",
    shortName: "B2B Sales",
    shortNameEn: "B2B Sales",
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=700&auto=format&fit=crop&q=80",
    localFallback: "/images/domains/sales.svg",
    gradient: "linear-gradient(135deg, rgba(45, 27, 15, 0.85), rgba(217, 119, 6, 0.7))",
    accentColor: "#d97706",
    badgeBg: "rgba(217, 119, 6, 0.14)",
    badgeColor: "#b45309",
  },
  4: {
    domainId: 4,
    name: "Quản trị Nhân sự (HR)",
    nameEn: "Human Resources (HR)",
    shortName: "Human Resources",
    shortNameEn: "Human Resources",
    imageUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&auto=format&fit=crop&q=80",
    localFallback: "/images/domains/hr.svg",
    gradient: "linear-gradient(135deg, rgba(2, 44, 34, 0.85), rgba(5, 150, 105, 0.7))",
    accentColor: "#059669",
    badgeBg: "rgba(5, 150, 105, 0.14)",
    badgeColor: "#047857",
  },
  5: {
    domainId: 5,
    name: "Tài chính & Kế toán",
    nameEn: "Finance & Accounting",
    shortName: "Corporate Finance",
    shortNameEn: "Corporate Finance",
    imageUrl:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=700&auto=format&fit=crop&q=80",
    localFallback: "/images/domains/finance.svg",
    gradient: "linear-gradient(135deg, rgba(8, 47, 73, 0.85), rgba(2, 132, 199, 0.7))",
    accentColor: "#0284c7",
    badgeBg: "rgba(2, 132, 199, 0.14)",
    badgeColor: "#0369a1",
  },
  6: {
    domainId: 6,
    name: "Sản phẩm & Thiết kế (Product & Design)",
    nameEn: "Product Management & UI/UX Design",
    shortName: "Product & UI/UX",
    shortNameEn: "Product & UI/UX",
    imageUrl:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=700&auto=format&fit=crop&q=80",
    localFallback: "/images/domains/product.svg",
    gradient: "linear-gradient(135deg, rgba(59, 7, 100, 0.85), rgba(147, 51, 234, 0.7))",
    accentColor: "#9333ea",
    badgeBg: "rgba(147, 51, 234, 0.14)",
    badgeColor: "#7e22ce",
  },
};

const DEFAULT_THEME: DomainTheme = DOMAIN_THEMES[1];

export function getDomainTheme(domainId?: number | null, domainName?: string): DomainTheme {
  if (domainId && DOMAIN_THEMES[domainId]) {
    return DOMAIN_THEMES[domainId];
  }

  if (domainName) {
    const lower = domainName.toLowerCase();
    if (lower.includes("marketing") || lower.includes("truyền thông")) return DOMAIN_THEMES[2];
    if (lower.includes("kinh doanh") || lower.includes("sales") || lower.includes("thị trường") || lower.includes("bán hàng"))
      return DOMAIN_THEMES[3];
    if (lower.includes("nhân sự") || lower.includes("hr")) return DOMAIN_THEMES[4];
    if (lower.includes("tài chính") || lower.includes("kế toán") || lower.includes("finance")) return DOMAIN_THEMES[5];
    if (lower.includes("sản phẩm") || lower.includes("design") || lower.includes("ui") || lower.includes("product"))
      return DOMAIN_THEMES[6];
  }

  return DEFAULT_THEME;
}

export function getLocalizedDomainName(
  domain: { domain_id?: number; domain_name: string },
  locale: string
): string {
  const name = domain.domain_name;
  if (locale === "vi") return name;

  const lower = name.toLowerCase();
  if (lower.includes("công nghệ thông tin") || lower.includes("software") || lower.includes("it")) {
    return "Software & IT (IT)";
  }
  if (lower.includes("marketing") || lower.includes("truyền thông")) {
    return "Marketing & Communications";
  }
  if (lower.includes("kinh doanh") || lower.includes("thị trường") || lower.includes("bán hàng") || lower.includes("sales")) {
    return "Sales & Business Development";
  }
  if (lower.includes("nhân sự") || lower.includes("hr")) {
    return "Human Resources (HR)";
  }
  if (lower.includes("tài chính") || lower.includes("kế toán") || lower.includes("finance")) {
    return "Finance & Accounting";
  }
  if (lower.includes("sản phẩm") || lower.includes("thiết kế") || lower.includes("product")) {
    return "Product & UI/UX Design";
  }

  return name;
}

export const ROLE_TRANSLATIONS: Record<string, { vi: string; en: string }> = {
  "backend engineer": { vi: "Kỹ sư Lập trình Backend", en: "Backend Engineer" },
  "frontend engineer": { vi: "Kỹ sư Lập trình Frontend", en: "Frontend Engineer" },
  "fullstack developer": { vi: "Lập trình viên Fullstack", en: "Fullstack Developer" },
  "devops / sre engineer": { vi: "Kỹ sư DevOps / SRE", en: "DevOps / SRE Engineer" },
  "data / ai engineer": { vi: "Kỹ sư Dữ liệu & AI", en: "Data & AI Engineer" },
  "digital marketing specialist": { vi: "Chuyên viên Digital Marketing", en: "Digital Marketing Specialist" },
  "content & seo creator": { vi: "Sáng tạo Nội dung & SEO", en: "Content & SEO Creator" },
  "b2b account executive": { vi: "Chuyên viên Kinh doanh B2B", en: "B2B Account Executive" },
  "talent acquisition (recruiter)": { vi: "Chuyên viên Tuyển dụng (HR)", en: "Talent Acquisition Specialist" },
  "financial analyst": { vi: "Chuyên viên Phân tích Tài chính", en: "Financial Analyst" },
  "product manager": { vi: "Quản lý Sản phẩm (PM)", en: "Product Manager" },
  "ui/ux designer": { vi: "Nhà thiết kế UI/UX", en: "UI/UX Designer" },
};

export function getLocalizedRoleName(
  role: { role_id?: number; role_name: string },
  locale: string
): string {
  const name = role.role_name;
  const key = name.toLowerCase().trim();
  const found = ROLE_TRANSLATIONS[key];
  if (found) {
    return locale === "vi" ? found.vi : found.en;
  }
  return name;
}
