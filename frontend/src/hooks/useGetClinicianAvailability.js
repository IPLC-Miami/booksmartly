import { useQuery } from "@tanstack/react-query";
import { getClinicianAvailability } from "../utils/api"; // Assuming this function in api.js will be renamed
export default function useGetClinicianAvailability(clinicianId) {
    const { isLoading, data, error, status, refetch, isFetching } = useQuery({
        queryKey: ["clinician_availability", clinicianId],
        queryFn: () => {
        return getClinicianAvailability(clinicianId);
        },
        staleTime: 1000 * 100,
        enabled: Boolean(clinicianId),
    });
    return { isLoading, data, error, status, refetch, isFetching };
}