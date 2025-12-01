import type { BaseEntity } from "../../../api/common/types/common-types";

export interface Specialization extends BaseEntity {
  departmentId: string | number;
  departmentName?: string;
}
