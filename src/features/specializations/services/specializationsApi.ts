import { BaseCrudService } from "../../../api/common/services/common-services";
import type { Specialization } from "../../profile/types/index";

export const specializationApi = new BaseCrudService<Specialization>(
  "/specializations",
  "/specializations/:id"
);
