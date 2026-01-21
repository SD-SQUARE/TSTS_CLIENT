import { BaseCrudService } from "../../../api/common/services/common-services";
import type { KnowledgeBaseItem } from "../types/knowledge-types";

export const knowledgeBaseApi = new BaseCrudService<KnowledgeBaseItem>(
  "v1/knowledge-base",
  "v1/knowledge-base/:id"
);