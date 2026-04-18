export interface FinalReportAttachment {
  id: string;
  fileName: string;
  mime: string | null;
  url: string;
}

export interface FinalReportAuthor {
  id: string;
  name: string;
}

export interface FinalReportKnowledgeDraft {
  title_en?: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  specialization_en?: string;
  specialization_ar?: string;
  content_en?: string;
  content_ar?: string;
}

export interface TicketFinalReport {
  id: string;
  ticketId: string;
  ticketNumber: number | null;
  ticketTitle: string;
  author: FinalReportAuthor | null;
  title_en: string;
  title_ar: string;
  content_en: string;
  content_ar: string;
  knowledgeDraft: FinalReportKnowledgeDraft;
  attachments: FinalReportAttachment[];
  publishedKnowledgeItemId: string | null;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface FinalReportHistoryItem {
  id: string;
  action: string;
  actor: FinalReportAuthor | null;
  payload: Record<string, unknown> | null;
  createdAt: string | null;
}

export interface FinalReportListResponse {
  items: TicketFinalReport[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FinalReportListFilters {
  title?: string;
  author?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface FinalReportHistoryFilters {
  actor?: string;
  startDate?: string;
  endDate?: string;
}

export interface TicketFinalReportPayload {
  title_en?: string;
  title_ar?: string;
  content_en?: string;
  content_ar?: string;
  knowledgeDraft?: FinalReportKnowledgeDraft;
}
