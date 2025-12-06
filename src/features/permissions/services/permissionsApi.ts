import { BaseCrudService } from "../../../api/common/services/common-services";
import type { PermissionProfile } from "../types/types";

export const permissionApi = new BaseCrudService<PermissionProfile>(
  "/permissions",
  "/permissions/:id"
);
