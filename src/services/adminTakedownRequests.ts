import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { mockAdminTakedownRequests } from "@/data/adminTakedownRequests";
import { AdminTakedownRequest, AdminTakedownRequestStatus } from "@/types/admin";

const ADMIN_TAKEDOWN_REQUESTS_KEY = "admin:takedown-requests";

const readStoredTakedownRequests = (): AdminTakedownRequest[] => {
  try {
    const raw = localStorage.getItem(ADMIN_TAKEDOWN_REQUESTS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_TAKEDOWN_REQUESTS_KEY, JSON.stringify(mockAdminTakedownRequests));
      return mockAdminTakedownRequests;
    }

    const parsed = JSON.parse(raw) as AdminTakedownRequest[];
    if (!Array.isArray(parsed)) {
      return mockAdminTakedownRequests;
    }

    return parsed;
  } catch {
    return mockAdminTakedownRequests;
  }
};

const writeStoredTakedownRequests = (requests: AdminTakedownRequest[]) => {
  localStorage.setItem(ADMIN_TAKEDOWN_REQUESTS_KEY, JSON.stringify(requests));
};

export const getAdminTakedownRequests = async (): Promise<AdminTakedownRequest[]> => {
  if (isAdminDataDummyEnabled()) {
    return readStoredTakedownRequests();
  }

  const payload = await requestAdminJson<{ data?: AdminTakedownRequest[]; requests?: AdminTakedownRequest[] }>(
    "/takedown-requests"
  );

  return payload.data || payload.requests || [];
};

export const updateAdminTakedownRequestStatus = async (
  requestId: AdminTakedownRequest["id"],
  status: AdminTakedownRequestStatus
): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const updated = readStoredTakedownRequests().map((request) =>
      request.id === requestId ? { ...request, status } : request
    );

    writeStoredTakedownRequests(updated);
    return;
  }

  await requestAdminJson(`/takedown-requests/${requestId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};
