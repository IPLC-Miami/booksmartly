import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeClosedIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { Button, Spinner } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingProcessGuide from "../components/BookingProcessGuide";
import BookingFormPersonalDetails from "../components/BookingFormPersonalDetails";
import useGetClinicianType from "../hooks/useGetClinicianType";
import { BarLoader } from "react-spinners";
import BookingFormSelectSlotsNew from "../components/BookingFormSelectSlotsNew";
import BookingFormReviewData from "../components/BookingFormReviewData";
import { toast } from "sonner";
import Loader from "../components/Loader";
import usePostBookAppointment from "../hooks/usePostBookAppointment";
function BookAppointment() {
  const [patientId, setPatientId] = useState(null);
  
  useEffect(() => {
    // Get user ID from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setPatientId(storedUserId);
    }
  }, []);
  // if(user.currentUser.id)
  // {
  //   // patientId =user.currentUser.id;
  // // console.log(user.currentUser.id);
  // patientId = user.currentUser.id;
  // }
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    symptoms: "",
    medicalHistory: "",
    selectedClinician: null,
    selectedDate: null,
  });
  const navigate = useNavigate();
  const [formState, setFormState] = useState(1); // 1: Personal Details, 2: Select Clinician, 3: Review Data

  function handleNext() {
    setFormState((prev) => prev + 1);
  }
  function handlePrev() {
    setFormState((prev) => prev - 1);
  }

  const {
    isLoading: isLoadingClinicianType,
    data: dataClinicianType,
    error: errorClinicianType,
  } = useGetClinicianType(formState === 2 ? formData.symptoms : null);
  const [mode, setMode] = useState("offline"); // Fetch clinician type based on health issue using ML model
  const [bookingSuccessful, setBookingSuccessful] = useState(false);


  const canProceed = () => {
    if (formState === 1) {
      if (
        formData.firstName === "" ||
        formData.lastName === "" ||
        formData.email === "" ||
        formData.phone === ""
      )
        return false;
      return true;
    }
    if (formState === 2) {
      if (!formData.selectedClinician || !formData.selectedDate) return false;
      return true;
    }
    if (formState === 3) return true;
  };

  // // console.log(formData);
  // const base =import.meta.env.VITE_API_BASE_URL;
  const {
    mutate: bookAppointment,
    isPending: isLoadingBookAppointment,
    isError,
    isSuccess,
  } = usePostBookAppointment(setBookingSuccessful);

  const onBookAppointment = () => {
    bookAppointment({ formData, patientId });
  };
  console.log("isLoadingBookAppointment", isLoadingBookAppointment);


  // // console.log(isFetchingSlots);
  // console.log(isLoadingClinicianType, isLoadingSlots, isFetchingSlots);
  // console.log("isLoadingClinicianType", isLoadingClinicianType);
  // console.log("isLoadingSlots", isLoadingSlots);
  // console.log("isFetchingSlots", isFetchingSlots);

  return (
    <>
      {isLoadingClinicianType && <Loader />}
      <div
        className="w-full border-2 border-indigo-600 transition-all duration-700"
        style={{
          width: `${((formState - 1) / 2) * 100}%`,
          position: "fixed",
          top: "45px",
          zIndex: "10",
        }}
      ></div>

      <div className="dotted mt-0 flex min-h-screen flex-col items-center justify-center">
      <div className="relative my-24 flex w-11/12 flex-col gap-y-4 rounded-md border-2 bg-white px-6 py-4 font-inter text-sm font-medium text-[#5d5d5d] shadow-2xl shadow-indigo-300 sm:w-10/12 sm:p-8 md:w-10/12 lg:w-8/12 xl:px-12">
        <div className="absolute left-3 top-3 -z-10 h-full w-full animate-fade-up rounded-md bg-gradient-to-r from-violet-300 to-indigo-400"></div>
        {isLoadingClinicianType && (
          <div>Loading clinician type...</div>
        )}
        {formState === 1 && (
          <BookingFormPersonalDetails data={{ formData, setFormData }} />
        )}
        {formState === 2 && (
          <BookingFormSelectSlotsNew
            formData={formData}
            setFormData={setFormData}
            dataClinicianType={dataClinicianType}
            setMode={setMode}
            mode={mode}
          />
        )}
        {formState === 3 && (
          <BookingFormReviewData
            data={formData}
            bookingSuccessful={bookingSuccessful}
            setBookingSuccessful={setBookingSuccessful}
            mode={mode}
          />
        )}

          <div className="flex w-full justify-between">
            {formState > 1 && !bookingSuccessful ? (
              <Button color="iris" size="2" onClick={() => handlePrev()}>
                <ArrowLeftIcon width={15} height={15} /> Back
              </Button>
            ) : (
              <div></div>
            )}
            {formState === 1 && canProceed() && (
              <Button color="iris" size="2" onClick={() => handleNext()}>
                Next <ArrowRightIcon width={15} height={15} />
              </Button>
            )}
            {formState === 1 && !canProceed() && (
              <Button
                color="gray"
                size="2"
                onClick={() =>
                  toast.warning("Please fill all the details to proceed.")
                }
              >
                Next <ArrowRightIcon width={15} height={15} />
              </Button>
            )}
            {formState === 2 && canProceed() && (
              <Button color="iris" size="2" onClick={() => handleNext()}>
                Continue to Review <ArrowRightIcon width={15} height={15} />
              </Button>
            )}
            {formState === 2 && !canProceed() && (
              <Button
                color="gray"
                size="2"
                onClick={() =>
                  toast.warning("Please select a doctor and time slot to proceed.")
                }
              >
                Continue to Review <ArrowRightIcon width={15} height={15} />
              </Button>
            )}
            {formState === 3 &&
              !bookingSuccessful &&
              (isLoadingBookAppointment ? (
                <Button
                  disabled
                  color="iris"
                  size="2"
                  onClick={() => onBookAppointment()}
                >
                  Confirm Booking <Spinner />
                </Button>
              ) : (
                <Button
                  color="iris"
                  size="2"
                  onClick={() => onBookAppointment()}
                >
                  Confirm Booking
                </Button>
              ))}
            {formState === 3 && bookingSuccessful && (
              <Button
                color="iris"
                size="2"
                onClick={() => navigate("/user/dashboard?tab=appointments")}
              >
                Check out your appointments
              </Button>
            )}
          </div>
          {/* <p
            className="w-fit cursor-pointer select-none border-b border-white text-indigo-700 transition-all duration-200 hover:border-b hover:border-indigo-700"
            onClick={() => navigate("/howitworks")}
          >
            Learn more
          </p> */}
        </div>
      </div>
    </>
  );
}

export default BookAppointment;

