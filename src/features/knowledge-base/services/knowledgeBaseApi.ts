import { BaseCrudService } from "../../../api/common/services/common-services";
import api from "../../../api/http";
import type { KnowledgeBaseItem } from "../types/knowledge-types";

export interface KnowledgeBaseCategory {
  value: string;
  specialization_en: string;
  specialization_ar: string;
}

class KnowledgeBaseService extends BaseCrudService<KnowledgeBaseItem> {
  async getCategories() {
    const response = await api.get<{ items: KnowledgeBaseCategory[] }>("v1/knowledge-base/categories");
    return response.data.items ?? [];
  }
}

export const knowledgeBaseApi = new KnowledgeBaseService(
  "v1/knowledge-base",
  "v1/knowledge-base/:id"
);
