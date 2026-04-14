export interface Requester {
    id: string;
    name: string;
    image: string;
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
    title: string;
    description: string;
    requester: Requester;
    specialization: Specialization | null; 
    problem: Problem | null; 
    status: string;
    priority: string;
    isOutOfService: boolean;
    assignee: Requester[];
  }
  
  export interface TicketsResponse {
    tickets: Ticket[];
    meta: {
      total: number;
      page_index: number;
      page_size: number;
    };
  }