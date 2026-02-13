import { BaseCrudService } from "../../../api/common/services/common-services";
import type { Problem } from "../types/types";

export const problemsApi = new BaseCrudService<Problem>(
  "v1/problems",
  "v1/problems/:id"
);