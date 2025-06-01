import {
  Button,
  Code,
  Dialog,
  Flex,
  Separator,
  Spinner,
  Text,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import "@mdxeditor/editor/style.css";
import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  toolbarPlugin,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  InsertImage,
  imagePlugin,
  diffSourcePlugin,
  InsertTable,
  tablePlugin,
  ListsToggle,
  listsPlugin,
  headingsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  InsertThematicBreak,
  markdownShortcutPlugin,
  linkPlugin,
} from "@mdxeditor/editor";
import "react-sliding-pane/dist/react-sliding-pane.css";
import { useCallback, useEffect, useState } from "react";
import SlidingPanel from "react-sliding-side-panel";
import "react-sliding-side-panel/lib/index.css";
import { Cross1Icon } from "@radix-ui/react-icons";
import HBorder from "../HBorder";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import usePostPrescription from "../../hooks/usePutPrescription";
import usePostAppointmentStatus from "../../hooks/usePostAppointmentStatus";
import { set } from "lodash";

function SeeDetails({ data, refetch, otpVerified }) {
  const {
    patientName,
    age,
    gender,
    hospital,
    currentMedication,
    issue,
    issueDetails,
    appointment_time,
    appointment_date,
    queuePosition,
    checked_in_status,
  } = data;
  const [isPaneOpen, setIsPaneOpen] = useState(false);

  const [clinicianRemarks, setClinicianRemarks] = useState(""); // can either debounce or use a normal variable to store the clinicianRemarks to avoid unnecessary re-renders
  const [clinicianPrescription, setClinicianPrescription] = useState("");

  const [savePrescriptionSuccess, setSavePrescriptionSuccess] = useState(false);
  const [updateAppointmetnStatusSuccess, setUpdateAppointmentStatusSuccess] =
    useState(false);
  const { mutate: savePrescription } = usePostPrescription(
    setSavePrescriptionSuccess,
  );
  const { mutate: saveAppointmentStatus } = usePostAppointmentStatus(
    setUpdateAppointmentStatusSuccess,
  );
  // on component load, register start time, and elapsed time. end time will be the save time
  const [startTime, setStartTime] = useState(Date.now());
  const [endTime, setEndTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const formatElapsedTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  async function saveDetails() {
    // Save the clinicianRemarks and clinicianPrescription to the database
    // Refetch the data
    toast.success("Details saved successfully");
  }
  const [saving, setSaving] = useState(false);
  const appointmentId = data.appointmentId;
  async function saveAndMarkAsDone() {
    try {
      setSaving(true);
      setEndTime(Date.now());
      setSavePrescriptionSuccess(false);
      setUpdateAppointmentStatusSuccess(false);
      await Promise.all([
        savePrescription.mutateAsync({
          appointmentId,
          clinicianRemarks, // Updated variable
          clinicianPrescription, // Updated variable
        }),
        saveAppointmentStatus.mutateAsync({
          appointmentId: data.appointmentId,
          status: "completed",
        }),
      ]);
      setIsPaneOpen(false);
      toast.success("Details saved successfully");
    } catch (error) {
      // console.log("Error saving details", error);
      toast.error("Error saving details");
    } finally {
      setSaving(false);
    }
  }
  const debouncedSetClinicianRemarks = useCallback( // Updated function name
    debounce((newContent) => {
      setClinicianRemarks(newContent); // Updated state setter
    }, 300), // Adjust the delay (in ms) based on your needs
    [],
  );
  const debouncedSetClinicianPrescription = useCallback( // Updated function name
    debounce((newContent) => {
      setClinicianPrescription(newContent); // Updated state setter
    }, 300),
    [],
  );
  // console.log(clinicianRemarks, clinicianPrescription);
  console.log(checked_in_status);

  return (
    <div className="">
      <Tooltip
        className={otpVerified || checked_in_status ? "hidden" : ""}
        disableHoverableContent={true}
        content="Patient has not checked in yet"
        side="top"
      >
        <div className="w-full">
          <Button
            className="w-max"
            disabled={!otpVerified && !checked_in_status}
            color="green"
            onClick={() => {
              setIsPaneOpen(true);
              setStartTime(Date.now());
            }}
            size={{ initial: "1", md: "2" }}
          >
            Start
          </Button>
        </div>
      </Tooltip>
      <SlidingPanel
        backdropClicked={() => setIsPaneOpen(false)}
        className="prose max-w-none font-inter text-sm"
        overlayClassName="some-custom-overlay-class"
        isOpen={isPaneOpen}
        size={100}
        type="right"
      >
        <div className="h-screen overflow-scroll bg-white">
          <div className="top-0 flex h-10 items-center bg-gray-200 p-4">
            <Button
              variant="ghost"
              color="gray"
              radius="small"
              size={"1"}
              onClick={() => setIsPaneOpen(false)}
            >
              <Cross1Icon />
            </Button>
          </div>
          <div
            data-lenis-prevent="true"
            className="overflow-scroll bg-white p-8"
          >
            <div className="flex w-full justify-between">
              <Text as="div" size="5" weight="bold">
                Patient Details:
              </Text>
              <div className="flex flex-col">
                <Text as="div" size="2" mb="1" weight="bold">
                  Start Time:
                  <Code>
                    {new Date(startTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </Code>
                </Text>
                <Text as="div" size="2" mb="1" weight="bold">
                  Elapsed Time:
                  <Code>{formatElapsedTime(elapsedTime)}</Code>
                </Text>
              </div>
            </div>
            <div className="my-8 w-full border"></div>

            <Flex direction="column" gap="2">
              <label className="flex gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Name:
                </Text>
                <Text as="div" size="2" mb="1">
                  {patientName}
                </Text>
              </label>

              <label className="flex gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Age & Gender:
                </Text>
                <Text as="div" size="2" mb="1">
                  {age} {gender}
                </Text>
              </label>

              {/* <label className="flex gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Current Medication:
                </Text>
                {currentMedication.split(",").map((med, ix) => (
                  <Code color="green" weight={"bold"} size="2" key={ix}>
                    {med}
                  </Code>
                ))}
              </label> */}

              <label className="flex gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Issue:
                </Text>
                <Text as="div" size="2" mb="1">
                  {issueDetails}
                </Text>
              </label>

              <label className="flex gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Queue Position:
                </Text>
                <Code as="div" weight={"bold"} size="2" mb="1">
                  {queuePosition}
                </Code>
              </label>

              <label className="flex gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Appointment Date:
                </Text>
                <Code as="div" weight={"bold"} size="2" mb="1">
                  {appointment_date}
                </Code>
              </label>

              {/* <label className="flex gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Appointment Time:
                </Text>
                <Code as="div" weight={"bold"} size="2" mb="1">
                  {appointment_time}
                </Code>
              </label> */}

              <label className="flex flex-col gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Clinician Remarks:
                </Text>
              </label>
              <MDXEditor
                onChange={(newContent) => {
                  debouncedSetClinicianRemarks(newContent);
                }}
                contentEditableClassName="prose max-w-none h-full mb-4 border-2 border-t-0"
                markdown={""}
                placeholder="Type Clinician Remarks here..."
                plugins={[
                  toolbarPlugin({
                    toolbarClassName: "my-classname",
                    toolbarContents: () => (
                      <>
                        <UndoRedo />
                        <BoldItalicUnderlineToggles />
                        <BlockTypeSelect />
                        <CodeToggle />
                        <CreateLink />
                        <Separator orientation={"vertical"} />
                        <InsertImage />
                        <InsertTable />
                        <Separator orientation={"vertical"} />
                        <ListsToggle />
                        <InsertThematicBreak />
                        <DiffSourceToggleWrapper />
                      </>
                    ),
                  }),
                  headingsPlugin(),
                  imagePlugin(),
                  diffSourcePlugin(),
                  tablePlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  linkPlugin(),
                  markdownShortcutPlugin(),
                ]}
              />
              <label className="flex flex-col gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Medical Prescription:
                </Text>
              </label>
              <MDXEditor
                onChange={(newContent) => {
                  // console.log(newContent);

                  debouncedSetClinicianPrescription(newContent);
                }}
                contentEditableClassName="prose max-w-none mb-4 h-full border-2 border-t-0"
                markdown={""}
                placeholder="Type Medical Prescription here..."
                plugins={[
                  toolbarPlugin({
                    toolbarClassName: "my-classname",
                    toolbarContents: () => (
                      <>
                        <UndoRedo />
                        <BoldItalicUnderlineToggles />
                        <BlockTypeSelect />
                        <CodeToggle />
                        <CreateLink />
                        <Separator orientation={"vertical"} />
                        <InsertImage />
                        <InsertTable />
                        <Separator orientation={"vertical"} />
                        <ListsToggle />
                        <InsertThematicBreak />
                        <DiffSourceToggleWrapper />
                      </>
                    ),
                  }),
                  headingsPlugin(),
                  imagePlugin(),
                  diffSourcePlugin(),
                  tablePlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  linkPlugin(),
                  markdownShortcutPlugin(),
                ]}
              />
            </Flex>
            <div className="flex w-full gap-x-4 py-4">
              {/* <Button>Save</Button> */}
              <Button
                disabled={saving}
                color="iris"
                onClick={saveAndMarkAsDone}
              >
                Save & Mark as Done
                {saving && <Spinner />}
              </Button>
            </div>
          </div>
        </div>
      </SlidingPanel>
    </div>
  );
}

export default SeeDetails;
