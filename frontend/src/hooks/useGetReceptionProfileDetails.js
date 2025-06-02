import { useQuery } from "@tanstack/react-query";
import { getReceptionProfileDetails } from "../utils/api";
export default function useGetReceptionProfileDetails(receptionId, accessToken) {
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["ReceptionDetails", receptionId],
    queryFn: () => {
      return getReceptionProfileDetails(receptionId, accessToken);
      //   return null;
    },
    staleTime: 1000 * 1, // 1 second
    // enabled: Boolean(doctorId),
  });
  return { isLoading, data, error, status, refetch, isFetching };
}

