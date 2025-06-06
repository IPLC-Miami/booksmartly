import { toast } from "sonner";
import { useEffect, useState } from "react";
import Loader from "../Loader";
import useGetQueueForClinician from "../../hooks/useGetQueueForClinician"; // Assuming this hook will be renamed
import ClinicianQueueCard from "./ClinicianQueueCard"; // Assuming this component will be renamed
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Clock4,
} from "lucide-react";
import useGetClinicianAvailability from "../../hooks/useGetClinicianAvailability"; // Assuming this hook will be renamed

function ClinicianQueue({ userId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableOnlineSlots, setAvailableOnlineSlots] = useState([]);
  const [availableOfflineSlots, setAvailableOfflineSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availabilityData, setAvailabilityData] = useState({});
  const [appointmentType, setAppointmentType] = useState("");

  const { data: availability, error: availabilityError } =
    useGetClinicianAvailability(userId);

  useEffect(() => {
    if (availability) {
      setAvailabilityData(availability);
    }
    if (availabilityError) {
      toast.error("Error fetching clinician availability data");
    }
  }, [availability, availabilityError]);

  useEffect(() => {
    if (selectedDate) {
      const dayName = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
      }).format(selectedDate);

      if (availabilityData[dayName]) {
        setAvailableOnlineSlots(availabilityData[dayName]["online"] || []);
        setAvailableOfflineSlots(availabilityData[dayName]["offline"] || []);
      } else {
        setAvailableOnlineSlots([]);
        setAvailableOfflineSlots([]);
      }
      setSelectedSlot(null);
    }
  }, [selectedDate, availabilityData]);

  const { isLoading, data, error, refetch, isFetching } = useGetQueueForClinician(
    userId,
    selectedDate,
    selectedSlot,
  );

  // Separate checked-in and waiting patients
  const [checkedInPatients, setCheckedInPatients] = useState([]);
  const [waitingPatients, setWaitingPatients] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      // data[0].checked_in_status = true; // For testing purposes
      const checkedIn = data.filter((patient) => patient.checked_in_status);
      console.log("checkedIn", checkedIn);

      const waiting = data.filter((patient) => !patient.checked_in_status);

      setCheckedInPatients(checkedIn);
      setWaitingPatients(waiting);
    } else {
      setCheckedInPatients([]);
      setWaitingPatients([]);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error("Error fetching appointments");
    }
  }, [error]);

  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const handlePrevDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    if (prevDay >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setSelectedDate(prevDay);
    }
  };

  const formatDateForDisplay = (date) => {
    const options = { weekday: "long", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  console.log("selectedSlot", availabilityData);

  return (
    <div className="min-h-screen rounded-lg">
      <div className="mx-auto">
        <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePrevDay}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>

                <div className="flex items-center">
                  <div className="relative">
                    <input
                      className="w-44 rounded-md border border-gray-300 p-2 pl-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={selectedDate.toISOString().split("T")[0]}
                      onChange={(e) =>
                        setSelectedDate(new Date(e.target.value))
                      }
                    />
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                  <span className="ml-3 text-lg font-medium text-gray-700">
                    {isToday(selectedDate)
                      ? "Today"
                      : formatDateForDisplay(selectedDate)}
                  </span>
                </div>

                <button
                  onClick={handleNextDay}
                  className="rounded-full p-2 transition-colors hover:bg-gray-100"
                  aria-label="Next day"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Time slots section */}
          <div className="border-b border-gray-200 p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-800">
              Available Time Slots
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Online slots */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-3 flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <h4 className="text-md font-medium text-gray-800">
                    Online Consultations
                  </h4>
                </div>

                <div className="space-y-2">
                  {availableOnlineSlots.length > 0 ? (
                    availableOnlineSlots.map((slot, index) => (
                      <button
                        key={`online-${index}`}
                        className={`flex w-full items-center justify-between rounded-lg border p-3 transition-all duration-200 ${
                          selectedSlot === slot
                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setAppointmentType("online");
                        }}
                      >
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-blue-500" />
                          <span>
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="mr-1 h-4 w-4" />
                          <span>Max: {slot.max_appointments}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-4 text-center text-gray-500">
                      No online slots available for this day.
                    </div>
                  )}
                </div>
              </div>

              {/* Offline slots */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-3 flex items-center">
                  <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <h4 className="text-md font-medium text-gray-800">
                    In-Person Visits
                  </h4>
                </div>

                <div className="space-y-2">
                  {availableOfflineSlots.length > 0 ? (
                    availableOfflineSlots.map((slot, index) => (
                      <button
                        key={`offline-${index}`}
                        className={`flex w-full items-center justify-between rounded-lg border p-3 transition-all duration-200 ${
                          selectedSlot === slot
                            ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                        }`}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setAppointmentType("offline");
                        }}
                      >
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-green-500" />
                          <span>
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="mr-1 h-4 w-4" />
                          <span>Max: {slot.max_appointments}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-4 text-center text-gray-500">
                      No in-person slots available for this day.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Appointments section */}
          <div className="p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-800">
              {selectedSlot
                ? `Appointments (${selectedSlot.start_time} - ${selectedSlot.end_time})`
                : "Select a time slot to view appointments"}
            </h3>

            {isLoading || isFetching ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Checked-in patients section */}
                {checkedInPatients.length > 0 && (
                  <>
                    <div className="rounded-lg border-green-200 p-4">
                      <div className="mb-4 flex items-center rounded-lg bg-gradient-to-r from-green-100 to-green-50 px-4 py-3">
                        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-sm">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <h4 className="text-md font-medium text-green-800">
                          Checked-In Patients ({checkedInPatients.length})
                        </h4>
                      </div>

                      <div className="space-y-4">
                        {checkedInPatients.map((patient, idx) => (
                          <ClinicianQueueCard
                            key={`checked-in-${idx}`}
                            data={patient}
                            refetch={refetch}
                            index={idx}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {waitingPatients?.length > 0 &&
                  checkedInPatients?.length > 0 && (
                    <div className="mx-4 mt-14 border-b-2 border-gray-200"></div>
                  )}

                {/* Waiting patients section */}
                {waitingPatients.length > 0 ? (
                  <div className="rounded-lg border-blue-200 p-4">
                    {appointmentType === "offline" && (
                      <div className="mb-4 flex items-center rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-3">
                        <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm">
                          <CheckCircle className="h-4 w-4" />
                        </div>
                        <h4 className="text-md font-medium text-blue-800">
                          Waiting Patients ({waitingPatients.length})
                        </h4>
                      </div>
                    )}

                    <div className="space-y-4">
                      {waitingPatients.map((patient, idx) => (
                        <ClinicianQueueCard
                          key={`waiting-${idx}`}
                          data={patient}
                          refetch={refetch}
                          index={idx}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  data &&
                  data.length === 0 && (
                    // <div className="rounded-lg bg-gray-50 p-8 text-center">
                    //   <div className="mb-3 flex justify-center">
                    //     <Calendar className="h-12 w-12 text-gray-400" />
                    //   </div>
                    //   <h4 className="mb-1 text-lg font-medium text-gray-700">
                    //     No appointments found
                    //   </h4>
                    //   <p className="text-gray-500">
                    //     {selectedSlot
                    //       ? "There are no appointments scheduled for this time slot."
                    //       : "Please select a time slot to view appointments."}
                    //   </p>
                    // </div>
                    <div> </div>
                  )
                )}

                {/* No appointments message */}
                {data && data.length === 0 && (
                  <div className="rounded-lg bg-gray-50 p-8 text-center">
                    <div className="mb-3 flex justify-center">
                      <Calendar className="h-12 w-12 text-gray-400" />
                    </div>
                    <h4 className="mb-1 text-lg font-medium text-gray-700">
                      No appointments found
                    </h4>
                    <p className="text-gray-500">
                      {selectedSlot
                        ? "There are no appointments scheduled for this time slot."
                        : "Please select a time slot to view appointments."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicianQueue;
