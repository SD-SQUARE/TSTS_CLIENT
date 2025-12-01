import axios, { type AxiosInstance } from 'axios';
import type { 
  University, 
  Domain, 
  Department, 
  Specialization, 
  WorkHour, 
  PermissionProfile 
} from '../types';

// 1. Setup Axios Instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. The Generic Service Class
export class BaseCrudService<T> {
  protected listUrl: string;
  protected detailUrl: string;

  constructor(listUrl: string, detailUrl: string) {
    this.listUrl = listUrl;
    this.detailUrl = detailUrl;
  }

  async getAll(params?: Record<string, any>): Promise<T[]> {
    const response = await axiosInstance.get<T[]>(this.listUrl, { params });
    return response.data;
  }

  async getById(id: string | number): Promise<T> {
    const url = this.detailUrl.replace(':id', id.toString());
    const response = await axiosInstance.get<T>(url);
    return response.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await axiosInstance.post<T>(this.listUrl, data);
    return response.data;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const url = this.detailUrl.replace(':id', id.toString());
    const response = await axiosInstance.put<T>(url, data);
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    const url = this.detailUrl.replace(':id', id.toString());
    await axiosInstance.delete(url);
  }
}

// 3. Specific Services

export const universityApi = new BaseCrudService<University>(
  '/universities',        // list
  '/universities/:id'     // detail
);

class DomainService extends BaseCrudService<Domain> {
  async getUsersInDomain(domainId: string | number) {
    return axiosInstance.get(`/domains/${domainId}/users`);
  }
}
export const domainApi = new DomainService(
  '/domains',
  '/domains/:id'
);

class DepartmentService extends BaseCrudService<Department> {
  async getUsersInDept(deptId: string | number) {
    return axiosInstance.get(`/departments/${deptId}/users`);
  }
}
export const departmentApi = new DepartmentService(
  '/departments',
  '/departments/:id'
);

export const specializationApi = new BaseCrudService<Specialization>(
  '/specializations',
  '/specializations/:id'
);

export const workHoursApi = new BaseCrudService<WorkHour>(
  '/work-hours',
  '/work-hours/:id'
);

export const permissionApi = new BaseCrudService<PermissionProfile>(
  '/permissions',
  '/permissions/:id'
);

export default axiosInstance;
