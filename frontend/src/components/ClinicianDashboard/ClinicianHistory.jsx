import { toast } from "sonner";
import Loader from "../Loader";
import useGetQueueForClinician from "../../hooks/useGetQueueForClinician"; // Assuming this hook will be renamed
import ClinicianHistoryCard from "./ClinicianHistoryCard";
import useGetHistoryForClinician from "../../hooks/useGetHistoryForClinician"; // Assuming this hook will be renamed
import { useEffect, useState } from "react";

function ClinicianHistory({ userId }) {
  const { isLoading, data, error, status, refetch, isFetching } =
    useGetHistoryForClinician(userId);

  if (error) {
    toast.error("Error fetching data");
  }

  const [showLoader, setShowLoader] = useState(true);
  useEffect(() => {
    if (isLoading || isFetching) {
      setShowLoader(true);
    } else setShowLoader(false);
  }, [isLoading, isFetching]);

  return (
    <div className="">
      {showLoader && <Loader />}
      <div className="flex flex-col gap-4">
        {data?.map((queue, ix) => (
          <ClinicianHistoryCard
            key={ix}
            data={queue}
            refetch={refetch}
            setShowLoader={setShowLoader}
          />
        ))}
        {data?.length === 0 && (
          <div className="text-center">No previous appointments to show!</div>
        )}
      </div>
    </div>
  );
}

export default ClinicianHistory;
