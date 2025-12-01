import { BaseCrudService } from "../../../api/common/services/common-services";
import type { University } from "../../profile/types/index";

export const universityApi = new BaseCrudService<University>(
  "/universities",
  "/universities/:id"
);
