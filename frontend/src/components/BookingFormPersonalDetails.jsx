import {
  Button,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";


function BookingFormPersonalDetails({ data }) {
  const { formData, setFormData } = data;
  const [errors, setErrors] = useState({});

  // Configure speech recognition
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Update symptoms field in real-time as the user speaks
  useEffect(() => {
    if (transcript) {
      setFormData({ ...formData, symptoms: transcript });
    }
  }, [transcript]);

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-IN", // Supports both Hindi and English speakers in India
    });
    toast.success("Listening for symptoms...");
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    toast.success("Speech recording stopped");
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = 'First name is required';
        } else {
          delete newErrors.firstName;
        }
        break;
      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = 'Last name is required';
        } else {
          delete newErrors.lastName;
        }
        break;
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (!value.trim()) {
          newErrors.phone = 'Phone number is required';
        } else {
          delete newErrors.phone;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  return (
    <div className="animate-fade">
      <div className="mb-4 flex select-none justify-center text-center font-noto text-base font-semibold md:text-lg">
        Fill your personal details
      </div>
      <form className="flex flex-col gap-y-4">
        <div className="flex gap-x-4">
          <div className="flex flex-1 flex-col gap-y-1">
            <span className="">First Name</span>
            <TextField.Root
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            ></TextField.Root>
            {errors.firstName && (
              <span className="text-sm text-red-500">{errors.firstName}</span>
            )}
          </div>
          
          <div className="flex flex-1 flex-col gap-y-1">
            <span className="">Last Name</span>
            <TextField.Root
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            ></TextField.Root>
            {errors.lastName && (
              <span className="text-sm text-red-500">{errors.lastName}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="">Email</span>
          <TextField.Root
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          ></TextField.Root>
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email}</span>
          )}
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="">Phone Number</span>
          <TextField.Root
            name="phone"
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          ></TextField.Root>
          {errors.phone && (
            <span className="text-sm text-red-500">{errors.phone}</span>
          )}
        </div>

        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span className="">Symptoms</span>
          </div>
          <div className="relative">
            <TextArea
              name="symptoms"
              placeholder="Describe your symptoms"
              data-lenis-prevent="true"
              resize="vertical"
              style={{
                height: "100px",
              }}
              value={formData.symptoms}
              onChange={(e) => handleInputChange('symptoms', e.target.value)}
            ></TextArea>

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
                  type="button"
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

        <div className="flex flex-col gap-y-1">
          <span className="">Medical History (Optional)</span>
          <TextArea
            name="medicalHistory"
            placeholder="Any relevant medical history"
            data-lenis-prevent="true"
            resize="vertical"
            style={{
              height: "80px",
            }}
            value={formData.medicalHistory}
            onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
          ></TextArea>
        </div>
      </form>
    </div>
  );
}

export default BookingFormPersonalDetails;

