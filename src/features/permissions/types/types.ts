import type { BaseEntity } from "../../../api/common/types/common-types";

export interface PermissionProfilePermission {
  key?: string;
  name_en: string;
  name_ar: string;
}

export interface PermissionProfile extends BaseEntity {
  code: string;
  permissions: PermissionProfilePermission[];
  isSystem?: boolean;
}

export interface SystemPermission {
  id: string | number;
  key?: string;
  name_en: string;
  name_ar: string;
}

export type CreatePermissionProfileDto = Omit<PermissionProfile, 'id'>;
export type UpdatePermissionProfileDto = Partial<CreatePermissionProfileDto>;
