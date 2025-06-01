// import { Badge, Button, Code, DataList } from "@radix-ui/themes";
// import SeeDetails from "./SeeDetails";
// import SeeDetailsHistory from "./SeeDetailsHistory";
// import { useEffect } from "react";
// import useGetPrescription from "../../hooks/useGetPrescription";
// function ClinicianHistoryCard({ data, refetch, setShowLoader }) {
//   const {
//     patientName,
//     age,
//     gender,
//     hospital,
//     issue,
//     issueDetails,
//     appointment_time,
//     appointment_date,
//     queuePosition,
//     chosenSlot,
//   } = data;
//   const appointmentTypes = ["orange", "blue"]; // green for today's appointment, blue for future appointment
//   const appointmentType =
//     appointment_date ===
//     new Date().toLocaleDateString("en-IN").replace(/\//g, "-")
//       ? appointmentTypes[0]
//       : appointmentTypes[1];

//   const {
//     isLoading,
//     data: prescriptionData,
//     error,
//     status,
//     refetchPrescriptions,
//     isFetching,
//   } = useGetPrescription(data.appointmentId);

//   useEffect(() => {
//     if (isLoading || isFetching) {
//       setShowLoader(true);
//     } else setShowLoader(false);
//   }, [isLoading, isFetching]);

//   return (
//     <div>
//       <div className="flex justify-between gap-y-1 rounded-md border-2 px-4 py-2 font-noto">
//         <DataList.Root
//           orientation={{
//             initial: "vertical",
//             sm: "horizontal",
//           }}
//           style={{ gap: ".65rem" }}
//           size={{
//             initial: "1",
//             md: "2",
//           }}
//         >
//           <DataList.Item>
//             <DataList.Label minWidth="88px">Patient Name</DataList.Label>
//             <DataList.Value>
//               <Code variant="ghost">{patientName}</Code>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <DataList.Label minWidth="88px">Age & Gender</DataList.Label>
//             <DataList.Value>
//               <Code variant="ghost">
//                 {age} {gender}
//               </Code>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <DataList.Label minWidth="88px">Issue</DataList.Label>
//             <DataList.Value>
//               <Code variant="ghost">{issue}</Code>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <DataList.Label minWidth="88px">Hospital</DataList.Label>
//             <DataList.Value>
//               <Code variant="ghost">{hospital}</Code>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <DataList.Label minWidth="88px">Mode</DataList.Label>
//             <DataList.Value>
//               <Badge variant="ghost" color="green">
//                 {chosenSlot.mode}
//               </Badge>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <DataList.Label minWidth="88px">Appointment Time</DataList.Label>
//             <DataList.Value>
//               <Badge variant="ghost" color={appointmentType}>
//                 {new Date(appointment_time).toLocaleTimeString([] , { hour: '2-digit', minute: '2-digit' })}
//               </Badge>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <DataList.Label minWidth="88px">Appointment Date</DataList.Label>
//             <DataList.Value>
//               <Badge variant="" color={appointmentType}>
//                 {appointment_date}
//               </Badge>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <div className="flex items-center justify-start md:hidden">
//               <SeeDetailsHistory
//                 data={data}
//                 refetch={refetch}
//                 prescriptionData={prescriptionData}
//               />
//             </div>
//           </DataList.Item>
//           {/* <DataList.Item>
//             <DataList.Label minWidth="88px">Queue Position</DataList.Label>
//             <DataList.Value>
//               <Badge variant="" color={appointmentType}>
//                 {queuePosition}
//               </Badge>
//             </DataList.Value>
//           </DataList.Item> */}
//         </DataList.Root>
//         <div className="ml-4 hidden items-center justify-center md:flex">
//           <SeeDetailsHistory
//             data={data}
//             refetch={refetch}
//             prescriptionData={prescriptionData}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ClinicianHistoryCard;

/* ------------------------------------------------------ */
import { useEffect, useState } from "react";
import { Badge, Button } from "@radix-ui/themes";
import {
  User,
  Calendar,
  Clock,
  Hospital,
  FileText,
  Tag,
  Shield,
} from "lucide-react";
import SeeDetailsHistory from "./SeeDetailsHistory";
import useGetPrescription from "../../hooks/useGetPrescription";

