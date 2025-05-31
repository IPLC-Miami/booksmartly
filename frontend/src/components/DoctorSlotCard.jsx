import { Badge, Checkbox, Code, DataList, Flex, Text } from "@radix-ui/themes";
import { format, parseISO } from "date-fns";
import moment from "moment";

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
// function ClinicianSlotCard({ data, formData, setFormData }) {
//   const tags = data?.tags;
//   // iterate over key value pairs in tags
//   return (
//     <div className="flex justify-between gap-y-1 rounded-md border-2 px-4 py-2 font-noto">
//       <DataList.Root
//         orientation={{
//           initial: "vertical",
//           sm: "horizontal",
//         }}
//         style={{ gap: ".65rem" }}
//         size={{
//           initial: "1",
//           md: "2",
//         }}
//       >
//         <DataList.Item>
//           <DataList.Label minWidth="88px">Name</DataList.Label>
//           <DataList.Value>
//             <Code variant="ghost">{data?.clinician_name}</Code>
          </DataList.Value>
//         </DataList.Item>
//         <DataList.Item align="">
//           <DataList.Label minWidth="88px">Specialization</DataList.Label>
//           <DataList.Value>
//             <Badge color="jade" variant="soft" radius="full">
//               {data?.specialization}
//             </Badge>
//           </DataList.Value>
//         </DataList.Item>
//         <DataList.Item>
//           <DataList.Label minWidth="88px">Hospital</DataList.Label>
//           <DataList.Value>
//             <Code variant="ghost">{data?.hospital_name}</Code>
//           </DataList.Value>
//         </DataList.Item>
//         <DataList.Item>
//           <DataList.Label minWidth="88px">Available Time</DataList.Label>
//           <DataList.Value>
//             {/* {data?.available_from && data?.available_to && (
//               <Code variant="ghost">
//                 {moment(data?.available_from, "HH:mm:ss").format("hh:mm A")} -{" "}
//                 {moment(data?.available_to, "HH:mm:ss").format("hh:mm A")}
//               </Code>
//             )} */}
//             {data?.available_slots.map((slot => {
//               const startTime = moment(slot.start_time, "HH:mm:ss").format("hh:mm A");
//               const endTime = moment(slot.end_time, "HH:mm:ss").format("hh:mm A");
//               return (
//                 <Code variant="ghost" key={slot.start_time}>
//                   {startTime} - {endTime}
//                 </Code>
//               );
//             }))}
//           </DataList.Value>
//         </DataList.Item>
//         <DataList.Item>
//           <DataList.Label minWidth="88px">Tags</DataList.Label>
//           <DataList.Value>
//             <div className="grid md:grid-flow-col md:grid-cols-4 grid-cols-2 gap-2">
//               {data?.tags &&
//                 Object.entries(data.tags)
//                   .slice(0, 5)
//                   .map(([key, value], ix) => (
//                     <div className="flex">
//                       <Badge
//                         radius="none"
//                         style={{
//                           paddingRight: "3px",
//                         }}
//                       >
//                         {capitalizeFirstLetter(key)}
//                       </Badge>
//                       <Badge
//                         style={{
//                           paddingLeft: "3px",
//                         }}
//                         className="relative -left-0"
//                         color="gray"
//                         radius="none"
//                       >
//                         x {value}
//                       </Badge>
//                     </div>
//                   ))}
//               {!data?.tags && <Code variant="ghost">No tags available</Code>}
//             </div>
//           </DataList.Value>
//         </DataList.Item>
//       </DataList.Root>
//       <div className="ml-4 flex items-center justify-center">
//         <Checkbox
//           checked={formData?.selectedClinician?.clinician_id === data?.clinician_id}
//           onCheckedChange={(checked) => {
//             checked && setFormData({ ...formData, selectedClinician: data });
//             !checked && setFormData({ ...formData, selectedClinician: null });
//           }}
//           size={"3"}
//         />
//       </div>
//     </div>
//   );
// }
const tagColors = ["blue", "green", "purple", "orange", "red"];

function ClinicianSlotCard({ data, formData, setFormData, mode}) {
  return (
    <div className="flex flex-col gap-4 rounded-md border-2 p-4 font-noto shadow-md">
      <DataList.Root size={{ initial: "1", md: "2" }}>
        <DataList.Item>
          <DataList.Label>Name</DataList.Label>
          <DataList.Value>
            <Code variant="ghost">{data?.clinician_name}</Code>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Specialization</DataList.Label>
          <DataList.Value>
            <Badge color="jade" variant="soft" radius="full">
              {data?.specialization}
            </Badge>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Hospital</DataList.Label>
          <DataList.Value>
            <Code variant="ghost">{data?.hospital_name}</Code>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Available Slots</DataList.Label>
          <DataList.Value>
            <div className="flex flex-col gap-2">
              {data?.available_slots.map((slot, index) => {
                const startTime = moment(slot.start_time, "HH:mm:ss").format("hh:mm A");
                const endTime = moment(slot.end_time, "HH:mm:ss").format("hh:mm A");

                const isSelected =
                  formData?.selectedClinician?.clinician_id === data?.clinician_id &&
                  formData?.selectedClinician?.selectedSlot?.start_time === slot.start_time;

                return (
                  <div
                    key={slot.start_time}
                    className={`flex items-center justify-between rounded-lg border p-2 ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <Code variant="ghost">
                        {startTime} - {endTime}
                      </Code>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              selectedClinician: { ...data, selectedSlot: slot , mode: mode },
                            });
                          } else {
                            setFormData({ ...formData, selectedClinician: null });
                          }
                        }}
                        size="3"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label>Tags</DataList.Label>
          <DataList.Value>
            {data?.tags ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.tags)
                  .slice(0, 5)
                  .map(([key, value], index) => (
                    <Badge key={key} color={tagColors[index % tagColors.length]} radius="full">
                      {capitalizeFirstLetter(key)}: {value}
                    </Badge>
                  ))}
              </div>
            ) : (
              <Code variant="ghost">No tags available</Code>
            )}
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </div>
  );
}

export default ClinicianSlotCard;
