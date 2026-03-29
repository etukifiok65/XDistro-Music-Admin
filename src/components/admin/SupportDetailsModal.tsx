import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdminSupportTicket, AdminSupportTicketStatus } from "@/types/admin";
import { Mail, MessageSquare, Send } from "lucide-react";

interface SupportDetailsModalProps {
  ticket: AdminSupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (ticketId: AdminSupportTicket["id"], status: AdminSupportTicketStatus) => Promise<void>;
  onReply: (ticketId: AdminSupportTicket["id"], message: string) => Promise<void>;
  isUpdatingStatus?: boolean;
  isSendingReply?: boolean;
}

const statusOptions: AdminSupportTicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-yellow-100 text-yellow-800";
    case "in progress":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const SupportDetailsModal = ({
  ticket,
  isOpen,
  onClose,
  onStatusUpdate,
  onReply,
  isUpdatingStatus = false,
  isSendingReply = false,
}: SupportDetailsModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<AdminSupportTicketStatus>("Open");
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    if (!ticket) {
      return;
    }

    setSelectedStatus(ticket.status);
    setReplyMessage("");
  }, [ticket]);

  if (!ticket) {
    return null;
  }

  const handleReply = async () => {
    const value = replyMessage.trim();
    if (!value) {
      return;
    }

    await onReply(ticket.id, value);
    setReplyMessage("");
  };

  const handleStatusSave = async () => {
    if (selectedStatus === ticket.status) {
      return;
    }

    await onStatusUpdate(ticket.id, selectedStatus);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-onerpm-orange" />
            {ticket.ticketNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-semibold text-gray-900">{ticket.contactName}</p>
                  <p className="text-sm text-gray-500">{ticket.contactEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subject</p>
                  <p className="font-semibold text-gray-900">{ticket.subject}</p>
                  <p className="text-sm text-gray-500">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-medium text-gray-900">{ticket.createdDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Conversation</h3>
                <span className="text-sm text-gray-500">{ticket.messageCount} messages</span>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {(ticket.messages ?? []).map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-xl border p-4 ${message.senderType === "Admin" ? "bg-blue-50 border-blue-100" : "bg-gray-50 border-gray-200"}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{message.senderName}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {message.senderEmail}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={message.senderType === "Admin" ? "bg-blue-100 text-blue-800" : "bg-gray-200 text-gray-800"}>
                          {message.senderType}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-2">{message.createdDate}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Update status</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as AdminSupportTicketStatus)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                    aria-label="Support ticket status"
                    title="Support ticket status"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleStatusSave} disabled={isUpdatingStatus || selectedStatus === ticket.status}>
                    {isUpdatingStatus ? "Saving..." : "Save Status"}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply by email</label>
                <textarea
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  rows={6}
                  placeholder="Write your reply to the customer..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-onerpm-orange focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>Close</Button>
                <Button onClick={handleReply} disabled={isSendingReply || replyMessage.trim().length === 0}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSendingReply ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDetailsModal;
