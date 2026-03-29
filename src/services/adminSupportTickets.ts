import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { mockAdminSupportTickets } from "@/data/adminSupportTickets";
import { AdminSupportMessage, AdminSupportTicket, AdminSupportTicketStatus } from "@/types/admin";

const ADMIN_SUPPORT_TICKETS_KEY = "admin:support-tickets";

const readStoredSupportTickets = (): AdminSupportTicket[] => {
  try {
    const raw = localStorage.getItem(ADMIN_SUPPORT_TICKETS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_SUPPORT_TICKETS_KEY, JSON.stringify(mockAdminSupportTickets));
      return mockAdminSupportTickets;
    }

    const parsed = JSON.parse(raw) as AdminSupportTicket[];
    if (!Array.isArray(parsed)) {
      return mockAdminSupportTickets;
    }

    return parsed;
  } catch {
    return mockAdminSupportTickets;
  }
};

const writeStoredSupportTickets = (tickets: AdminSupportTicket[]) => {
  localStorage.setItem(ADMIN_SUPPORT_TICKETS_KEY, JSON.stringify(tickets));
};

export const getAdminSupportTickets = async (): Promise<AdminSupportTicket[]> => {
  if (isAdminDataDummyEnabled()) {
    return readStoredSupportTickets();
  }

  const payload = await requestAdminJson<{ data?: AdminSupportTicket[] }>("/support-tickets");
  return payload.data || [];
};

export const getAdminSupportTicketDetail = async (
  ticketId: AdminSupportTicket["id"]
): Promise<AdminSupportTicket> => {
  if (isAdminDataDummyEnabled()) {
    const ticket = readStoredSupportTickets().find((item) => item.id === ticketId);
    if (!ticket) {
      throw new Error("Support ticket not found");
    }
    return ticket;
  }

  const payload = await requestAdminJson<{ data?: AdminSupportTicket }>(`/support-tickets/${ticketId}`);
  if (!payload.data) {
    throw new Error("Support ticket not found");
  }
  return payload.data;
};

export const updateAdminSupportTicketStatus = async (
  ticketId: AdminSupportTicket["id"],
  status: AdminSupportTicketStatus,
): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredSupportTickets().map((ticket) =>
      ticket.id === ticketId
        ? {
            ...ticket,
            status,
            lastUpdatedDate: new Date().toISOString().slice(0, 10),
          }
        : ticket
    );
    writeStoredSupportTickets(updated);
    return;
  }

  await requestAdminJson(`/support-tickets/${ticketId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const replyToAdminSupportTicket = async (
  ticketId: AdminSupportTicket["id"],
  message: string,
): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const today = new Date().toISOString().slice(0, 10);
    const updated = readStoredSupportTickets().map((ticket) => {
      if (ticket.id !== ticketId) {
        return ticket;
      }

      const messages = ticket.messages ?? [];
      const reply: AdminSupportMessage = {
        id: `${ticketId}-reply-${messages.length + 1}`,
        senderType: "Admin",
        senderName: "Support Team",
        senderEmail: "support@xdistromusic.com",
        message,
        emailSent: true,
        createdDate: today,
      };

      return {
        ...ticket,
        messages: [...messages, reply],
        messageCount: ticket.messageCount + 1,
        lastUpdatedDate: today,
        lastMessageDate: today,
        lastAdminReplyDate: today,
      };
    });

    writeStoredSupportTickets(updated);
    return;
  }

  await requestAdminJson(`/support-tickets/${ticketId}/replies`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
};
