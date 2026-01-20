export interface Requester {
    id: string;
    name: string;
    image: string;
  }

  export interface Specialization {
    id: string;
    name: string;
  }
  
  export interface Ticket {
    id: string;
    title: string;
    description: string;
    requester: Requester;
    specialization: Specialization | null; 
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