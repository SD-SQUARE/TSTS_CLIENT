import { BaseCrudService } from "../../../api/common/services/common-services";
import type { WorkHour } from "../types/types";

export const workHoursApi = new BaseCrudService<WorkHour>(
  "/work-hours",
  "/work-hours/:id"
);
