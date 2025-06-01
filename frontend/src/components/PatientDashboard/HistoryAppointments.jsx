import { toast } from "sonner";
import useGetHistoryAppointment from "../../hooks/useGetHistoryAppointment";
import HistoryAppointmentCard from "./HistoryAppointmentCard";
import Loader from "../Loader";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../utils/ContextProvider";
function HistoryAppointments() {
  const user = useAuthContext();
  const [patientId, setPatientId] = useState(null);
  useEffect(() => {
    if (user.currentUser != null) {
      setPatientId(user.currentUser.id);
      // console.log(user.currentUser.id);
    }
  }, [user]);

  const { isLoading, data, error, status, refetch, isFetching } =
    useGetHistoryAppointment(patientId);
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
    <div>
      <div className="">
        {showLoader && <Loader />}
        <div className="flex flex-col gap-4">
          {data?.map((appointment, ix) => (
            <HistoryAppointmentCard
              key={ix + "history"}
              data={appointment}
              refetch={refetch}
              setShowLoader={setShowLoader}
            />
          ))}
          {data?.length === 0 && (
            <div className="text-center">No previous appointments to show!</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryAppointments;

