import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminSupportTicketDetail,
  getAdminSupportTickets,
  replyToAdminSupportTicket,
  updateAdminSupportTicketStatus,
} from "@/services/adminSupportTickets";
import { AdminEntityId, AdminSupportTicketStatus } from "@/types/admin";

const adminSupportTicketsQueryKey = ["admin", "support-tickets"] as const;

export const useAdminSupportTickets = () => {
  return useQuery({
    queryKey: adminSupportTicketsQueryKey,
    queryFn: getAdminSupportTickets,
    refetchOnWindowFocus: false,
  });
};

export const useAdminSupportTicketDetail = (ticketId: AdminEntityId | null) => {
  return useQuery({
    queryKey: [...adminSupportTicketsQueryKey, ticketId],
    queryFn: () => getAdminSupportTicketDetail(ticketId as AdminEntityId),
    enabled: Boolean(ticketId),
    refetchOnWindowFocus: false,
  });
};

export const useUpdateAdminSupportTicketStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: AdminEntityId; status: AdminSupportTicketStatus }) =>
      updateAdminSupportTicketStatus(ticketId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminSupportTicketsQueryKey });
    },
  });
};

export const useReplyToAdminSupportTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: AdminEntityId; message: string }) =>
      replyToAdminSupportTicket(ticketId, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminSupportTicketsQueryKey });
    },
  });
};
