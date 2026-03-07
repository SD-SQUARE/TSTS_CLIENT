import type { BaseEntity } from "../../../api/common/types/common-types";

export interface WorkHour extends BaseEntity {
  start_time: string;
  end_time: string;
  status: string;
}

export type CreateWorkHourDto = Omit<WorkHour, 'id'>;
export type UpdateWorkHourDto = Partial<CreateWorkHourDto>;