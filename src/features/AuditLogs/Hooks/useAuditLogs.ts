import { useQuery } from '@tanstack/react-query';
import api from '../../../api/http';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAuditLogs = (filters: any) => {
    return useQuery({
        queryKey: ['audit-logs', filters],
        queryFn: async () => {
            const { data } = await api.get('/v1/audit-logs', { params: filters });
            return data;
        },
    });
};

export const useAuditLogDetails = (id: string) => {
    return useQuery({
        queryKey: ['audit-log', id],
        queryFn: async () => {
            const { data } = await api.get(`/v1/audit-logs/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useAuditLookups = () => {
    return useQuery({
        queryKey: ['audit-actions'],
        queryFn: async () => {
            const { data } = await api.get('/v1/lookups/actions');
            return data; 
        }
    });
};

export const useUserLookup = () => {
    return useQuery({
        queryKey: ['users-list'],
        queryFn: async () => {
            const { data } = await api.get('/v1/lockups/users');
            return data.users;
        }
    });
};