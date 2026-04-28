import type { Domain } from "./domain.interface";
import type { Contacts } from "./contacts.interface";
import type { Department } from "./department.interface";
import type { University } from "./university.interface";

export interface User {
    id: string;
    image: string | null;
    email: string;
    user_type: string;
    allow_profile_edit?: boolean;

    first_name_en: string;
    first_name_ar: string;
    mid_name_en: string;
    mid_name_ar: string;
    last_name_en: string;
    last_name_ar: string;

    ssn: string;

    university: University;
    domain: Domain;
    departments: Department[];

    contacts: Contacts;

    status: string;

    job_en: string;
    job_ar: string;
}
