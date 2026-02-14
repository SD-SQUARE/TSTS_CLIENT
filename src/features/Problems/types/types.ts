import type { BaseEntity } from "../../../api/common/types/common-types";
import type { Specialization } from "../../specializations/types/types";

export interface Problem extends BaseEntity {
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  specialization_id: string | number;
  specialization?: Specialization; 
}

export type CreateProblemDto = Omit<Problem, 'id' | 'specialization'>;
export type UpdateProblemDto = Partial<CreateProblemDto>;