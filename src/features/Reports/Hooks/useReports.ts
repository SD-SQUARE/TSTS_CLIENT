import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ReportDetail, ReportItem, ReportQueryParams, TicketDashboardItem } from '../Types/reports';
import api from '../../../api/http';

export interface DashboardAnalytics {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    inProgressTickets: number;
    pendingTickets: number;
    resolvedTickets: number;
    avgResolutionTimeHours: number;
    slaCompliance: number;
    slaViolated: number;
    ticketsCreatedToday: number;
    ticketsResolvedToday: number;
}

export const useDashboardCharts = (
    params: { startDate?: string; endDate?: string; periodType?: string; },
    options?: Omit<UseQueryOptions<TicketDashboardItem[], Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<TicketDashboardItem[]>({
        queryKey: ['dashboardCharts', params],
        queryFn: async () => (await api.get('/v1/reports/dashboard', { params })).data,
        ...options,
    });
};

export const useDashboardAnalytics = (
    params: { startDate?: string; endDate?: string; },
    options?: Omit<UseQueryOptions<DashboardAnalytics, Error>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<DashboardAnalytics>({
        queryKey: ['dashboardAnalytics', params],
        queryFn: async () => (await api.get('/v1/reports/dashboard/analytics', { params })).data,
        ...options,
    });
};

export const useReportsList = (search?: string) => {
    return useQuery<ReportItem[]>({
        queryKey: ['reports', search],
        queryFn: async () => (await api.get('/v1/reports', { params: { search } })).data,
    });
};

export const useReportDetail = (id: string, params: ReportQueryParams, page?: number, pageSize?: number) => {
    return useQuery<ReportDetail>({
        queryKey: ['reportDetail', id, params, page, pageSize],
        queryFn: async () => (await api.get(`/v1/reports/${id}`, { 
            params: {
                ...params,
                page_index: page,
                page_size: pageSize,
            }
        })).data,
        enabled: !!id,
    });
};