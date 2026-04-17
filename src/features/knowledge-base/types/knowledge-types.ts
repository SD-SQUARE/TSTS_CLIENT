import type { BaseEntity } from "../../../api/common/types/common-types";

export interface KnowledgeBaseItem extends BaseEntity {
  title?: string;
  description?: string;
  specialization?: string;
  content?: string;
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  specialization_en?: string;
  specialization_ar?: string;
  content_en?: string;
  content_ar?: string;
}

export interface KnowledgeBaseFormValues {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  specialization_en: string;
  specialization_ar: string;
  content_en: string;
  content_ar: string;
}

export type CreateKnowledgeBaseDto = KnowledgeBaseFormValues;
export type UpdateKnowledgeBaseDto = Partial<CreateKnowledgeBaseDto>;
