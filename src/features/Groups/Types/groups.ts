export interface NamedObject {
  id: string;
  name: string;
  name_en?: string;
  name_ar?: string;
  user_type?: string;
}

export interface GroupUser extends NamedObject {
  image?: string;
  email?: string;
  user_type?: string;
  status?: string;
  first_name?: { en: string; ar: string };
  mid_name?: { en: string; ar: string };
  last_name?: { en: string; ar: string };
  first_name_en?: string;
  first_name_ar?: string;
  mid_name_en?: string;
  mid_name_ar?: string;
  last_name_en?: string;
  last_name_ar?: string;
  job_en?: string;
  job_ar?: string;
  job_title?: { en: string; ar: string };
  display_name?: string;
}

export interface GroupTeam {
  id?: string;
  name_en: string;
  name_ar: string;
  leads: GroupUser[];
  technicians: GroupUser[];
  leads_count?: number;
  members_count?: number;
}

export interface Group {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  color: string;
  heads: NamedObject[];
  team_leads: NamedObject[];
  specializations: NamedObject[];
  teams?: GroupTeam[];
  teams_count?: number;
}

export interface DisplayMember {
  id: string;
  name: string;
  color?: string;
}

export interface GroupFormData {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  color: string;
  heads: NamedObject[];
  team_leads: NamedObject[];
  specializations: NamedObject[];
  members?: GroupUser[];
  teams?: GroupTeam[];
  unassigned_members?: GroupUser[];
}

export interface GroupAssignmentsPayload {
  users: string[];
  teams: Array<{
    id?: string;
    name_en: string;
    name_ar: string;
    lead_ids: string[];
    member_ids: string[];
  }>;
}

export interface UserPayload {
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  color: string;
  heads: string[];
  specializations: string[];
}
