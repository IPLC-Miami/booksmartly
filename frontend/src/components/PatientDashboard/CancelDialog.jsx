import {
  Badge,
  Button,
  Code,
  DataList,
  Dialog,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";
import useDeleteAppointment from "../../hooks/useDeleteAppointment";
import { use } from "react";

function CancelDialog({ data, refetch }) {
  const {
    appointmentId,
    clinician,
    specialization,
    hospital,
    appointment_time,
    appointment_date,
    expectedTime,
    queuePosition,
  } = data;
  const appointmentTypes = ["green", "blue"]; // green for today's appointment, blue for future appointment
  const appointmentType =
    appointment_date === new Date().toISOString().split("T")[0]
      ? appointmentTypes[0]
      : appointmentTypes[1];

  //cancel appointment
  const { mutate: cancelAppointment } = useDeleteAppointment();
  const handleCancel = () => {
    cancelAppointment.mutate(appointmentId);
  };
  return (
    <div className="font-noto">
      <Dialog.Root>
        <Dialog.Trigger>
          <Button variant="soft" color="red">
            Cancel
          </Button>
        </Dialog.Trigger>

        <Dialog.Content maxWidth="450px">
          <div className="font- mb-2 font-medium">
            Cancel the following appointment?
          </div>
          <div className="flex justify-between gap-y-1 rounded-md border-2 px-4 py-2 font-noto">
            <DataList.Root
              orientation={"horizontal"}
              style={{ gap: ".65rem" }}
              size={{
                initial: "1",
                md: "2",
              }}
            >
              <DataList.Item>
                <DataList.Label minWidth="88px">Clinician</DataList.Label>
                <DataList.Value>
                  <Code variant="ghost">{clinician}</Code>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item align="center">
                <DataList.Label minWidth="88px">Specialization</DataList.Label>
                <DataList.Value>
                  <Badge color="indigo" variant="soft" radius="small">
                    {specialization}
                  </Badge>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Hospital</DataList.Label>
                <DataList.Value>
                  <Code variant="ghost">{hospital}</Code>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">
                  Appointment Expected Time
                </DataList.Label>
                <DataList.Value>
                  <Badge variant="ghost" color={appointmentType}>
                    {expectedTime}
                  </Badge>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">
                  Appointment Date
                </DataList.Label>
                <DataList.Value>
                  <Badge variant="" color={appointmentType}>
                    {appointment_date}
                  </Badge>
                </DataList.Value>
              </DataList.Item>
              <DataList.Item>
                <DataList.Label minWidth="88px">Queue Position</DataList.Label>
                <DataList.Value>
                  <Badge variant="" color={appointmentType}>
                    {queuePosition}
                  </Badge>
                </DataList.Value>
              </DataList.Item>
            </DataList.Root>
          </div>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button>No, Go Back</Button>
            </Dialog.Close>
            <Dialog.Close>
              <Button color="red" onClick={handleCancel}>
                Yes, Cancel
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}

export default CancelDialog;

