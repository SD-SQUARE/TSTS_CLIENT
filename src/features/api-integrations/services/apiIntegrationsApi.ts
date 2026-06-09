import api from "../../../api/http";

export interface ApiIntegrationZone {
  key: string;
  label: string;
  description: string;
  paths: string[];
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  description?: string | null;
  keyPrefix: string;
  zones: string[];
  methods: string[];
  isActive: boolean;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  lastUsedIp?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyPayload {
  name: string;
  description?: string | null;
  zones: string[];
  methods: string[];
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface ApiIntegrationMeta {
  zones: ApiIntegrationZone[];
  methods: string[];
}

export const apiIntegrationsApi = {
  async getMeta() {
    const response = await api.get<ApiIntegrationMeta>("v1/api-integrations/meta");
    return response.data;
  },

  async getKeys() {
    const response = await api.get<{ keys: ApiKeyRecord[] }>("v1/api-integrations/keys");
    return response.data.keys ?? [];
  },

  async createKey(payload: ApiKeyPayload) {
    const response = await api.post<{ key: string; apiKey: ApiKeyRecord }>(
      "v1/api-integrations/keys",
      payload,
    );
    return response.data;
  },

  async updateKey(id: string, payload: Partial<ApiKeyPayload>) {
    const response = await api.patch<ApiKeyRecord>(`v1/api-integrations/keys/${id}`, payload);
    return response.data;
  },

  async revokeKey(id: string) {
    await api.delete(`v1/api-integrations/keys/${id}`);
  },
};
