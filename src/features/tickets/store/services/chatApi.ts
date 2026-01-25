/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi } from '@reduxjs/toolkit/query/react';
import api from '../../../../api/http';

export interface ChatMessage {
    id: string;
    message: string;
    media: {
        id: string;
        fileName: string;
        mime: string;
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

export const chatApi = createApi({
    reducerPath: 'chatApi',
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
                url: `/api/v1/tickets/${ticketId}/chat`,
                method: 'GET',
            }),
            async onCacheEntryAdded(ticketId, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const ws = new WebSocket(`ws://localhost:3000/ws/tickets/${ticketId}`);
                
                try {
                    await cacheDataLoaded;
                    const listener = (event: MessageEvent) => {
                        const data = JSON.parse(event.data);
                        updateCachedData((draft) => {
                            if (!draft.find(msg => msg.id === data.id)) {
                                draft.push(data);
                            }
                        });
                    };
                    ws.addEventListener('message', listener);
                } catch {
                    console.error("WebSocket connection failed");
                }

                await cacheEntryRemoved;
                if (ws.readyState <= WebSocket.OPEN) {
                    ws.close();
                }
            },
        }),

        sendMessage: builder.mutation<ChatMessage, { ticketId: string; message: string; mediaIds?: string[] }>({
            query: ({ ticketId, message, mediaIds }) => ({
                url: `/api/v1/tickets/${ticketId}/chat`,
                method: 'POST',
                data: { message,
                    media_ids: mediaIds
                },
            }),
        }),
        
        uploadChatMedia: builder.mutation<any[], { ticketId: string; formData: FormData }>({
            query: ({ ticketId, formData }) => ({
                url: `/api/v1/tickets/${ticketId}/chat/media`,
                method: 'POST',
                data: formData, 
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }),
        }),
    }),
});

export const { 
    useGetChatMessagesQuery, 
    useUploadChatMediaMutation, 
    useSendMessageMutation
} = chatApi;