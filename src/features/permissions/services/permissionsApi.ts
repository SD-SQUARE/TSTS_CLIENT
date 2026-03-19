import { BaseCrudService } from "../../../api/common/services/common-services";
import type { PermissionProfile } from "../types/types";

export const permissionApi = new BaseCrudService<PermissionProfile>(
  "v1/permissions/profile",
  "v1/permissions/profile/:id"
);
