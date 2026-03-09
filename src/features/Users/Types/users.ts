/* eslint-disable @typescript-eslint/no-explicit-any */
    export interface Lookup {
        id: string;
        name: string;
        description?: string;
        color?: string;
    }

    export interface PermissionItem {
        key: string;
        name_en: string;
        name_ar: string;
    }

    export interface PermissionPayloadItem {
        profile_id: string;
        permission_key: string;
    }
    
    export interface ProfileLookup extends Lookup {
        name_en: string;
        name_ar: string;
        description_en?: string;
        description_ar?: string;
        permissions: PermissionItem[];
    }
    
    
    export interface UserListItem {
        id: string;
        image: string; 
        email: string;
        user_type: string;
        first_name_en: string;
        first_name_ar: string;
        mid_name_en: string;
        mid_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        full_name_en?: string;
        full_name_ar?: string;
        ssn: string;
        university?: any;
        domain?: any;
        departments: any[];
        contacts: { phones: string[]; mobiles: string[] };
        status: "Active" | "InActive";
        job_en: string;
        job_ar: string;
        groups?: Lookup[];
        permission_profile?: PermissionPayloadItem[];
        specializations?: Lookup[];
    }
    
    export interface UserFormData {
        id?: string;
        image: File | string | null;
        first_name_en: string;
        first_name_ar: string;
        mid_name_en: string;
        mid_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        full_name_en?: string;
        full_name_ar?: string;
        ssn: string;
        contacts: { phones: string[]; mobiles: string[] };
        job_en: string;
        job_ar: string;
        university: Lookup | null;
        domain: Lookup | null;
        departments: Lookup[];
        permission_profile: string[];
        specializations: Lookup[];
        email: string;
        password: string;
        status: "Active" | "InActive";
        user_type?: string;
    }
    
    
    
    export interface UserPayload {
        image: File | string | null;
        first_name_en: string;
        first_name_ar: string;
        mid_name_en: string;
        mid_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        full_name_en?: string;
        full_name_ar?: string;
        ssn: string;
        contacts: { phones: string[]; mobiles: string[] };
        job_en: string;
        job_ar: string;
        email: string;
        password: string;
        status: "Active" | "InActive";
        user_type?: string;
        departments: string[];
        university: string | null;
        domain: string | null;
        permission_profile: string;
        specializations: string[];
    }