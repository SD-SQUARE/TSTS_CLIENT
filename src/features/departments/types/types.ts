import type { BaseEntity } from "../../../api/common/types/common-types";

export interface Department extends BaseEntity {
  universityId: string | number;
  domainId: string | number;
}
