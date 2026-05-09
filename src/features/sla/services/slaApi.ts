import api from "../../../api/http";

export interface SlaRule {
  id: string;
  name?: string;
  name_en?: string;
  name_ar?: string;
  maxHours: number;
  isActive: boolean;
  university?: { id: string; name: string } | null;
  domain?: { id: string; name: string } | null;
  specialization?: { id: string; name: string } | null;
  problem?: { id: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SlaRulePayload {
  name_en?: string;
  name_ar?: string;
  maxHours: number;
  isActive?: boolean;
  university?: string | null;
  domain?: string | null;
  specialization?: string | null;
  problem?: string | null;
}

export const slaApi = {
  async getAll() {
    const response = await api.get<{ rules: SlaRule[] }>("v1/sla-rules");
    return response.data.rules ?? [];
  },

  async create(payload: SlaRulePayload) {
    const response = await api.post<SlaRule>("v1/sla-rules", payload);
    return response.data;
  },

  async update(id: string, payload: SlaRulePayload) {
    const response = await api.put<SlaRule>(`v1/sla-rules/${id}`, payload);
    return response.data;
  },

  async delete(id: string) {
    await api.delete(`v1/sla-rules/${id}`);
  },
};
