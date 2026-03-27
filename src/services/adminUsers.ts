import { SubscriptionPlanName, AdminEntityId, AdminUserListItem } from "@/types/admin";
import { isAdminDataDummyEnabled, requestAdminJson } from "@/services/adminClient";
import { mockAdminUsers } from "@/data/adminUsers";

const ADMIN_USERS_KEY = "admin:users";

const readStoredUsers = (): AdminUserListItem[] => {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(mockAdminUsers));
      return mockAdminUsers;
    }

    const parsed = JSON.parse(raw) as AdminUserListItem[];
    if (!Array.isArray(parsed)) {
      return mockAdminUsers;
    }

    return parsed;
  } catch {
    return mockAdminUsers;
  }
};

const writeStoredUsers = (users: AdminUserListItem[]) => {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
};

export const getAdminUsers = async (): Promise<AdminUserListItem[]> => {
  if (isAdminDataDummyEnabled()) {
    return readStoredUsers();
  }

  const payload = await requestAdminJson<{ data?: AdminUserListItem[]; users?: AdminUserListItem[] }>("/users");
  return payload.data || payload.users || [];
};

export const deleteAdminUser = async (userId: AdminEntityId): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const users = readStoredUsers().filter((user) => user.id !== userId);
    writeStoredUsers(users);
    return;
  }

  await requestAdminJson(`/users/${userId}`, { method: "DELETE" });
};

export const updateAdminUserPlan = async (userId: AdminEntityId, plan: SubscriptionPlanName): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const users = readStoredUsers().map((user) => (user.id === userId ? { ...user, plan } : user));
    writeStoredUsers(users);
    return;
  }

  await requestAdminJson(`/users/${userId}/plan`, {
    method: "PATCH",
    body: JSON.stringify({ plan }),
  });
};

export const updateAdminUserStatus = async (userId: AdminEntityId, status: string): Promise<void> => {
  if (isAdminDataDummyEnabled()) {
    const users = readStoredUsers().map((user) => (user.id === userId ? { ...user, status } : user));
    writeStoredUsers(users);
    return;
  }

  await requestAdminJson(`/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};