/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ticket, TicketsResponse } from '../Types/tickets';
import api from '../../../api/http';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const fetchTickets = async (page: number, pageSize: number, searchQuery: { [key: string]: string }): Promise<{ data: Ticket[], total: number }> => {

    const query = Object.entries(searchQuery).filter(([, value]) => value).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    const response = await api.get<TicketsResponse>(`/v1/tickets/`, {
        params: { page, page_size: pageSize, ...query },
    });




    return {
        data: response.data.tickets,
        total: Math.floor(response.data.meta.total)

    };
};

export const useTickets = (page: number, pageSize: number, searchQuery: { [key: string]: string } = {}) => {
    return useQuery({
        queryKey: ['tickets', page, pageSize, searchQuery],
        queryFn: () => fetchTickets(page, pageSize, searchQuery),
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


export const useTicketActivities = (ticketId: string | undefined) => {
    return useQuery<TicketActivity[]>({
        queryKey: ['ticketActivities', ticketId],
        queryFn: async () => {
            if (!ticketId) return [];
            const response = await api.get(`/v1/tickets/${ticketId}/activities`);
            return response.data;
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] });
        },
    });
};