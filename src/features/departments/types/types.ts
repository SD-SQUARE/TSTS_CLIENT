import type { BaseEntity } from "../../../api/common/types/common-types";

export interface Department extends BaseEntity {
  universityId: string | number;
  domainId: string | number;
}

export type CreateDepartmentDto = Omit<Department, 'id'>;
export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;
