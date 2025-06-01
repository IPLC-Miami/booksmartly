// import { Badge, Button, Code, DataList } from "@radix-ui/themes";
// import { useState, useEffect, useRef } from "react";
// import QRScanner from "./QRscanner.jsx";
// import CancelDialog from "./CancelDialog";
// import { toast } from "sonner";

// import {
//   CalendarDays,
//   MapPin,
//   UserRound,
//   Building,
//   Clock,
//   ListOrdered,
//   Video,
//   QrCode,
// } from "lucide-react";

// function AppointmentCard({ data, refetch, index }) {
//   const {
//     appointmentId,
//     clinician,
//     specialization,
//     hospital,
//     address,
//     appointment_date,
//     queuePosition,
//     plus_code,
//     meetingLink,
//     appointment_time,
//     checked_in_status,
//   } = data;

//   // Determine if appointment is today or future
//   const isToday =
//     appointment_date ===
//     new Date().toLocaleDateString("en-IN").replace(/\//g, "-");
//   const statusColor = isToday ? "orange" : "blue";
//   const [expectedTime, setExpectedTime] = useState(null);
//   const [showScanner, setShowScanner] = useState(false);
//   const [isCheckedIn, setIsCheckedIn] = useState(checked_in_status);
//   const audioRef = useRef(null);
//   useEffect(() => {
//     audioRef.current = new Audio("/BookSmartly/sound/Check_In_Successful.mp3");
//     audioRef.current.preload = "auto";
//   }, []);

//   // Calculate expected time
//   useEffect(() => {
//     if (
//       appointment_time === "N/A" ||
//       queuePosition === "N/A" ||
//       isNaN(Number(queuePosition)) ||
//       appointment_date === "N/A"
//     ) {
//       setExpectedTime("N/A");
//       return;
//     }

//     const { start_time, end_time, mode } = appointment_time || {};

//     if (!start_time || !end_time) {
//       setExpectedTime("N/A");
//       return;
//     }

//     let availableTime = `${appointment_date}T${start_time}`;
//     const availableDate = new Date(availableTime);
//     const currentTime = new Date();
//     const queueDelayMinutes = (Number(queuePosition) - 1) * 4;
//     const expectedTime = new Date(
//       availableDate.getTime() + queueDelayMinutes * 60000,
//     );

//     const formatOptions = { hour: "2-digit", minute: "2-digit" };

//     if (currentTime.toISOString().split("T")[0] < appointment_date) {
//       // Future appointment
//       setExpectedTime(expectedTime.toLocaleTimeString("en-IN", formatOptions));
//     } else if (currentTime.toISOString().split("T")[0] === appointment_date) {
//       // Today's appointment
//       if (currentTime > availableDate) {
//         const adjustedTime = new Date(
//           currentTime.getTime() + queueDelayMinutes * 60000,
//         );
//         setExpectedTime(
//           adjustedTime.toLocaleTimeString("en-IN", formatOptions),
//         );
//       } else {
//         setExpectedTime(
//           expectedTime.toLocaleTimeString("en-IN", formatOptions),
//         );
//       }
//     } else {
//       // Past appointment
//       setExpectedTime("N/A");
//     }
//   }, [appointment_time, queuePosition, appointment_date]);

//   const handleScanSuccess = (scanData) => {
//     audioRef.current.currentTime = 0;

//     console.log("Scanned data:", scanData);

//     // if (scanData !== "fail") {
//     //   const audio = new Audio("/BookSmartly/sound/Check_In_Successful.mp3");
//     //   audio.play().catch((err) => console.error("Audio play error:", err));
//     // }

//     // setShowScanner(false);
//     if (scanData !== "fail") {
//       // const audio = new Audio("/BookSmartly/sound/Check_In_Successful.mp3");
//       // audio.addEventListener("ended", () => {
//       //   audio.play().catch((err) => console.error("Audio play error:", err));
//       //   setIsCheckedIn(true);
//       //   refetch();
//       // });
//       audioRef.current
//         .play()
//         .then(() => {
//           toast.success("Checked in Successfully");
//           // only mark checked-in after sound starts
//           setIsCheckedIn(true);
//           // refetch();
//         })
//         .catch((err) => {
//           console.error("Audio play was blocked or failed:", err);
//           // you could fallback to setting checked-in without sound
//           setIsCheckedIn(false);
//           // refetch();
//         });
//     }
//     setShowScanner(false);
//   };

