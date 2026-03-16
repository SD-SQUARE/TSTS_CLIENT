import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { ReportDetail, ReportItem, ReportQueryParams, TicketDashboardItem } from '../Types/reports';
import api from '../../../api/http';

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

export const useReportsList = (search?: string) => {
    return useQuery<ReportItem[]>({
        queryKey: ['reports', search],
        queryFn: async () => (await api.get('/v1/reports', { params: { search } })).data,
    });
};

export const useReportDetail = (id: string, params: ReportQueryParams) => {
    return useQuery<ReportDetail>({
        queryKey: ['reportDetail', id, params],
        queryFn: async () => (await api.get(`/v1/reports/${id}`, { params })).data,
        enabled: !!id,
    });
};