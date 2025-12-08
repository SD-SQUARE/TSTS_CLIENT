import type { BaseEntity } from "../../../api/common/types/common-types";

export interface Domain extends BaseEntity {
  university: any;
}

export type CreateDomainDto = Omit<Domain, 'id'>;
export type UpdateDomainDto = Partial<CreateDomainDto>;