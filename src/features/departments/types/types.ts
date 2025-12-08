import type { BaseEntity } from "../../../api/common/types/common-types";

export interface Department extends BaseEntity {
  university: any;
  domain: any;
}

export type CreateDepartmentDto = Omit<Department, 'id'>;
export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;
