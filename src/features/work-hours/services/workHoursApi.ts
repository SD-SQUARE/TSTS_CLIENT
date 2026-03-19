import { BaseCrudService } from "../../../api/common/services/common-services";
import type { WorkHour } from "../types/types";

export const workHoursApi = new BaseCrudService<WorkHour>(
  "/system/configuration/work-hours",     
  "/system/configuration/work-hours/:id"
);
