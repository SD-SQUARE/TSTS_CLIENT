import api from "../../../api/http";

export interface RecycleEntity {
  key: string;
  tableName: string;
  label: string;
}

export interface DeletedRecordsResponse {
  entity: string;
  tableName: string;
  columns: string[];
  records: Record<string, unknown>[];
}

export const recycleBinApi = {
  async getEntities() {
    const response = await api.get<{ entities: RecycleEntity[] }>("v1/recycle-bin/entities");
    return response.data.entities ?? [];
  },

  async getDeletedRecords(entity: string) {
    const response = await api.get<DeletedRecordsResponse>(`v1/recycle-bin/${entity}`);
    return response.data;
  },

  async restore(entity: string, id: string) {
    await api.post(`v1/recycle-bin/${entity}/${id}/restore`);
  },

  async update(entity: string, id: string, data: Record<string, unknown>) {
    const response = await api.put<DeletedRecordsResponse>(`v1/recycle-bin/${entity}/${id}`, data);
    return response.data;
  },
};
