import { request } from "@/services/apiClient";
import type {
  CatalogStatusFilter,
  DomainAdminDetail,
  DomainAdminSummaryPage,
  DomainOut,
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

export const domainAdminApi = {
  async getDomains(status: CatalogStatusFilter = "active") {
    return request<DomainAdminSummaryPage>(`/api/v1/admin/domains${statusQuery(status)}`);
  },

  async getDomainDetail(domainId: number, status: CatalogStatusFilter = "all") {
    return request<DomainAdminDetail>(
      `/api/v1/admin/domains/${domainId}${statusQuery(status)}`,
    );
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
