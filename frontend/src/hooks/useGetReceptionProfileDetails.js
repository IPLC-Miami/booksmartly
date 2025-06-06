import { useQuery } from "@tanstack/react-query";
import { getReceptionProfileDetails } from "../utils/api";
export default function useGetReceptionProfileDetails(receptionId) {
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["ReceptionDetails", receptionId],
    queryFn: () => {
      return getReceptionProfileDetails(receptionId);
      //   return null;
    },
    staleTime: 1000 * 1, // 1 second
    enabled: Boolean(receptionId),
  });
  return { isLoading, data, error, status, refetch, isFetching };
}

