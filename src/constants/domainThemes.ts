export interface DomainTheme {
  domainId: number;
  name: string;
  shortName: string;
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
    shortName: "Software & IT",
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
    shortName: "Digital Marketing",
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
    shortName: "B2B Sales",
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
    shortName: "Human Resources",
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
    shortName: "Corporate Finance",
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
    shortName: "Product & UI/UX",
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
    if (lower.includes("marketing")) return DOMAIN_THEMES[2];
    if (lower.includes("kinh doanh") || lower.includes("sales")) return DOMAIN_THEMES[3];
    if (lower.includes("nhân sự") || lower.includes("hr")) return DOMAIN_THEMES[4];
    if (lower.includes("tài chính") || lower.includes("finance")) return DOMAIN_THEMES[5];
    if (lower.includes("sản phẩm") || lower.includes("design") || lower.includes("ui"))
      return DOMAIN_THEMES[6];
  }

  return DEFAULT_THEME;
}
