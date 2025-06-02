import { useQuery } from "@tanstack/react-query";
import { getClinicianType } from "../utils/api"; // Assuming this function in api.js will be renamed

export default function useGetClinicianType(healthIssue) {
  const { isLoading, data, error, status } = useQuery({
    queryKey: ["clinician_type", healthIssue], // Updated queryKey
    queryFn: () => {
      if (healthIssue !== null) return getClinicianType(healthIssue);
        return null;
    },
    staleTime: 1000 * 1, // 1 second
  });

  return { isLoading, data, error, status };
}
