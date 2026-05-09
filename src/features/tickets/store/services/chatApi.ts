/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from '@reduxjs/toolkit/query/react';
import api from '../../../../api/http';

export interface ChatMessage {
    id: string;
    message: string;
    media: {
        id: string;
        fileName: string;
        mime: string | null;
        url: string;
    }[];
    sender: {
        id: string;
        name: string;
        image: string;
    };
    ticketId: string;
    createdAt: string;
}

export interface QuickMessage {
    id: string;
    title_en: string;
    title_ar: string;
    content_en: string;
    content_ar: string;
    createdAt: string;
    updatedAt: string;
}

export const chatApi = createApi({
    reducerPath: 'chatApi',
    tagTypes: ['TicketChat', 'QuickMessages'],
    baseQuery: async ({ url, method, data, params, headers }) => {
        
        try {
            const result = await api({ url, method, data, params, headers });
            return { data: result.data };
        } catch (axiosError: any) {
            const err = axiosError;
            return {
                error: {
                    status: err.response?.status,
                    data: err.response?.data || err.message,
                },
            };
        }
    },
    endpoints: (builder) => ({
        getChatMessages: builder.query<ChatMessage[], string>({
            query: (ticketId) => ({
                url: `/v1/tickets/${ticketId}/chat`,
                method: 'GET',
            }),
            providesTags: (_result, _error, ticketId) => [{ type: 'TicketChat', id: ticketId }],
            // TODO: Use Socket.IO with chat 
            // async onCacheEntryAdded(ticketId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
            //     const ws = new WebSocket(`ws://localhost:5000/ws/tickets/${ticketId}`);
                
            //     try {
            //         await cacheDataLoaded;
            //         const listener = (event: MessageEvent) => {
            //             const data = JSON.parse(event.data);
            //             updateCachedData((draft) => {
            //                 if (!draft.find(msg => msg.id === data.id)) {
            //                     draft.push(data);
            //                 }
            //             });
            //         };
            //         ws.addEventListener('message', listener);
            //     } catch {
            //         console.error("WebSocket connection failed");
            //     }

            //     await cacheEntryRemoved;
            //     if (ws.readyState <= WebSocket.OPEN) {
            //         ws.close();
            //     }
            // },
        }),

        sendMessage: builder.mutation<ChatMessage, { ticketId: string; message: string; mediaIds?: string[], userID?: string }>({
            query: ({ ticketId, message, mediaIds, userID }) => ({
                url: `/v1/tickets/${ticketId}/chat`,
                method: 'POST',
                data: {
                    message,
                    mediaIds: mediaIds,
                    senderId: userID
                },
                
            }),
            invalidatesTags: (_result, _error, { ticketId }) => [{ type: 'TicketChat', id: ticketId }],
        }),
        
        uploadChatMedia: builder.mutation<any[], { ticketId: string; formData: FormData }>({
            query: ({ ticketId, formData }) => ({
                url: `/v1/tickets/${ticketId}/chat/media`,
                method: 'POST',
                data: formData, 
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }),
        }),

        getQuickMessages: builder.query<QuickMessage[], void>({
            query: () => ({
                url: '/v1/tickets/quick-messages',
                method: 'GET',
            }),
            providesTags: ['QuickMessages'],
        }),

        createQuickMessage: builder.mutation<
            QuickMessage,
            {
                title_en?: string;
                title_ar?: string;
                content_en: string;
                content_ar: string;
            }
        >({
            query: ({ title_en, title_ar, content_en, content_ar }) => ({
                url: '/v1/tickets/quick-messages',
                method: 'POST',
                data: {
                    title_en,
                    title_ar,
                    content_en,
                    content_ar,
                },
            }),
            invalidatesTags: ['QuickMessages'],
        }),

        updateQuickMessage: builder.mutation<
            QuickMessage,
            {
                id: string;
                title_en?: string;
                title_ar?: string;
                content_en: string;
                content_ar: string;
            }
        >({
            query: ({ id, title_en, title_ar, content_en, content_ar }) => ({
                url: `/v1/tickets/quick-messages/${id}`,
                method: 'PUT',
                data: {
                    title_en,
                    title_ar,
                    content_en,
                    content_ar,
                },
            }),
            invalidatesTags: ['QuickMessages'],
        }),

        deleteQuickMessage: builder.mutation<void, string>({
            query: (id) => ({
                url: `/v1/tickets/quick-messages/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['QuickMessages'],
        }),
    }),
});

export const { 
    useGetChatMessagesQuery, 
    useUploadChatMediaMutation, 
    useSendMessageMutation,
    useGetQuickMessagesQuery,
    useCreateQuickMessageMutation,
    useUpdateQuickMessageMutation,
    useDeleteQuickMessageMutation,
} = chatApi;
