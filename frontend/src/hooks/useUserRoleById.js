import { useQuery } from "@tanstack/react-query";
import { getUserRoleById } from "../utils/api";

export default function useUserRoleById(userId) {
  return useQuery({
    queryKey: ["userRole", userId],
    queryFn: () => getUserRoleById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}