function ClinicianHistoryCard({ data, refetch, setShowLoader }) {
  const {
    patientName,
    age,
    gender,
    hospital,
    issue,
    issueDetails,
    appointment_time,
    appointment_date,
    queuePosition,
    chosenSlot,
    status,
  } = data;

  const [expanded, setExpanded] = useState(false);

  // Check if appointment is today
  const isToday =
    appointment_date ===
    new Date().toLocaleDateString("en-IN").replace(/\//g, "-");

  // Define status colors for visual indicators
  const statusColors = {
    completed: "green",
    missed: "amber",
    cancelled: "red",
    default: isToday ? "orange" : "blue",
  };

  const statusColor = status ? statusColors[status] : statusColors.default;

  // Get formatted appointment time
  const formattedTime = new Date(appointment_time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Get prescription data
  const {
    isLoading,
    data: prescriptionData,
    error,
    isFetching,
  } = useGetPrescription(data.appointmentId);

  // Update loader state based on data loading status
  useEffect(() => {
    if (isLoading || isFetching) {
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
  }, [isLoading, isFetching, setShowLoader]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow">
      {/* Main card content */}
      <div className="flex flex-col lg:flex-row">
        {/* Status indicator bar */}
        <div className={`bg-${statusColor}-500 h-full w-1 lg:w-2`}></div>

        <div className="flex flex-1 flex-col p-0">
          {/* Patient info header */}
          <div className="flex flex-col justify-between border-b border-gray-100 bg-gray-50 p-4 md:flex-row md:items-center">
            <div className="mb-3 flex items-center gap-3 md:mb-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <User size={24} className="text-blue-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {patientName}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{age} years</span>
                  <span>•</span>
                  <span>{gender}</span>
                  {status && (
                    <>
                      <span>•</span>
                      <Badge color={statusColors[status]} size="1">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="soft"
                color={statusColor}
                size="2"
                className="flex items-center gap-1"
              >
                {chosenSlot?.mode === "online" ? (
                  <span className="flex items-center">
                    <Shield size={14} className="mr-1" />
                    Online
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Hospital size={14} className="mr-1" />
                    In-Person
                  </span>
                )}
              </Badge>

              <SeeDetailsHistory
                data={data}
                refetch={refetch}
                prescriptionData={prescriptionData}
              />
            </div>
          </div>

          {/* Appointment details */}
          <div className="p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex items-start gap-2">
                <Hospital size={18} className="mt-0.5 text-gray-500" />
                <div>
                  <div className="text-xs font-medium text-gray-500">
                    Hospital
                  </div>
                  <div className="font-medium text-gray-800">{hospital}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar size={18} className="mt-0.5 text-gray-500" />
                <div>
                  <div className="text-xs font-medium text-gray-500">Date</div>
                  <div className="font-medium text-gray-800">
                    {appointment_date}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock size={18} className="mt-0.5 text-gray-500" />
                <div>
                  <div className="text-xs font-medium text-gray-500">Time</div>
                  <div className="font-medium text-gray-800">
                    {formattedTime}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Tag
                  size={18}
                  className="mt-0.5 min-w-fit text-gray-500"
                />
                <div>
                  <div className="text-xs font-medium text-gray-500">Issue</div>
                  <div className="line-clamp-1 font-medium text-gray-800">
                    {issue}
                  </div>
                </div>
              </div>

              {prescriptionData && prescriptionData.length > 0 && (
                <div className="flex items-start gap-2">
                  <FileText size={18} className="mt-0.5 text-gray-500" />
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Prescription
                    </div>
                    <div className="font-medium text-green-600">Available</div>
                  </div>
                </div>
              )}
            </div>

            {/* Show issue details when expanded */}
            {expanded && issueDetails && (
              <div className="mt-4 rounded-md bg-gray-50 p-3">
                <div className="mb-1 text-xs font-medium text-gray-500">
                  Issue Details
                </div>
                <p className="text-sm text-gray-700">{issueDetails}</p>
              </div>
            )}

            {issueDetails && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {expanded ? "Show less" : "Show more details"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClinicianHistoryCard;
