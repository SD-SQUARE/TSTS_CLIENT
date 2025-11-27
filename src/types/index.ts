export interface BaseEntity {
    id: string | number;
    name?: string;
    description?: string;
  }
  
  export interface University extends BaseEntity {}
  
  export interface Domain extends BaseEntity {
    universityId: string | number; 
  }
  
  export interface Department extends BaseEntity {
    universityId: string | number;
    domainId: string | number;
  }
  

export interface Specialization extends BaseEntity {
    departmentId: string | number; 
    
    departmentName?: string; 
  }
  
  export interface WorkHour extends BaseEntity {
    startTime: string; 
    endTime: string;
    
    daysOfWeek: number[]; 
    
    isActive: boolean;
    
    timeZone?: string; 
  }
  
  export interface PermissionProfile extends BaseEntity {
    code: string; 

    permissions: string[]; 
    
    isSystem?: boolean;
  }
  
  export interface SystemPermission {
    id: string | number;
    code: string;       
    label: string;      
    group: string;      
  }