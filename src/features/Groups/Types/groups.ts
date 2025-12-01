

export interface NamedObject {
    id: string;
    name: string;
  }
  
  export interface Group {
    id: string;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    color: string;
    heads: NamedObject[]; 
    team_leader: NamedObject; 
    specializations: NamedObject[]; 
    
  }
  
  
  
  export interface DisplayMember {
      id: string;
      name: string;
      color?: string;
  }

export interface GroupFormData {
  
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    color: string;
    heads: NamedObject[]; 
    team_leader: NamedObject; 
    specializations: NamedObject[]; 
}

export interface UserPayload {
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  color: string;
  heads: string[];
  team_leader: string | null;
  specializations: string[];
}