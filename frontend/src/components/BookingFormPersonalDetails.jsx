import {
  Button,
  DropdownMenu,
  TextArea,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import { getAddressFromCoords } from "../utils/api";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";


function BookingFormPersonalDetails({ data }) {
  const { formData, setFormData } = data;

  // Configure speech recognition
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Update health issue field in real-time as the user speaks
  useEffect(() => {
    if (transcript) {
      setFormData({ ...formData, healthIssue: transcript });
    }
  }, [transcript]);

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-IN", // Supports both Hindi and English speakers in India
    });
    toast.success("Listening for health issues...");
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    toast.success("Speech recording stopped");
  };

  async function getAddress() {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const address = await getAddressFromCoords(lat, lng);
      toast.success("Address fetched successfully");
      setFormData({ ...formData, address });
      // console.log(address);
    } catch (error) {
      // console.log(error);
      toast.error(error.message);
    }
  }

  return (
    <div className="animate-fade">
      <div className="mb-4 flex select-none justify-center text-center font-noto text-base font-semibold md:text-lg">
        Fill your personal details
      </div>
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-y-1 lg:w-1/2">
          <span className="">Full Name</span>
          <TextField.Root
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          ></TextField.Root>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="">Address</span>
          <div className="flex gap-x-2">
            <TextField.Root
              placeholder="Address"
              className="w-full"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            >
              <TextField.Slot>
                <Tooltip content="Get Address from your location">
                  <Button
                    variant="soft"
                    color="gray"
                    style={{
                      left: "0",
                      top: "0",
                      bottom: "0",
                      padding: "0 10px",
                      marginLeft: "-7px",
                      borderRadius: "4px 0 0 4px",
                    }}
                    onClick={() => getAddress()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      fill="#2e2e2e"
                      viewBox="0 0 256 256"
                    >
                      <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
                    </svg>
                  </Button>
                </Tooltip>
              </TextField.Slot>
            </TextField.Root>
            <Button
              variant=""
              color="iris"
              size="2"
              onClick={() => getAddress()}
            >
              Get Address
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span className="">Describe Health Issues</span>
            {/* {browserSupportsSpeechRecognition && (
              <Button
                variant=""
                size="1"
                color={listening ? "red" : "green"}
                onClick={listening ? stopListening : startListening}
              >
                {listening ? (
                  <>
                    <span className="mr-1">Stop</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span className="mr-1">Voice Input</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                  </>
                )}
              </Button>
            )} */}
          </div>
          <div className="relative">
            <TextArea
              placeholder="Description"
              data-lenis-prevent="true"
              resize="vertical"
              style={{
                height: "100px",
              }}
              value={formData.healthIssue}
              onChange={(e) =>
                setFormData({ ...formData, healthIssue: e.target.value })
              }
            ></TextArea>

            {!browserSupportsSpeechRecognition && (
              <div className="mt-1 text-sm text-red-500">
                Your browser doesn't support speech recognition.
              </div>
            )}

            {listening && (
              <div className="absolute right-2 top-2 flex items-center gap-x-1">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </div>
                <span className="text-xs text-gray-600">Listening...</span>
              </div>
            )}
            <div className="flex justify-end mt-3">
              {browserSupportsSpeechRecognition && (
                <Button
                  variant=""
                  size="2"
                  color={listening ? "red" : "iris"}
                  onClick={listening ? stopListening : startListening}
                >
                  {listening ? (
                    <>
                      <span className="mr-1">Stop</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span className="mr-1">Voice Input</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                        <line x1="12" x2="12" y1="19" y2="22" />
                      </svg>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-x-5">
          <div className="flex w-16 flex-col gap-y-1">
            <span className="">Age</span>
            <TextField.Root
              placeholder="Age"
              value={formData.age}
              type="number"
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
            ></TextField.Root>
          </div>

          <div className="flex w-fit items-end">
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger>
                <Button variant="outline" color="gray">
                  {/* Gender */}
                  {formData.gender ? formData.gender : "Gender"}
                  <DropdownMenu.TriggerIcon />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item
                  onClick={() => setFormData({ ...formData, gender: "Male" })}
                >
                  Male
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => setFormData({ ...formData, gender: "Female" })}
                >
                  Female
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingFormPersonalDetails;