//   const getAppointmentStatusBadge = () => {
//     if (checked_in_status) {
//       return (
//         <Badge size="2" variant="solid" color="green">
//           Checked In
//         </Badge>
//       );
//     }
//     if (isToday) {
//       return (
//         <Badge size="2" variant="solid" color="orange">
//           Today
//         </Badge>
//       );
//     }
//     return (
//       <Badge size="2" variant="solid" color="blue">
//         Upcoming
//       </Badge>
//     );
//   };

//   return (
//     <div className="mb-4 font-noto">
//       <div className="overflow-hidden rounded-lg border-2 bg-white shadow-md">
//         {/* Header with status */}
//         <div className="flex items-center justify-between border-b bg-gray-50 p-3">
//           <div className="flex items-center">
//             {index + 1 > 0 && (
//               <div className="mr-2 text-lg font-medium text-gray-500">
//                 {index + 1}.
//               </div>
//             )}
//             <UserRound className="mr-2 text-indigo-600" size={18} />
//             <span className="text-lg font-medium">{clinician}</span>
//             <Badge
//               color="indigo"
//               variant="soft"
//               radius="small"
//               className="ml-2"
//             >
//               {specialization}
//             </Badge>
//           </div>
//           <div>{getAppointmentStatusBadge()}</div>
//         </div>

//         {/* Main content */}
//         <div className="p-4">
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             {/* Left column */}
//             <div className="space-y-3">
//               <div className="flex items-start">
//                 <Building
//                   className="mr-2 mt-1 flex-shrink-0 text-gray-500"
//                   size={16}
//                 />
//                 <div>
//                   <div className="text-sm text-gray-500">Hospital</div>
//                   <div className="font-medium">{hospital}</div>
//                 </div>
//               </div>

//               <div className="flex items-start">
//                 <MapPin
//                   className="mr-2 mt-1 flex-shrink-0 text-gray-500"
//                   size={16}
//                 />
//                 <div>
//                   <div className="text-sm text-gray-500">Address</div>
//                   <div className="mb-1 font-medium">{address}</div>
//                   <Button
//                     color="iris"
//                     size="1"
//                     onClick={() =>
//                       window.open(
//                         `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(plus_code)}`,
//                         "_blank",
//                       )
//                     }
//                   >
//                     Get Directions
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex items-start">
//                 <CalendarDays
//                   className="mr-2 mt-1 flex-shrink-0 text-gray-500"
//                   size={16}
//                 />
//                 <div>
//                   <div className="text-sm text-gray-500">Appointment Date</div>
//                   <div className="font-medium">
//                     <Badge variant="surface" color={statusColor}>
//                       {appointment_date}
//                     </Badge>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right column */}
//             <div className="space-y-3">
//               <div className="flex items-start">
//                 <Clock
//                   className="mr-2 mt-1 flex-shrink-0 text-gray-500"
//                   size={16}
//                 />
//                 <div>
//                   <div className="text-sm text-gray-500">Expected Time</div>
//                   <div className="font-medium">
//                     <Badge variant="surface" color={statusColor}>
//                       {expectedTime}
//                     </Badge>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-start">
//                 <ListOrdered
//                   className="mr-2 mt-1 flex-shrink-0 text-gray-500"
//                   size={16}
//                 />
//                 <div>
//                   <div className="text-sm text-gray-500">Queue Position</div>
//                   <div className="font-medium">
//                     <Badge variant="surface" color={statusColor}>
//                       {queuePosition}
//                     </Badge>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-start">
//                 {appointment_time.mode === "online" ? (
//                   <Video
//                     className="mr-2 mt-1 flex-shrink-0 text-gray-500"
//                     size={16}
//                   />
//                 ) : (
//                   <QrCode
//                     className="mr-2 mt-1 flex-shrink-0 text-gray-500"
//                     size={16}
//                   />
//                 )}
//                 <div>
//                   <div className="text-sm text-gray-500">Mode</div>
//                   <div className="font-medium">
//                     <Badge variant="soft" color="green">
//                       {appointment_time.mode}
//                     </Badge>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Action buttons */}
//         <div className="flex justify-end gap-3 border-t bg-gray-50 p-3">
//           <CancelDialog data={{ ...data, expectedTime }} refetch={refetch} />

