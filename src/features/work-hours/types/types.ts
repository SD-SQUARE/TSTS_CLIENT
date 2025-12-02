import type { BaseEntity } from "../../../api/common/types/common-types";

export interface WorkHour extends BaseEntity {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  isActive: boolean;
  timeZone?: string;
}

export type CreateWorkHourDto = Omit<WorkHour, 'id'>;
export type UpdateWorkHourDto = Partial<CreateWorkHourDto>;