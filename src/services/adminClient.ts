import { adminBackendConfig, isAdminDummyDataEnabled } from "@/config/adminBackend";
import { getAdminToken } from "@/lib/adminSession";

export const isAdminDataDummyEnabled = () => isAdminDummyDataEnabled();

export const requestAdminJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${adminBackendConfig.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(getAdminToken() ? { Authorization: `Bearer ${getAdminToken()}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(
      (payload as { message?: string })?.message || `Admin request failed with status ${response.status}`
    );
  }

  return (await response.json()) as T;
};