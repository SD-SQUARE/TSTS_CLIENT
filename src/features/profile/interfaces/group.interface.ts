export interface Group {
    id: string;
    name: string;
    description: string;
    color: string;
}

export interface GroupsResponse {
    data: Group[];
    meta_data: {
        total: number;
        page_index: number;
        page_size: number;
    };
}
