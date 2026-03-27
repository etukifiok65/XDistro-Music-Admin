import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { mockAdminRoyaltyRequests } from "@/data/adminRoyaltyRequests";
import { AdminRoyaltyRequest, AdminRoyaltyRequestStatus } from "@/types/admin";

const ADMIN_ROYALTY_REQUESTS_KEY = "admin:royalty-requests";

const readStoredRoyaltyRequests = (): AdminRoyaltyRequest[] => {
  try {
    const raw = localStorage.getItem(ADMIN_ROYALTY_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_ROYALTY_REQUESTS_KEY, JSON.stringify(mockAdminRoyaltyRequests));
      return mockAdminRoyaltyRequests;
    }

    const parsed = JSON.parse(raw) as AdminRoyaltyRequest[];
    if (!Array.isArray(parsed)) {
      return mockAdminRoyaltyRequests;
    }

    return parsed;
  } catch {
    return mockAdminRoyaltyRequests;
  }
};

const writeStoredRoyaltyRequests = (requests: AdminRoyaltyRequest[]) => {
  localStorage.setItem(ADMIN_ROYALTY_REQUESTS_KEY, JSON.stringify(requests));
};

export const getAdminRoyaltyRequests = async (): Promise<AdminRoyaltyRequest[]> => {
  if (isAdminDataDummyEnabled()) {
    return readStoredRoyaltyRequests();
  }

  const payload = await requestAdminJson<{ data?: AdminRoyaltyRequest[]; requests?: AdminRoyaltyRequest[] }>(
    "/royalty-requests"
  );

  return payload.data || payload.requests || [];
};

export const updateAdminRoyaltyRequestStatus = async (
  requestId: AdminRoyaltyRequest["id"],
  status: AdminRoyaltyRequestStatus
): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredRoyaltyRequests().map((request) =>
      request.id === requestId ? { ...request, status } : request
    );
    writeStoredRoyaltyRequests(updated);
    return;
  }

  await requestAdminJson(`/royalty-requests/${requestId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};
