
import type { BaseEntity } from "../../../api/common/types/common-types";

export interface University extends BaseEntity {}

export type CreateUniversityDto = Omit<University, 'id'>;
export type UpdateUniversityDto = Partial<CreateUniversityDto>;
