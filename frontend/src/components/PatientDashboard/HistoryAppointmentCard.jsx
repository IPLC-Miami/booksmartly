// import { Badge, Button, Code, DataList } from "@radix-ui/themes";
// import SeeDetails from "./SeeDetails";
// import useGetPrescription from "../../hooks/useGetPrescription";
// import { useEffect } from "react";
// import Feedback from "./Feedback";
// import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
// function HistoryAppointmentCard({ data, refetch, setShowLoader }) {
//   // console.log("HistoryAppointmentCard data: ", data);
//   const {
//     clinician,
//     specialization,
//     hospital,
//     appointment_time,
//     chosenSlot,
//     appointment_date,
//     plus_code,
//     address,
//   } = data;

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
//             <DataList.Label minWidth="88px">Clinician</DataList.Label>
//             <DataList.Value>
//               <Code variant="ghost">{clinician}</Code>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item align="">
//             <DataList.Label minWidth="88px">Specialization</DataList.Label>
//             <DataList.Value>
//               <Badge color="indigo" variant="soft" radius="small">
//                 {specialization}
//               </Badge>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <DataList.Label minWidth="88px">Hospital</DataList.Label>
//             <DataList.Value>
//               <Code variant="ghost">{hospital}</Code>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <DataList.Label minWidth="88px">Address</DataList.Label>
//             <DataList.Value>
//               <div className="flex items-center gap-x-2">
//                 <Code variant="ghost">{address}</Code>
//                 <Button
//                   color="iris"
//                   size="1"
//                   onClick={() =>
//                     window.open(
//                       `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(plus_code)}`,
//                       "_blank",
//                     )
//                   }
//                 >
//                   Get Directions
//                 </Button>
//               </div>
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
//               <Badge variant="ghost">
//                 {new Date(appointment_time).toLocaleTimeString([], {
//                   // timeZone: "Asia/Kolkata",
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })}
//               </Badge>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <DataList.Label minWidth="88px">Appointment Date</DataList.Label>
//             <DataList.Value>
//               <Badge variant="">{appointment_date}</Badge>
//             </DataList.Value>
//           </DataList.Item>
//           <DataList.Item>
//             <div className="flex items-center justify-start gap-x-2 md:hidden">
//               <Feedback />

//               {data?.status === "completed" && (
//                 <SeeDetails
//                   data={data}
//                   refetch={refetch}
//                   prescriptionData={prescriptionData}
//                 />
//               )}
//               {data?.status === "missed" && (
//                 <div className="flex items-center justify-center gap-x-2 rounded-sm border-2 border-orange-500 px-3 py-[6px] text-orange-500">
//                   Missed
//                   <ExclamationTriangleIcon />
//                 </div>
//               )}
//             </div>
//           </DataList.Item>
//         </DataList.Root>
//         <div className="ml-4 hidden items-center justify-center gap-x-2 md:flex">
//           <Feedback data={data} />
//           {data?.status === "completed" && (
//             <SeeDetails
//               data={data}
//               refetch={refetch}
//               prescriptionData={prescriptionData}
//             />
//           )}
//           {data?.status === "missed" && (
//             <div className="flex items-center justify-center gap-x-2 rounded-[4px] select-none border-2 border-orange-500 px-3 py-[5px] text-orange-500">
//               Missed
//               <ExclamationTriangleIcon />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default HistoryAppointmentCard;

/* ------------------------------------------------------ */

import { useState, useEffect } from "react";
// import { ExclamationTriangleIcon, CalendarIcon, ClockIcon, MapPinIcon, UserIcon, BriefcaseIcon, BuildingIcon } from "@radix-ui/react-icons";
import {
  Badge,
  Button,
  Code,
  DataList,
  Separator,
  Tooltip,
} from "@radix-ui/themes";
import SeeDetails from "./SeeDetails";
import useGetPrescription from "../../hooks/useGetPrescription";
import Feedback from "./Feedback";
import {
  BriefcaseMedicalIcon,
  BuildingIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
} from "lucide-react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

function HistoryAppointmentCard({ data, refetch, setShowLoader }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    clinician,
    specialization,
    hospital,
    appointment_time,
    chosenSlot,
    appointment_date,
    plus_code,
    address,
  } = data;

  const {
    isLoading,
    data: prescriptionData,
    isFetching,
  } = useGetPrescription(data.appointmentId);

  useEffect(() => {
    if (isLoading || isFetching) {
      setShowLoader(true);
    } else setShowLoader(false);
  }, [isLoading, isFetching, setShowLoader]);

  // Format the date and time for display
  const formattedTime = new Date(appointment_time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Determine status color
  const getStatusStyles = () => {
    switch (data?.status) {
      case "completed":
        return {
          color: "green",
          borderColor: "border-green-500",
          text: "Completed",
        };
      case "missed":
        return {
          color: "orange",
          borderColor: "border-orange-500",
          text: "Missed",
        };
      case "upcoming":
        return {
          color: "blue",
          borderColor: "border-blue-500",
          text: "Upcoming",
        };
      default:
        return {
          color: "gray",
          borderColor: "border-gray-500",
          text: data?.status || "Unknown",
        };
    }
  };

  const statusStyles = getStatusStyles();

  return (
    <div
      className={`mb-4 overflow-hidden rounded-lg border-l-4 ${statusStyles.borderColor} bg-white shadow-md transition-all duration-200 hover:shadow-lg`}
    >
      {/* Card Header - Always visible */}
      <div
        className="flex flex-col bg-gray-50 p-4 md:flex-row md:items-center md:justify-between cursor-pointer"
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">{clinician}</h3>
          </div>

          <Badge
            color={specialization === "General Physician" ? "indigo" : "violet"}
            size="2"
            variant="soft"
            radius="full"
          >
            {specialization}
          </Badge>

          <Badge variant="surface" color={statusStyles.color} radius="full">
            {statusStyles.text}
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-2 md:mt-0">
          <div className="mr-2 flex items-center">
            <CalendarIcon className="mr-1 h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{appointment_date}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="mr-1 h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formattedTime}</span>
          </div>
          {/* <Button 
            variant="soft" 
            size="1" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            {isExpanded ? "Less" : "More"}
          </Button> */}
        </div>
      </div>

      {/* Expanded content */}
      <div
        className={`transition-all duration-300 ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
      >
        <Separator size="4" />

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <BuildingIcon className="mt-0.5 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Hospital</p>
                <p className="text-gray-800">{hospital}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <BriefcaseMedicalIcon className="mt-0.5 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Appointment Mode
                </p>
                <Badge
                  variant="soft"
                  color={chosenSlot.mode === "Online" ? "cyan" : "amber"}
                >
                  {chosenSlot.mode}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPinIcon className="mt-0.5 h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="mb-2 text-gray-800">{address}</p>
                <Button
                  color="indigo"
                  size="1"
                  variant="soft"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(plus_code)}`,
                      "_blank",
                    )
                  }
                >
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator size="4" />

        <div className="flex flex-wrap items-center justify-end gap-3 p-4">
          <Feedback data={data} />

          {data?.status === "completed" && (
            <SeeDetails
              data={data}
              refetch={refetch}
              prescriptionData={prescriptionData}
            />
          )}

          {data?.status === "missed" && (
            <div className="flex items-center justify-center gap-x-2 rounded-md border-2 border-orange-500 px-3 py-2 text-orange-500">
              <ExclamationTriangleIcon />
              <span>Missed Appointment</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryAppointmentCard;
