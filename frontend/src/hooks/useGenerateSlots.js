import { useQuery } from "@tanstack/react-query";
import { generateSlots } from "../utils/api";

export default function useGenerateSlots(doctorId, date) {
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["generate_slots", doctorId, date],
    queryFn: () => {
      if (!doctorId || !date) {
        return null;
      }
      return generateSlots(doctorId, date);
    },
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!(doctorId && date),
  });
  
  return { isLoading, data, error, status, refetch, isFetching };
}