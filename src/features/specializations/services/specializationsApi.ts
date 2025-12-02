import { BaseCrudService } from "../../../api/common/services/common-services";
import type { Specialization } from "../types/types";

export const specializationApi = new BaseCrudService<Specialization>(
  "/specializations",
  "/specializations/:id"
);
