import { Badge, Code, DataList, Flex } from "@radix-ui/themes";

function BookingFormReviewData({
  data,
  bookingSuccessful,
  setBookingSuccessful,
}) {
  const formData = data;
  const selectedDoctor = formData?.selectedClinician;
  
  return (
    <div>
      <div className="mb-4 flex select-none justify-center text-center font-noto text-base font-semibold md:text-lg">
        {bookingSuccessful ? (
          <p className="rounded-sm border border-green-400 bg-green-200 p-2 py-1 text-green-800">
            Appointment booked successfully!
          </p>
        ) : (
          <p className="p-2 py-1">Review your booking details</p>
        )}
      </div>
      <div className="flex flex-col justify-between gap-y-10 rounded-md border-2 px-4 py-2 font-noto">
        <DataList.Root
          orientation={"horizontal"}
          style={{ gap: ".8rem" }}
          size={{
            initial: "1",
            md: "2",
          }}
        >
          <DataList.Item>
            <DataList.Label minWidth="88px">Patient Name</DataList.Label>
            <DataList.Value>
              <Flex align="center" gap="2">
                <Code variant="ghost">{formData.firstName} {formData.lastName}</Code>
              </Flex>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label minWidth="88px">Email</DataList.Label>
            <DataList.Value>
              <Flex align="center" gap="2">
                <Code variant="ghost">{formData.email}</Code>
              </Flex>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label minWidth="88px">Phone</DataList.Label>
            <DataList.Value>
              <Flex align="center" gap="2">
                <Code variant="ghost">{formData.phone}</Code>
              </Flex>
            </DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label minWidth="88px">Symptoms</DataList.Label>
            <DataList.Value>
              <Flex align="center" gap="2">
                <Code variant="ghost" color="gray">
                  {formData.symptoms}
                </Code>
              </Flex>
            </DataList.Value>
          </DataList.Item>
          {formData.medicalHistory && (
            <DataList.Item>
              <DataList.Label minWidth="88px">Medical History</DataList.Label>
              <DataList.Value>
                <Flex align="center" gap="2">
                  <Code variant="ghost" color="gray">
                    {formData.medicalHistory}
                  </Code>
                </Flex>
              </DataList.Value>
            </DataList.Item>
          )}
        </DataList.Root>
        <div>
          <div className="mb-2 font-noto font-semibold">Selected Doctor:</div>
          <div className="flex justify-between gap-y-1 rounded-md bg-[#f0f0f3] px-4 py-2 font-noto">
            <DataList.Root
              orientation={"horizontal"}
              style={{ gap: ".65rem" }}
              size={{
                initial: "1",
                md: "2",
              }}
            >
              <DataList.Item>
                <DataList.Label minWidth="88px">Name</DataList.Label>
                <DataList.Value>
                  <Code variant="ghost">{selectedDoctor?.clinician_name}</Code>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item align="center">
                <DataList.Label minWidth="88px">Specialization</DataList.Label>
                <DataList.Value>
                  <Badge color="jade" variant="soft" radius="full">
                    {selectedDoctor?.specialization}
                  </Badge>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Hospital</DataList.Label>
                <DataList.Value>
                  <Code variant="ghost">{selectedDoctor?.hospital_name}</Code>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Mode</DataList.Label>
                <DataList.Value>
                  <Code variant="ghost">{selectedDoctor?.mode}</Code>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Available Time</DataList.Label>
                <DataList.Value>
                  <Code variant="ghost">{selectedDoctor?.selectedSlot?.start_time} - {selectedDoctor?.selectedSlot?.end_time}</Code>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Available Date</DataList.Label>
                <DataList.Value>
                  <Code variant="ghost">{formData?.selectedDate}</Code>
                </DataList.Value>
              </DataList.Item>
            </DataList.Root>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingFormReviewData;

