/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TicketStatistic {
    period: string;
    value: number;
}

export interface TicketDashboardItem {
    ticketType: string;
    statistics: TicketStatistic[];
}

export interface ReportItem {
    id: string;
    title: string;
    description: string;
}

export interface FlattenedChartData {
    type: string;
    period: string;
    value: number;
}

export interface DynamicColumn {
    key: string;
    label: string;
}

export interface ReportDetail {
    id: string;
    title: string;
    statistics: TicketStatistic[];
    columns: DynamicColumn[];
    records: Record<string, any>[];
    filters: string[];
    meta?: {
        page_size: number;
        page_index: number;
        total: number;
        total_pages: number;
    };
}

export interface ReportQueryParams {
    startDate?: string;
    endDate?: string;
    periodType?: string;
    download?: boolean;
    type?: 'pdf' | 'excel';
    filters?: string;
}