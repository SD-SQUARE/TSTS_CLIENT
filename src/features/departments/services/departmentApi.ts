import axiosInstance from "../../../api/http";
import { BaseCrudService } from "../../../api/common/services/common-services";
import type { Department } from "../types/types";

class DepartmentService extends BaseCrudService<Department> {
  async getUsersInDept(deptId: string | number) {
    const res = await axiosInstance.get(`/departments/${deptId}/users`);
    return res.data;
  }
}

export const departmentApi = new DepartmentService(
  "/departments",
  "/departments/:id"
);
