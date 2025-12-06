import type { BaseEntity } from "../../../api/common/types/common-types";

export interface Domain extends BaseEntity {
  universityId: string | number;
}

export type CreateDomainDto = Omit<Domain, 'id'>;
export type UpdateDomainDto = Partial<CreateDomainDto>;