    export interface Lookup {
        id: string;
        name: string;
        description?: string;
    }
    
    export interface ProfileLookup extends Lookup {
        name_en: string;
        name_ar: string;
        description_en?: string;
        description_ar?: string;
        // and permissions if needed
    }
    
    
    export interface UserListItem {
        id: string;
        image: string; // for avatar preview
        email: string;
        user_type: string;
        first_name: string;
        mid_name: string;
        last_name: string;
        ssn: string;
        university?: Lookup;
        domain?: Lookup;
        departments: Lookup[];
        contacts: { phones: string[]; mobiles: string[] };
        status: "Active" | "InActive";
        job: string;
        groups?: Lookup[];
        permission_profile?: Lookup;
        specializations?: Lookup[];
    }
    
    export interface UserFormData {
        image: File | string | null;
        first_name: string;
        mid_name: string;
        last_name: string;
        ssn: string;
        contacts: { phones: string[]; mobiles: string[] };
        job: string;
        university: Lookup | null;
        domain: Lookup | null;
        departments: Lookup[];
        permission_profile: Lookup | null;
        specializations: Lookup[];
        email: string;
        password: string;
        status: "Active" | "InActive";
    }
    
    
    
    export interface UserPayload {
        image: File | string | null;
        first_name: string;
        mid_name: string;
        last_name: string;
        ssn: string;
        contacts: { phones: string[]; mobiles: string[] };
        job: string;
        email: string;
        password: string;
        status: "Active" | "InActive";
        
        departments: string[];
        university: string | null;
        domain: string | null;
        permission_profile: string | null;
        specializations: string[];
    }