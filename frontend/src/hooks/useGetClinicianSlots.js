import { useQuery } from "@tanstack/react-query";
import { getClinicianSlots } from "../utils/api"; // Assuming this function in api.js will be renamed
export default function useGetClinicianSlots(clinicianType) { // Renamed parameter
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["clinician_slots", clinicianType], // Updated queryKey
    queryFn: () => {
   if(clinicianType==null)
    {
      return null;
    }
    else
    {
      const date = clinicianType.formData.selectedDate.split("-").reverse().join("-");
      return getClinicianSlots(date, clinicianType.dataClinicianType, clinicianType.patientId , clinicianType.mode); // Assuming dataClinicianType from clinicianType
    }},
    staleTime: 1000 * 1, // 1 second
    enabled: clinicianType !== null,
  });
  return { isLoading, data, error, status, refetch, isFetching };
}
