import http from "../../../api/http";
import type {
  CustomForm,
  CustomFormPayload,
  CustomFormResponsesPayload,
  CustomFormShareLinkPayload,
} from "../types";

export const customFormApi = {
  async create(data: CustomFormPayload) {
    const response = await http.post("/v1/custom-forms", data);
    return response.data.data as CustomForm;
  },

  async list(params: { isGlobal?: boolean; ticketId?: string }) {
    const response = await http.get("/v1/custom-forms", { params });
    return response.data.data as CustomForm[];
  },

  async getOne(id: string) {
    const response = await http.get(`/v1/custom-forms/${id}`);
    return response.data.data as CustomForm;
  },

  async update(id: string, data: Partial<CustomFormPayload>) {
    const response = await http.put(`/v1/custom-forms/${id}`, data);
    return response.data.data as CustomForm;
  },

  async delete(id: string) {
    await http.delete(`/v1/custom-forms/${id}`);
  },

  async duplicateToTicket(id: string, payload: { ticketId: string; title?: string }) {
    const response = await http.post(`/v1/custom-forms/${id}/duplicate`, payload);
    return response.data.data as CustomForm;
  },

  async createShareLink(id: string, payload: { expiresInHours?: number }) {
    const response = await http.post(`/v1/custom-forms/${id}/share-link`, payload);
    return response.data.data as CustomFormShareLinkPayload;
  },

  async submit(id: string, data: Record<string, unknown>) {
    const response = await http.post(`/v1/custom-forms/${id}/submit`, data);
    return response.data.data;
  },

  async getResponses(id: string) {
    const response = await http.get(`/v1/custom-forms/${id}/responses`);
    return response.data.data as CustomFormResponsesPayload;
  },

  async exportResponses(id: string) {
    return http.get(`/v1/custom-forms/${id}/responses/export`, {
      responseType: "blob",
    });
  },

  async getByToken(token: string) {
    const response = await http.get(`/v1/custom-forms/public/${token}`);
    return response.data.data as Omit<CustomForm, "token" | "creator" | "responseCount" | "isGlobal"> & {
      settings?: CustomForm["settings"];
    };
  },

  async submitPublic(token: string, data: Record<string, unknown>) {
    const response = await http.post(`/v1/custom-forms/public/${token}/submit`, data);
    return response.data.data;
  },
};
