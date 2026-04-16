import { UUID_PATTERN } from "./ticketConstants";

export const getSavedData = <T>(key: string, fallback: T): T => {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
};

export const getTicketIdentifierSearchKey = (value: string): 'id' | 'ticket_number' =>
    UUID_PATTERN.test(value.trim()) ? 'id' : 'ticket_number';