//           {appointment_time.mode === "online" ? (
//             <Button
//               color="green"
//               onClick={() =>
//                 window.open(meetingLink, "_blank", "noopener,noreferrer")
//               }
//             >
//               <Video size={16} className="mr-1" />
//               <span>Join Meet</span>
//             </Button>
//           ) : (
//             <>
//               {!checked_in_status ? (
//                 <Button color="blue" onClick={() => setShowScanner(true)}>
//                   <QrCode size={16} className="mr-1" />
//                   <span>Check In</span>
//                 </Button>
//               ) : (
//                 <Button disabled={true} color="green">
//                   Checked In Successfully
//                 </Button>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {/* QR Scanner Modal */}
//       {showScanner && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
//           <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6">
//             <button
//               onClick={() => setShowScanner(false)}
//               className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 bg-white text-red-500 hover:text-red-700"
//               aria-label="Close"
//             >
//               ✕
//             </button>

//             <h3 className="mb-4 text-center text-lg font-medium">
//               Scan QR Code to Check In
//             </h3>

//             <QRScanner
//               appointmentId={appointmentId}
//               onScanSuccess={handleScanSuccess}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AppointmentCard;
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AppointmentCard;

/* ------------------------------------------------------ */
import { Badge, Button, Code, DataList } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import QRScanner from "./QRscanner.jsx";
import CancelDialog from "./CancelDialog";
import {
  CalendarDays,
  MapPin,
  UserRound,
  Building,
  Clock,
  ListOrdered,
  Video,
  QrCode,
} from "lucide-react";

