export interface Requester {
    id: string;
    name: string;
    image: string;
    rustdeskId?: string | null;
    university?: LookupItem | null;
    domain?: LookupItem | null;
    departments?: LookupItem[];
  }

  export interface LookupItem {
    id: string;
    name: string;
  }

  export interface Specialization {
    id: string;
    name: string;
    review_required: boolean;
  }

  export interface Problem {
    id: string;
    name: string;
    review_required: boolean;
  }
  
  export interface Ticket {
    id: string;
    ticket_number: string;
    createdAt?: string;
    modifiedAt?: string;
    closedAt?: string | null;
    totalTimeUntilClosedSeconds?: number | null;
    title: string;
    description: string;
    requester: Requester;
    specialization: Specialization | null; 
    problem: Problem | null; 
    status: string;
    priority: string;
    isOutOfService: boolean;
    assignee: Requester[];
    sla?: {
      violated: boolean;
      ageHours?: number;
      maxHours?: number;
      ruleId?: string;
      ruleName?: string;
    };
  }
  
  export interface TicketsResponse {
    tickets: Ticket[];
    meta: {
      total: number;
      page_index: number;
      page_size: number;
    };
  }
