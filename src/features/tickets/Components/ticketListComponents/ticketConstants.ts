export const TICKET_STATUS = {
    OPEN: 'Open',
    RE_OPEN: 'Re Open',
    CLOSED: 'Closed',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
    OUT_OF_SERVICE: 'Out of Service',
    RESOLVED: 'Resolved',
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const DEFAULT_COL_WIDTHS: Record<string, number> = {
    id: 120,
    status: 123,
    priority: 150,
    title: 450,
    specialization: 252,
    problem: 255,
    requesterName: 220,
    assignee: 231,
    requesterUniversity: 200,
    requesterDomain: 296,
    requesterDepartments: 295,
};

export const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;