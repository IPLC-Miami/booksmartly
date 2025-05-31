import {
  Button,
  Code,
  Dialog,
  Flex,
  Separator,
  Text,
  TextField,
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
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import { useCallback, useState } from "react";
import SlidingPanel from "react-sliding-side-panel";
import "react-sliding-side-panel/lib/index.css";
import { Cross1Icon } from "@radix-ui/react-icons";
import HBorder from "../HBorder";
import { toast } from "sonner";
import debounce from "lodash.debounce";
import { useEffect } from "react";

function SeeDetailsHistory({ data, refetch, prescriptionData }) {
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
  } = data;
  const [isPaneOpen, setIsPaneOpen] = useState(false);

  const [clinicianRemarks, setClinicianRemarks] = useState("");
  const [clinicianPrescription, setClinicianPrescription] = useState("");
  useEffect(() => {
    if (!prescriptionData || prescriptionData.length === 0) {
      setClinicianRemarks("No remarks provided");
      setClinicianPrescription("No prescription provided");
      return;
    }

    setClinicianRemarks(
      prescriptionData[0]?.clinician_notes || "No remarks provided", // Updated field name
    );

    // let markdown = "### Prescription Details\n\n";
    // markdown += "| Medicine Name  | Dosage  | Frequency    | Duration  |\n";
    // markdown += "|---------------|--------|------------|----------|\n";

    // if (Array.isArray(prescriptionData[0]?.medicines)) {
    //   prescriptionData[0].medicines.forEach((med) => {
    //     markdown += `| ${med.medicine_name}  | ${med.dosage}  | ${med.frequency} | ${med.duration}  |\n`;
    //   });
    // }

    setClinicianPrescription(
      prescriptionData[0]?.medicines || "No prescription provided",
    );
  }, [prescriptionData]);
  // async function saveDetails() {
  //   // Save the clinicianRemarks and clinicianPrescription to the database
  //   // Refetch the data
  //   toast.success("Details saved successfully");
  // }
  // async function saveAndMarkAsDone() {
  //   // Refetch the data
  //   toast.success(
  //     "Details saved successfully and patient is marked as visited",
  //   );
  // }

  // const debouncedSetClinicianRemarks = useCallback(
  //   debounce((newContent) => {
  //     setClinicianRemarks(newContent);
  //   }, 300), // Adjust the delay (in ms) based on your needs
  //   [],
  // );
  // const debouncedSetClinicianPrescription = useCallback(
  //   debounce((newContent) => {
  //     setClinicianPrescription(newContent);
  //   }, 300),
  //   [],
  // );
  // // console.log(clinicianRemarks, clinicianPrescription);

  // debounce and change

  return (
    <div className="">
      <Button
        color="iris"
        onClick={() => setIsPaneOpen(true)}
        size={{ initial: "1", md: "2" }}
      >
        Details
      </Button>
      <SlidingPanel
        backdropClicked={() => setIsPaneOpen(false)}
        className="prose max-w-none font-inter text-sm"
        overlayClassName="some-custom-overlay-class"
        isOpen={isPaneOpen}
        size={90}
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
            <Text as="div" size="5" weight="bold">
              Patient Details:
            </Text>
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

              {/* <label className="flex gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Queue Position:
                </Text>
                <Code as="div" weight={"bold"} size="2" mb="1">
                  {queuePosition}
                </Code>
              </label> */}

              <label className="flex gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Appointment Date:
                </Text>
                <Code as="div" weight={"bold"} size="2" mb="1">
                  {appointment_date}
                </Code>
              </label>

              <label className="flex gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Appointment Time:
                </Text>
                <Code as="div" weight={"bold"} size="2" mb="1">
                  {new Date(appointment_time).toLocaleTimeString([] , { hour: '2-digit', minute: '2-digit' })}
                </Code>
              </label>

              <label className="flex flex-col gap-3">
                <Text as="div" size="2" mb="1" weight="bold">
                  Clinician Remarks:
                </Text>
              </label>
              <MDXEditor
                readOnly={true}
                // onChange={(newContent) => {
                //   debouncedSetClinicianRemarks(newContent);
                // }}
                contentEditableClassName="prose max-w-none h-full mb-4 border-2 "
                markdown={clinicianRemarks || ""}
                placeholder="Nothing to show here..."
                plugins={[
                  toolbarPlugin({
                    toolbarClassName: "my-classname",
                    toolbarContents: () => (
                      <>
                        {/* <UndoRedo />
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
                        <DiffSourceToggleWrapper /> */}
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
                readOnly={true}
                // onChange={(newContent) => {
                //   // console.log(newContent);
                //   debouncedSetClinicianPrescription(newContent);
                // }}
                contentEditableClassName="prose max-w-none mb-4 h-full border-2 "
                markdown={clinicianPrescription || ""}
                placeholder="Nothing to show here..."
                plugins={[
                  toolbarPlugin({
                    toolbarClassName: "my-classname",
                    toolbarContents: () => (
                      <>
                        {/* <UndoRedo />
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
                        <DiffSourceToggleWrapper /> */}
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
            {/* <div className="flex w-full gap-x-4 py-4">
              <Button>Save</Button>
              <Button>Save & Mark as Done</Button>
            </div> */}
          </div>
        </div>
      </SlidingPanel>
    </div>
  );
}

export default SeeDetailsHistory;