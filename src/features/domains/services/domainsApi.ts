import axiosInstance from "../../../api/http";
import { BaseCrudService } from "../../../api/common/services/common-services";
import type { Domain } from "../types/types";

class DomainService extends BaseCrudService<Domain> {
  async getUsersInDomain(domainId: string | number) {
    const res = await axiosInstance.get(`/domains/${domainId}/users`);
    return res.data;
  }
}

export const domainApi = new DomainService(
  "/domains",
  "/domains/:id"
);
