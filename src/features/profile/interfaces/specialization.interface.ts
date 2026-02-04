export interface Specialization {
    id: string;
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
}

export interface SpecializationsResponse {
    data: Specialization[];
    meta_data: {
        total: number;
        page_index: number;
        page_size: number;
    };
}
