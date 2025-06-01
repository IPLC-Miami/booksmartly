import { useQuery } from "@tanstack/react-query";
import { getCurrentActiveUser } from "../utils/api";

export function useGetCurrentUser() {
  // const queryClient = useQueryClient();
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["current_active_user"],
    queryFn: () => {
      return getCurrentActiveUser();
    },
    staleTime: 1000 * 1, // 1 second
  });
  return { isLoading, data, error, status, refetch, isFetching };
}

