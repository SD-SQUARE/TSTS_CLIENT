import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/http';
import type {
  FinalReportAttachment,
  FinalReportHistoryFilters,
  FinalReportHistoryItem,
  FinalReportListFilters,
  FinalReportListResponse,
  TicketFinalReport,
  TicketFinalReportPayload,
} from '../Types/finalReport';

export const useTicketFinalReport = (ticketId?: string) =>
  useQuery<TicketFinalReport | null>({
    queryKey: ['ticketFinalReport', ticketId],
    queryFn: async () => {
      const { data } = await api.get(`/v1/tickets/${ticketId}/final-report`);
      return data;
    },
    enabled: !!ticketId,
  });

export const useUpsertTicketFinalReport = (ticketId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TicketFinalReportPayload) => {
      const { data } = await api.put(`/v1/tickets/${ticketId}/final-report`, payload);
      return data as TicketFinalReport;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['ticketFinalReport', ticketId], data);
      queryClient.invalidateQueries({ queryKey: ['knowledgeGeneratorReports'] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeGeneratorReport', data.id] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeGeneratorHistory', data.id] });
    },
  });
};

export const useUploadTicketFinalReportMedia = (ticketId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post(`/v1/tickets/${ticketId}/final-report/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data as FinalReportAttachment[];
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['ticketFinalReport', ticketId] });
      await queryClient.invalidateQueries({ queryKey: ['knowledgeGeneratorReports'] });
    },
  });
};

export const useKnowledgeGeneratorReports = (filters: FinalReportListFilters) =>
  useQuery<FinalReportListResponse>({
    queryKey: ['knowledgeGeneratorReports', filters],
    queryFn: async () => {
      const { data } = await api.get('/v1/knowledge-base/generator/reports', {
        params: filters,
      });
      return data;
    },
  });

export const useKnowledgeGeneratorReport = (reportId?: string) =>
  useQuery<TicketFinalReport>({
    queryKey: ['knowledgeGeneratorReport', reportId],
    queryFn: async () => {
      const { data } = await api.get(`/v1/knowledge-base/generator/reports/${reportId}`);
      return data;
    },
    enabled: !!reportId,
  });

export const useUpdateKnowledgeGeneratorReport = (reportId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TicketFinalReportPayload) => {
      const { data } = await api.put(`/v1/knowledge-base/generator/reports/${reportId}`, payload);
      return data as TicketFinalReport;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['knowledgeGeneratorReport', reportId], data);
      queryClient.invalidateQueries({ queryKey: ['ticketFinalReport', data.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeGeneratorReports'] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeGeneratorHistory', reportId] });
    },
  });
};

export const useKnowledgeGeneratorHistory = (
  reportId?: string,
  filters: FinalReportHistoryFilters = {},
) =>
  useQuery<FinalReportHistoryItem[]>({
    queryKey: ['knowledgeGeneratorHistory', reportId, filters],
    queryFn: async () => {
      const { data } = await api.get(
        `/v1/knowledge-base/generator/reports/${reportId}/history`,
        { params: filters },
      );
      return data;
    },
    enabled: !!reportId,
  });

export const useGenerateKnowledgeDraft = (reportId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(
        `/v1/knowledge-base/generator/reports/${reportId}/generate-ai`,
      );
      return data as TicketFinalReport;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['knowledgeGeneratorReport', reportId], data);
      queryClient.invalidateQueries({ queryKey: ['ticketFinalReport', data.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['knowledgeGeneratorHistory', reportId] });
    },
  });
};

export const usePublishKnowledgeDraft = (reportId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(
        `/v1/knowledge-base/generator/reports/${reportId}/publish`,
      );
      return data as { knowledgeItemId: string; publishedAt: string };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['knowledgeGeneratorReport', reportId] });
      await queryClient.invalidateQueries({ queryKey: ['knowledgeGeneratorReports'] });
      await queryClient.invalidateQueries({ queryKey: ['knowledgeGeneratorHistory', reportId] });
      await queryClient.invalidateQueries({ queryKey: ['knowledgeBase'] });
    },
  });
};
