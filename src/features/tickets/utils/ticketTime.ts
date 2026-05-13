import type { Ticket } from "../Types/tickets";

export const getTicketClosedDurationSeconds = (
  ticket: Pick<Ticket, "createdAt" | "closedAt" | "totalTimeUntilClosedSeconds">,
) => {
  if (typeof ticket.totalTimeUntilClosedSeconds === "number") {
    return ticket.totalTimeUntilClosedSeconds;
  }

  if (!ticket.createdAt || !ticket.closedAt) {
    return null;
  }

  const createdAt = new Date(ticket.createdAt).getTime();
  const closedAt = new Date(ticket.closedAt).getTime();
  if (Number.isNaN(createdAt) || Number.isNaN(closedAt)) {
    return null;
  }

  return Math.max(0, Math.floor((closedAt - createdAt) / 1000));
};

export const formatTicketClosedDuration = (
  ticket: Pick<Ticket, "createdAt" | "closedAt" | "totalTimeUntilClosedSeconds">,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  const seconds = getTicketClosedDurationSeconds(ticket);
  if (seconds === null) {
    return t("tickets.notClosedYet", { defaultValue: "Not closed yet" });
  }

  if (seconds < 60) {
    return t("tickets.durationLessThanMinute", { defaultValue: "< 1m" });
  }

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days) parts.push(t("tickets.durationDays", { count: days, defaultValue: `${days}d` }));
  if (hours) parts.push(t("tickets.durationHours", { count: hours, defaultValue: `${hours}h` }));
  if (minutes || parts.length === 0) {
    parts.push(t("tickets.durationMinutes", { count: minutes, defaultValue: `${minutes}m` }));
  }

  return parts.slice(0, 2).join(" ");
};

