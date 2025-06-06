import { toast } from "sonner";
import useGetUpcomingAppointments from "../../hooks/useGetUpcomingAppointments";
import AppointmentCard from "./AppointmentCard";
import Loader from "../Loader";

function UpcomingAppointments({ userId }) {
  const { isLoading, data, error, status, refetch, isFetching } =
    useGetUpcomingAppointments(userId);

  if (error) {
    toast.error("Error fetching data");
  }

  return (
    <div className="">
      {(isLoading || isFetching) && <Loader />}
      <div className="flex flex-col gap-4">
        {data?.map((appointment, ix) => (
          <AppointmentCard key={ix} data={appointment} index={ix} refetch={refetch} />
        ))}
        {data?.length === 0 && (
          <div className="text-center">No upcoming appointments!</div>
        )}
      </div>
    </div>
  );
}

export default UpcomingAppointments;

