import { useQuery } from "@tanstack/react-query";
// import { getUserRoleById } from "../utils/api";
// import { getDoctorSlots } from "../utils/api";
import { getUserRoleById } from "../utils/api";
export default function useUserRoleById(userId, token) {
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["UserRole", userId],
    queryFn: () => {
      if (userId && token) return getUserRoleById(userId, token);
      return null;
    },
    enabled: !!(userId && token), // Only run query when both userId and token are available
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
  return { isLoading, data, error, status, refetch, isFetching };
}

