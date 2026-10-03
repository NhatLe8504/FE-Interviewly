import { ApiError, request } from "@/services/apiClient";
import type {
  CatalogStatusFilter,
  DomainAdminDetail,
  DomainAdminSummary,
  DomainAdminSummaryPage,
  DomainOut,
  QuestionPageOut,
  RoleAdminSummary,
  RoleOut,
} from "@/types/catalog";

export interface DomainAdminCreateIn {
  domain_name: string;
  description?: string | null;
}

export interface DomainAdminUpdateIn {
  domain_name?: string;
  description?: string | null;
}

export interface RoleAdminCreateIn {
  domain_id: number;
  role_name: string;
  description?: string | null;
}

export interface RoleAdminUpdateIn {
  role_name?: string;
  description?: string | null;
}

const statusQuery = (status: CatalogStatusFilter) =>
  `?status=${encodeURIComponent(status)}`;

const isUnavailableSummaryEndpoint = (error: unknown) =>
  error instanceof ApiError && error.status === 405;

async function getCatalogDomainSummaries(): Promise<DomainAdminSummaryPage> {
  const [domains, roles] = await Promise.all([
    request<DomainOut[]>("/api/v1/catalog/domains"),
    request<RoleOut[]>("/api/v1/catalog/roles"),
  ]);

  const questionTotals = await Promise.all(
    domains.map(async (domain) => {
      const page = await request<QuestionPageOut>(
        `/api/v1/catalog/questions?domain_id=${domain.domain_id}&limit=1`,
      );
      return [domain.domain_id, page.total] as const;
    }),
  );
  const questionCountByDomain = new Map(questionTotals);
  const rolesByDomain = new Map<number, RoleOut[]>();
  for (const role of roles) {
    const domainRoles = rolesByDomain.get(role.domain_id) || [];
    domainRoles.push(role);
    rolesByDomain.set(role.domain_id, domainRoles);
  }

  const items: DomainAdminSummary[] = domains.map((domain) => {
    const domainRoles = rolesByDomain.get(domain.domain_id) || [];
    return {
      ...domain,
      is_active: true,
      role_count: domainRoles.length,
      active_role_count: domainRoles.length,
      question_count: questionCountByDomain.get(domain.domain_id) || 0,
    };
  });

  return {
    items,
    total: items.length,
    active_domains: items.length,
    archived_domains: 0,
    active_roles: roles.filter((role) => rolesByDomain.has(role.domain_id)).length,
    total_questions: items.reduce((total, domain) => total + domain.question_count, 0),
  };
}

async function getCatalogDomainDetail(domainId: number): Promise<DomainAdminDetail> {
  const summary = await getCatalogDomainSummaries();
  const domain = summary.items.find((item) => item.domain_id === domainId);
  if (!domain) {
    throw new ApiError("Không tìm thấy domain", 404);
  }

  const roles = await request<RoleOut[]>(`/api/v1/catalog/roles?domain_id=${domainId}`);
  const roleQuestionTotals = await Promise.all(
    roles.map(async (role) => {
      const page = await request<QuestionPageOut>(
        `/api/v1/catalog/questions?domain_id=${domainId}&role_id=${role.role_id}&limit=1`,
      );
      return [role.role_id, page.total] as const;
    }),
  );
  const questionCountByRole = new Map(roleQuestionTotals);

  return {
    domain,
    roles: roles.map((role) => ({
      ...role,
      is_active: true,
      question_count: questionCountByRole.get(role.role_id) || 0,
    })),
  };
}

export const domainAdminApi = {
  async getDomains(status: CatalogStatusFilter = "active") {
    try {
      return await request<DomainAdminSummaryPage>(`/api/v1/admin/domains${statusQuery(status)}`);
    } catch (error) {
      if (!isUnavailableSummaryEndpoint(error)) throw error;
      const fallback = await getCatalogDomainSummaries();
      return status === "archived" ? { ...fallback, items: [], total: 0 } : fallback;
    }
  },

  async getDomainDetail(domainId: number, status: CatalogStatusFilter = "all") {
    try {
      return await request<DomainAdminDetail>(
        `/api/v1/admin/domains/${domainId}${statusQuery(status)}`,
      );
    } catch (error) {
      if (!isUnavailableSummaryEndpoint(error)) throw error;
      const fallback = await getCatalogDomainDetail(domainId);
      return status === "archived" ? { ...fallback, roles: [] } : fallback;
    }
  },

  async createDomain(data: DomainAdminCreateIn) {
    return request<DomainOut>("/api/v1/admin/domains", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateDomain(domainId: number, data: DomainAdminUpdateIn) {
    return request<DomainOut>(`/api/v1/admin/domains/${domainId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async setDomainStatus(domainId: number, isActive: boolean) {
    return request<DomainOut>(`/api/v1/admin/domains/${domainId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });
  },

  async createRole(data: RoleAdminCreateIn) {
    return request<RoleOut>("/api/v1/admin/roles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateRole(roleId: number, data: RoleAdminUpdateIn) {
    return request<RoleOut>(`/api/v1/admin/roles/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async setRoleStatus(roleId: number, isActive: boolean) {
    return request<RoleOut>(`/api/v1/admin/roles/${roleId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: isActive }),
    });
  },
};
