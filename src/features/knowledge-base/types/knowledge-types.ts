import type { BaseEntity } from "../../../api/common/types/common-types";

export interface KnowledgeBaseItem extends BaseEntity {
  title: string;
  description: string;
  specialization: string;
  content: string; 
}

export type CreateKnowledgeBaseDto = Omit<KnowledgeBaseItem, 'id'>;
export type UpdateKnowledgeBaseDto = Partial<CreateKnowledgeBaseDto>;