import axiosInstance from "../../../api/http" ;
import { BaseCrudService } from "../../../api/common/services/common-services";
import type { University } from "../types/types";

class UniversityService extends BaseCrudService<University> {
  async getUsersInUni(uniId: string | number) {
    const res = await axiosInstance.get(`v1/universities/${uniId}/users`);
    return res.data;
  }
}

export const universityApi = new UniversityService(
  "v1/universities",
  "v1/universities/:id"
);