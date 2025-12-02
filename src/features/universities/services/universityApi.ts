import { BaseCrudService } from "../../../api/common/services/common-services";
import type { University } from "../types/types";

export const universityApi = new BaseCrudService<University>(
  "/universities",
  "/universities/:id"
);
