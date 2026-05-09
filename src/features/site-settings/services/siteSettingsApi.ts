import api from "../../../api/http";

export interface SiteSettings {
  id: string;
  logoPath?: string | null;
  logoUrl?: string | null;
  unassignedTicketAlertMinutes: number;
}

export interface AllowedEmailDomain {
  id: string;
  domain: string;
  createdAt?: string;
  updatedAt?: string;
}

export const siteSettingsApi = {
  async getSettings() {
    const response = await api.get<SiteSettings>("v1/site-settings");
    return response.data;
  },

  async updateSettings(payload: Partial<Pick<SiteSettings, "unassignedTicketAlertMinutes">>) {
    const response = await api.patch<SiteSettings>("v1/site-settings", payload);
    return response.data;
  },

  async updateLogo(file: File) {
    const formData = new FormData();
    formData.append("logo", file);

    const response = await api.patch<SiteSettings>("v1/site-settings/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async getAllowedEmailDomains() {
    const response = await api.get<{ domains: AllowedEmailDomain[] }>("v1/site-settings/email-domains");
    return response.data.domains ?? [];
  },

  async createAllowedEmailDomain(domain: string) {
    const response = await api.post<AllowedEmailDomain>("v1/site-settings/email-domains", { domain });
    return response.data;
  },

  async updateAllowedEmailDomain(id: string, domain: string) {
    const response = await api.put<AllowedEmailDomain>(`v1/site-settings/email-domains/${id}`, { domain });
    return response.data;
  },

  async deleteAllowedEmailDomain(id: string) {
    await api.delete(`v1/site-settings/email-domains/${id}`);
  },
};
