import type { BaseEntity } from "../../../api/common/types/common-types";


export interface PermissionProfile extends BaseEntity {
  code: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface SystemPermission {
  id: string | number;
  code: string;
  label: string;
  group: string;
}

export type CreatePermissionProfileDto = Omit<PermissionProfile, 'id'>;
export type UpdatePermissionProfileDto = Partial<CreatePermissionProfileDto>;
