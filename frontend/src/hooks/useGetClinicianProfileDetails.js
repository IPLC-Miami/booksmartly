import { useQuery } from "@tanstack/react-query";
import { getClinicianProfileDetails } from "../utils/api"; // Assuming this function in api.js will be renamed

export default function useGetClinicianProfileDetails(clinicianId, accessToken) {
  // console.log("ingetcliniciandetails");
  const { isLoading, data, error, status, refetch, isFetching } = useQuery({
    queryKey: ["ClinicianDetails", clinicianId], // Updated queryKey
    queryFn: () => {
      return getClinicianProfileDetails(clinicianId, accessToken);
      //   return null;
    },
    staleTime: 1000 * 1, // 1 second
    // enabled: Boolean(clinicianId),
  });
  return { isLoading, data, error, status, refetch, isFetching };
}