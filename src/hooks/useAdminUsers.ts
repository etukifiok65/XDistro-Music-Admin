import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserPlan,
  updateAdminUserStatus,
} from "@/services/adminUsers";
import { AdminEntityId, SubscriptionPlanName } from "@/types/admin";

const adminUsersQueryKey = ["admin", "users"] as const;

export const useAdminUsers = () => {
  return useQuery({
    queryKey: adminUsersQueryKey,
    queryFn: getAdminUsers,
    refetchOnWindowFocus: false,
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: AdminEntityId) => deleteAdminUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
    },
  });
};

export const useUpdateAdminUserPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, plan }: { userId: AdminEntityId; plan: SubscriptionPlanName }) =>
      updateAdminUserPlan(userId, plan),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
    },
  });
};

export const useUpdateAdminUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: AdminEntityId; status: string }) =>
      updateAdminUserStatus(userId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminUsersQueryKey });
    },
  });
};