export interface BaseEntity {
    id: string | number;
  
    name_en?: string;
    name_ar?: string;
  
    description_en?: string;
    description_ar?: string;
  }
  

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page_index: number;
        page_size: number;
    };
}
