import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { 
  ApiUrlBuilder, 
  ApiPathMutator, 
  API_ROUTES_PATHS, 
  PATH_NAMES 
} from '../app/route.helper';
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
  const token = localStorage.getItem('token'); // Or however you store your JWT
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. The Generic Service Class
// This class handles the logic of calling ApiUrlBuilder and ApiPathMutator
export class BaseCrudService<T> {
  protected listPathKey: string;
  protected detailPathKey: string;

  constructor(listPathKey: string, detailPathKey: string) {
    this.listPathKey = listPathKey;
    this.detailPathKey = detailPathKey;
  }

  // GET ALL
  async getAll(params?: Record<string, any>): Promise<T[]> {
    const url = ApiUrlBuilder(API_ROUTES_PATHS[this.listPathKey]);
    const response = await axiosInstance.get<T[]>(url, { params });
    return response.data;
  }

  // GET ONE
  async getById(id: string | number): Promise<T> {
    const rawPath = API_ROUTES_PATHS[this.detailPathKey];
    const path = ApiPathMutator(rawPath, { id });
    const url = ApiUrlBuilder(path);
    
    const response = await axiosInstance.get<T>(url);
    return response.data;
  }

  // CREATE
  async create(data: Partial<T>): Promise<T> {
    const url = ApiUrlBuilder(API_ROUTES_PATHS[this.listPathKey]);
    const response = await axiosInstance.post<T>(url, data);
    return response.data;
  }

  // UPDATE
  async update(id: string | number, data: Partial<T>): Promise<T> {
    const rawPath = API_ROUTES_PATHS[this.detailPathKey];
    const path = ApiPathMutator(rawPath, { id });
    const url = ApiUrlBuilder(path);

    const response = await axiosInstance.put<T>(url, data);
    return response.data;
  }

  // DELETE
  async delete(id: string | number): Promise<void> {
    const rawPath = API_ROUTES_PATHS[this.detailPathKey];
    const path = ApiPathMutator(rawPath, { id });
    const url = ApiUrlBuilder(path);

    await axiosInstance.delete(url);
  }
}

// 3. Specific Services

// --- Universities ---
export const universityApi = new BaseCrudService<University>(
  PATH_NAMES.UNIVERSITIES, 
  PATH_NAMES.SELECTED_UNIVERSITY
);

// --- Domains ---
class DomainService extends BaseCrudService<Domain> {
  // Example of a custom method specific to Domains
  async getUsersInDomain(domainId: string | number) {
    // Uses: DOMAIN_USERS -> /domains/:id/users
    const rawPath = API_ROUTES_PATHS[PATH_NAMES.DOMAIN_USERS];
    const path = ApiPathMutator(rawPath, { id: domainId });
    const url = ApiUrlBuilder(path);
    return axiosInstance.get(url);
  }
}
export const domainApi = new DomainService(PATH_NAMES.DOMAINS, PATH_NAMES.SELECTED_DOMAIN);

// --- Departments ---
class DepartmentService extends BaseCrudService<Department> {
  async getUsersInDept(deptId: string | number) {
    const rawPath = API_ROUTES_PATHS[PATH_NAMES.DEPARTMENT_USERS];
    const path = ApiPathMutator(rawPath, { id: deptId });
    const url = ApiUrlBuilder(path);
    return axiosInstance.get(url);
  }
}
export const departmentApi = new DepartmentService(PATH_NAMES.DEPARTMENTS, PATH_NAMES.SELECTED_DEPARTMENT);

// --- Specializations ---
export const specializationApi = new BaseCrudService<Specialization>(
  PATH_NAMES.SPECIALIZATIONS,
  PATH_NAMES.SELECTED_SPECIALIZATION
);

// --- Work Hours ---
export const workHoursApi = new BaseCrudService<WorkHour>(
  PATH_NAMES.WORK_HOURS,
  PATH_NAMES.SELECTED_WORK_HOURS
);

// --- Permissions ---
export const permissionApi = new BaseCrudService<PermissionProfile>(
  PATH_NAMES.PERMISSIONS, 
  PATH_NAMES.SELECTED_PERMISSION
);

export default axiosInstance;