import { BaseCrudService } from "../../../api/common/services/common-services";
import type { WorkHour } from "../../profile/types/index";

export const workHoursApi = new BaseCrudService<WorkHour>(
  "/work-hours",
  "/work-hours/:id"
);
