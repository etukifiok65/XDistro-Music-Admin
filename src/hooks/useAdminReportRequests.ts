import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminReportRequests,
  updateAdminReportRequestStatus,
  uploadAdminReportRequestFile,
} from "@/services/adminReportRequests";
import { AdminEntityId, AdminReportRequestStatus } from "@/types/admin";

const adminReportRequestsQueryKey = ["admin", "report-requests"] as const;

export const useAdminReportRequests = () => {
  return useQuery({
    queryKey: adminReportRequestsQueryKey,
    queryFn: getAdminReportRequests,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateAdminReportRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: AdminEntityId; status: AdminReportRequestStatus }) =>
      updateAdminReportRequestStatus(requestId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminReportRequestsQueryKey });
    },
  });
};

export const useUploadAdminReportRequestFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, fileName }: { requestId: AdminEntityId; fileName: string }) =>
      uploadAdminReportRequestFile(requestId, fileName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminReportRequestsQueryKey });
    },
  });
};
