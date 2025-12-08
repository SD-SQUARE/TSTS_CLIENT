import type { BaseEntity } from "../../../api/common/types/common-types";

export interface Specialization extends BaseEntity {
}

export type CreateSpecializationDto = Omit<Specialization, 'id'>;
export type UpdateSpecializationDto = Partial<CreateSpecializationDto>;