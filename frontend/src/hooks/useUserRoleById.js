import { useQuery } from "@tanstack/react-query";
// import { getUserRoleById } from "../utils/api";
// import { getDoctorSlots } from "../utils/api";
import { getUserRoleById } from "../utils/api";
export default function useUserRoleById(userId, token) {
  // console.log(token);
  // console.log(userId);
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["UserRole", userId],
    queryFn: () => {
      if (userId) return getUserRoleById(userId, token);
      return null;
    },
    staleTime: 1000 * 1, // 1 second
  });
  return { isLoading, data, error, status, refetch, isFetching };
}

