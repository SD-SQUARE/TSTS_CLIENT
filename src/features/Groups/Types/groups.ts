

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
  }

export interface GroupFormData {
  
  nameArabic: string;
  nameEnglish: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  color: string;
  heads: NamedObject[]; 
  teamLeaders: NamedObject | null; 
  specializations: NamedObject[];
}

export interface UserPayload {
  nameArabic: string;
  nameEnglish: string;
  descriptionArabic: string;
  descriptionEnglish: string;
  color: string;
  heads: string[];
  teamLeaders: string | null;
  specializations: string[];
}