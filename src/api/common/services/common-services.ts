// src/api/common/services/common-services.ts

import api from "../../http"; 
import type { PaginatedResponse } from "../types/common-types";

export class BaseCrudService<T> {
  protected listUrl: string;
  protected detailUrl: string;

  constructor(listUrl: string, detailUrl: string) {
    this.listUrl = listUrl;
    this.detailUrl = detailUrl;
  }

  async getAll(params?: Record<string, any>): Promise<PaginatedResponse<T>> {
    //   console.log(this.listUrl);
      const response = await api.get<PaginatedResponse<T>>(this.listUrl, { params });
    //   console.log("API RESPONSE:", response.data);
      return response.data;
  }

  async getById(id: string | number): Promise<T> {
    const url = this.detailUrl.replace(':id', id.toString());
    const response = await api.get<T>(url);
    return response.data;
  }

  async create(data: Partial<T>): Promise<T> {
    console.log(this.listUrl);
    
    const response = await api.post<T>(this.listUrl, data);
    return response.data;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const url = this.detailUrl.replace(':id', id.toString());
    const response = await api.put<T>(url, data);
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    const url = this.detailUrl.replace(':id', id.toString());
    await api.delete(url);
  }
}
