/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ticket, TicketsResponse } from '../Types/tickets';
import api from '../../../api/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import i18n from '../../../i18n';

export type TicketSearchValue = string | string[];
export type TicketSearchQuery = Record<string, TicketSearchValue>;
export type TicketAnalytics = Record<string, number | undefined>;

const extractLookupArray = (payload: any, key: string) => {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.[key])) {
        return payload[key];
    }

    return [];
};

const fetchTickets = async (page: number, pageSize: number, searchQuery: TicketSearchQuery): Promise<{ data: Ticket[], total: number }> => {

    const query = Object.entries(searchQuery).reduce<Record<string, TicketSearchValue>>((acc, [key, value]) => {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                acc[key] = value;
            }
            return acc;
        }

        if (value) {
            acc[key] = value;
        }

        return acc;
    }, {});
    const response = await api.get(`/v1/tickets/`, {
        params: { page_index: page, page_size: pageSize, ...query },
        paramsSerializer: {
            indexes: null,
        },
    });
    const data = response.data as TicketsResponse;

    return {
        data: data.tickets,
        total: Math.floor(data.meta.total)

    };
};

export const useTickets = (page: number, pageSize: number, searchQuery: TicketSearchQuery = {}) => {
    return useQuery({
        queryKey: ['tickets', page, pageSize, searchQuery],
        queryFn: () => fetchTickets(page, pageSize, searchQuery),
    });
};

const fetchTicketAnalytics = async (): Promise<TicketAnalytics> => {
    const { data } = await api.get('/v1/tickets/analytics');
    return data || {};
};

export const useTicketAnalytics = () => {
    return useQuery({
        queryKey: ['tickets', 'analytics', i18n.language],
        queryFn: fetchTicketAnalytics,
        staleTime: 30 * 1000,
    });
};

export const useTicketMedia = (id?: string) => {
    return useQuery({
        queryKey: ['ticketMedia', id],
        queryFn: async () => {
            const { data } = await api.get(`/v1/tickets/${id}/media/`);
            return data;
        },
        enabled: !!id,
    });
};


export interface TicketActivity {
    id: string;
    type: 'reopened' | 'pending' | 'error' | 'closed' | string;
    title: string;
    content: string;
    meta: any;
    createdAt: string;
}


export const useTicketActivities = (ticketId: string | undefined, params?: any) => {
    return useQuery({
        queryKey: ['ticketActivities', ticketId, params],
        queryFn: async () => {
            const { data } = await api.get(`/v1/tickets/${ticketId}/activities`, { 
                params 
            });
            return data;
        },
        enabled: !!ticketId,
    });
};


export const useTimelineZoom = (initialZoom = 1) => {
    const [zoom, setZoom] = useState(initialZoom);

    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.6));
    const handleResetZoom = () => setZoom(1);

    return {
        zoom,
        handleZoomIn,
        handleZoomOut,
        handleResetZoom,
    };
};

export const useTicketReviews = (ticketId: string | undefined) => {
    return useQuery({
        queryKey: ['ticketReviews', ticketId],
        queryFn: async () => {
            if (!ticketId) return null;
            const { data } = await api.get(`/v1/tickets/${ticketId}/reviews`);
            return data;
        },
        enabled: !!ticketId, 
    });
};

export const useChangeTicketStatus = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newStatus: string) => {
            const { data } = await api.patch(`/v1/tickets/${id}/change-status`, {
                status: newStatus,
            });
            return data;
        },
        onSuccess: async() => {
            await queryClient.invalidateQueries({ queryKey: ['ticket', id] });
            await queryClient.invalidateQueries({ queryKey: ['tickets'] });
            await queryClient.invalidateQueries({ queryKey: ['ticketActivities', id] });
            await queryClient.invalidateQueries({ queryKey: ['ticketReviews', id] });
        },
    });
};

export const useUserProfile = (id: string) => {
    return useQuery({
        queryKey: ['userProfile', id],
        queryFn: async () => {
            const { data } = await api.get(`/v1/users/profile/${id}/view`);
            return data;
        },
        enabled: !!id,
    });
};

export const useUsersLookup = () => {
  return useQuery({
        queryKey: ['lookup', 'users'],
        queryFn: async () => {
            const { data } = await api.get('/v1/lockups/users');
            return data; 
        },
        staleTime: 5 * 60 * 1000, 
    });
};

export interface TicketFilterLookupItem {
    id: string;
    name: string;
    name_en?: string;
    name_ar?: string;
    email?: string;
}

export const useRequestersLookup = (enabled = true) =>
    useQuery({
        queryKey: ['lookup', 'requesters', i18n.language],
        queryFn: async () => {
            const { data } = await api.get('/v1/lockups/requesters');
            return extractLookupArray(data, 'users').map((user: any) => ({
                id: user.id,
                name: user.name_en || user.name_ar || user.email || '',
                name_en: user.name_en,
                name_ar: user.name_ar,
                email: user.email,
            })) as TicketFilterLookupItem[];
        },
        enabled,
        staleTime: 5 * 60 * 1000,
    });

export const useTicketUniversitiesLookup = () =>
    useQuery({
        queryKey: ['lookup', 'ticket-universities', i18n.language],
        queryFn: async () => {
            const { data } = await api.get('/v1/lockups/universities');
            return extractLookupArray(data, 'universities');
        },
        staleTime: 5 * 60 * 1000,
    });

export const useTicketDomainsLookup = () =>
    useQuery({
        queryKey: ['lookup', 'ticket-domains', i18n.language],
        queryFn: async () => {
            const { data } = await api.get('/v1/lockups/domains');
            return extractLookupArray(data, 'domains');
        },
        staleTime: 5 * 60 * 1000,
    });

export const useTicketDepartmentsLookup = () =>
    useQuery({
        queryKey: ['lookup', 'ticket-departments', i18n.language],
        queryFn: async () => {
            const { data } = await api.get('/v1/lockups/departments');
            return extractLookupArray(data, 'departments');
        },
        staleTime: 5 * 60 * 1000,
    });

export const useTicketActivityUsersLookup = (ticketId?: string) => {
    return useQuery({
        queryKey: ['lookup', 'ticket-activity-users', ticketId],
        queryFn: async () => {
            const { data } = await api.get(`/v1/lockups/ticket/${ticketId}/activity-users`);
            return data;
        },
        enabled: !!ticketId,
        staleTime: 5 * 60 * 1000,
    });
};

export const useActionsLookup = (ticketId?: string) => {
    return useQuery({
        queryKey: ['lookup', 'actions', ticketId],
        queryFn: async () => {
            const { data } = await api.get(`/v1/lockups/ticket/${ticketId}/activities`);
            return data; 
        },
        enabled: !!ticketId,
        staleTime: 5 * 60 * 1000,
    });
};