function AppointmentCard({ data, refetch, index }) {
  const {
    appointmentId,
    clinician,
    specialization,
    hospital,
    address,
    appointment_date,
    queuePosition,
    plus_code,
    meetingLink,
    appointment_time,
    checked_in_status,
  } = data;

  // Determine if appointment is today or future
  const isToday =
    appointment_date ===
    new Date().toLocaleDateString("en-IN").replace(/\//g, "-");
  const statusColor = isToday ? "orange" : "blue";
  const [expectedTime, setExpectedTime] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Calculate expected time
  useEffect(() => {
    if (
      appointment_time === "N/A" ||
      queuePosition === "N/A" ||
      isNaN(Number(queuePosition)) ||
      appointment_date === "N/A"
    ) {
      setExpectedTime("N/A");
      return;
    }

    const { start_time, end_time, mode } = appointment_time || {};

    if (!start_time || !end_time) {
      setExpectedTime("N/A");
      return;
    }

    let availableTime = `${appointment_date}T${start_time}`;
    const availableDate = new Date(availableTime);
    const currentTime = new Date();
    const queueDelayMinutes = (Number(queuePosition) - 1) * 4;
    const expectedTime = new Date(
      availableDate.getTime() + queueDelayMinutes * 60000,
    );

    const formatOptions = { hour: "2-digit", minute: "2-digit" };

    if (currentTime.toISOString().split("T")[0] < appointment_date) {
      // Future appointment
      setExpectedTime(expectedTime.toLocaleTimeString("en-IN", formatOptions));
    } else if (currentTime.toISOString().split("T")[0] === appointment_date) {
      // Today's appointment
      if (currentTime > availableDate) {
        const adjustedTime = new Date(
          currentTime.getTime() + queueDelayMinutes * 60000,
        );
        setExpectedTime(
          adjustedTime.toLocaleTimeString("en-IN", formatOptions),
        );
      } else {
        setExpectedTime(
          expectedTime.toLocaleTimeString("en-IN", formatOptions),
        );
      }
    } else {
      // Past appointment
      setExpectedTime("N/A");
    }
  }, [appointment_time, queuePosition, appointment_date]);

  const handleScanSuccess = (scanData) => {
    console.log("Scanned data:", scanData);

    if (scanData !== "fail") {
      const audio = new Audio("/sound/Check_In_Successful.mp3");
      audio.play().catch((err) => console.error("Audio play error:", err));
      setIsCheckedIn(true);
    }

    setShowScanner(false);
  };

  const getAppointmentStatusBadge = () => {
    if (checked_in_status) {
      return (
        <Badge size="2" variant="solid" color="green">
          Checked In
        </Badge>
      );
    }
    if (isToday) {
      return (
        <Badge size="2" variant="solid" color="orange">
          Today
        </Badge>
      );
    }
    return (
      <Badge size="2" variant="solid" color="blue">
        Upcoming
      </Badge>
    );
  };

  return (
    <div className="mb-4 font-noto">
      <div className="overflow-hidden rounded-lg border-2 bg-white shadow-md">
        {/* Header with status */}
        <div className="flex items-center justify-between border-b bg-gray-50 p-3">
          <div className="flex items-center">
            {index + 1 > 0 && (
              <div className="mr-2 text-lg font-medium text-gray-500">
                {index + 1}.
              </div>
            )}
            <UserRound className="mr-2 text-indigo-600" size={18} />
            <span className="text-lg font-medium">{clinician}</span>
            <Badge
              color="indigo"
              variant="soft"
              radius="small"
              className="ml-2"
            >
              {specialization}
            </Badge>
          </div>
          <div>{getAppointmentStatusBadge()}</div>
        </div>

        {/* Main content */}
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Left column */}
            <div className="space-y-3">
              <div className="flex items-start">
                <Building
                  className="mr-2 mt-1 flex-shrink-0 text-gray-500"
                  size={16}
                />
                <div>
                  <div className="text-sm text-gray-500">Hospital</div>
                  <div className="font-medium">{hospital}</div>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin
                  className="mr-2 mt-1 flex-shrink-0 text-gray-500"
                  size={16}
                />
                <div>
                  <div className="text-sm text-gray-500">Address</div>
                  <div className="mb-1 font-medium">{address}</div>
                  <Button
                    color="iris"
                    size="1"
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

              <div className="flex items-start">
                <CalendarDays
                  className="mr-2 mt-1 flex-shrink-0 text-gray-500"
                  size={16}
                />
                <div>
                  <div className="text-sm text-gray-500">Appointment Date</div>
                  <div className="font-medium">
                    <Badge variant="surface" color={statusColor}>
                      {appointment_date}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-3">
              <div className="flex items-start">
                <Clock
                  className="mr-2 mt-1 flex-shrink-0 text-gray-500"
                  size={16}
                />
                <div>
                  <div className="text-sm text-gray-500">Expected Time</div>
                  <div className="font-medium">
                    <Badge variant="surface" color={statusColor}>
                      {expectedTime}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <ListOrdered
                  className="mr-2 mt-1 flex-shrink-0 text-gray-500"
                  size={16}
                />
                <div>
                  <div className="text-sm text-gray-500">Queue Position</div>
                  <div className="font-medium">
                    <Badge variant="surface" color={statusColor}>
                      {queuePosition}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                {appointment_time.mode === "online" ? (
                  <Video
                    className="mr-2 mt-1 flex-shrink-0 text-gray-500"
                    size={16}
                  />
                ) : (
                  <QrCode
                    className="mr-2 mt-1 flex-shrink-0 text-gray-500"
                    size={16}
                  />
                )}
                <div>
                  <div className="text-sm text-gray-500">Mode</div>
                  <div className="font-medium">
                    <Badge variant="soft" color="green">
                      {appointment_time.mode}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 border-t bg-gray-50 p-3">
          <CancelDialog data={{ ...data, expectedTime }} refetch={refetch} />

          {appointment_time.mode === "online" ? (
            <Button
              color="green"
              onClick={() =>
                window.open(meetingLink, "_blank", "noopener,noreferrer")
              }
            >
              <Video size={16} className="mr-1" />
              <span>Join Meet</span>
            </Button>
          ) : (
            <>
              {!isCheckedIn ? (
                <Button color="blue" onClick={() => setShowScanner(true)}>
                  <QrCode size={16} className="mr-1" />
                  <span>Check In</span>
                </Button>
              ) : (
                <Button disabled={true} color="green">
                  Checked In Successfully
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 bg-white text-red-500 hover:text-red-700"
              aria-label="Close"
            >
              ✕
            </button>

            <h3 className="mb-4 text-center text-lg font-medium">
              Scan QR Code to Check In
            </h3>

            <QRScanner
              appointmentId={appointmentId}
              onScanSuccess={handleScanSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentCard;

