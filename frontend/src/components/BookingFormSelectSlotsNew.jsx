import { Button, Badge, Spinner } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import useGetDoctors from "../hooks/useGetDoctors";
import useGenerateSlots from "../hooks/useGenerateSlots";
import DoctorSlotCard from "./DoctorSlotCard";

function BookingFormSelectSlotsNew({
  formData,
  setFormData,
  dataClinicianType,
  setMode,
  mode,
}) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  
  // Get all doctors
  const {
    isLoading: isLoadingDoctors,
    data: doctors,
    error: errorDoctors,
    refetch: refetchDoctors,
  } = useGetDoctors();

  // Generate slots for selected doctor and date
  const {
    isLoading: isLoadingSlots,
    data: slotsData,
    error: errorSlots,
    refetch: refetchSlots,
    isFetching: isFetchingSlots,
  } = useGenerateSlots(
    selectedDoctor?.id,
    formData.selectedDate ? formData.selectedDate.split("-").reverse().join("-") : null
  );

  // Set default date if not set
  useEffect(() => {
    if (!formData.selectedDate) {
      const today = new Date()
        .toLocaleDateString("en-IN")
        .replace(/\//g, "-")
        .split("-")
        .map((x) => (x.length === 1 ? `0${x}` : x))
        .join("-");
      setFormData({ ...formData, selectedDate: today });
    }
  }, []);

  // Map ML API specialization to database specializations
  const mapSpecializationToDatabase = (mlSpecialization) => {
    const mappings = {
      'general practitioner': ['general medicine', 'general practice', 'family medicine'],
      'cardiologist': ['cardiology', 'cardiac'],
      'dermatologist': ['dermatology', 'skin'],
      'orthopedic': ['orthopedics', 'orthopedic surgery', 'bone'],
      'neurologist': ['neurology', 'neuro'],
      'pediatrician': ['pediatrics', 'child'],
      'gynecologist': ['gynecology', 'women'],
      'psychiatrist': ['psychiatry', 'mental health'],
      'ophthalmologist': ['ophthalmology', 'eye'],
      'ent': ['ent', 'ear nose throat', 'otolaryngology']
    };
    
    const key = mlSpecialization?.toLowerCase();
    return mappings[key] || [key];
  };

  // Filter doctors by specialization if available
  const filteredDoctors = doctors?.filter(doctor => {
    if (!dataClinicianType) return true;
    
    const searchTerms = mapSpecializationToDatabase(dataClinicianType);
    const doctorSpecialty = doctor.specialty?.toLowerCase() || '';
    const doctorTags = doctor.expertiseTags?.map(tag => tag.toLowerCase()) || [];
    
    return searchTerms.some(term =>
      doctorSpecialty.includes(term) ||
      doctorTags.some(tag => tag.includes(term))
    );
  }) || [];

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({ 
      ...formData, 
      selectedClinician: null // Reset slot selection when doctor changes
    });
  };

  // Handle slot selection
  const handleSlotSelect = (doctor, slot) => {
    setFormData({
      ...formData,
      selectedClinician: {
        clinician_id: doctor.id,
        clinician_name: doctor.name,
        specialization: doctor.specialty,
        hospital_name: doctor.name || "Unknown Hospital",
        selectedSlot: slot,
        mode: mode,
        tags: doctor.expertiseTags?.reduce((acc, tag, index) => {
          acc[tag] = index + 1;
          return acc;
        }, {}) || {}
      }
    });
  };

  // Transform slots data for DoctorSlotCard component
  const transformedDoctorData = selectedDoctor && slotsData ? {
    clinician_id: selectedDoctor.id,
    clinician_name: selectedDoctor.name,
    specialization: selectedDoctor.specialty,
    hospital_name: selectedDoctor.hospital_name || "Unknown Hospital",
    available_slots: slotsData.data?.availableSlots || slotsData.slots || [],
    tags: selectedDoctor.expertiseTags?.reduce((acc, tag, index) => {
      acc[tag] = index + 1;
      return acc;
    }, {}) || {}
  } : null;

  return (
    <div className="w-full animate-fade">
      <div className="mb-4 flex select-none justify-center text-center font-noto text-lg font-semibold md:text-xl">
        Select a Doctor and Time Slot
      </div>

      {/* Date Selection & Refresh */}
      <div className="mb-4 flex items-center gap-x-4">
        <input
          className="w-44 rounded-md border border-gray-300 p-2 text-sm md:text-base"
          type="date"
          min={new Date().toISOString().split("T")[0]}
          max={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
          value={
            formData.selectedDate
              ? formData.selectedDate.split("-").reverse().join("-")
              : ""
          }
          onChange={(e) => {
            const [year, month, day] = e.target.value.split("-");
            const formattedDate = `${day}-${month}-${year}`;
            setFormData({
              ...formData,
              selectedDate: formattedDate,
              selectedClinician: null,
            });
            setSelectedDoctor(null);
          }}
        />
        <Button onClick={() => {
          refetchDoctors();
          if (selectedDoctor) {
            refetchSlots();
          }
        }}>
          Refresh
        </Button>
      </div>

      {/* Recommended Doctor Type */}
      {dataClinicianType && (
        <div className="mb-4 flex items-center gap-x-2">
          <div className="flex font-noto text-xs font-semibold">
            Recommended Doctor Type:
          </div>
          <Badge color="jade" variant="soft" radius="full">
            {dataClinicianType}
          </Badge>
        </div>
      )}

      {/* Appointment Mode Selection */}
      <div className="my-4 flex w-full justify-center">
        <div className="flex w-full rounded-lg bg-gray-200 p-1">
          <button
            className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition-all ${
              mode === "online"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600"
            }`}
            onClick={() => {
              setMode("online");
              setFormData({ ...formData, selectedClinician: null });
            }}
          >
            Online Consultation
          </button>
          <button
            className={`flex-1 rounded-lg py-2 text-center text-sm font-medium transition-all ${
              mode === "offline"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600"
            }`}
            onClick={() => {
              setMode("offline");
              setFormData({ ...formData, selectedClinician: null });
            }}
          >
            Offline Visit
          </button>
        </div>
      </div>

      {/* Loading States */}
      {isLoadingDoctors && (
        <div className="flex items-center justify-center py-8">
          <Spinner size="3" />
          <span className="ml-2">Loading doctors...</span>
        </div>
      )}

      {/* Doctor Selection */}
      {!isLoadingDoctors && !selectedDoctor && (
        <div className="mb-6">
          <h3 className="mb-3 font-semibold">Step 1: Select a Doctor</h3>
          <div className="grid gap-3">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="cursor-pointer rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md"
                onClick={() => handleDoctorSelect(doctor)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{doctor.name}</h4>
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    <p className="text-xs text-gray-500">{doctor.hospital_name || "Unknown Hospital"}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {doctor.expertiseTags?.slice(0, 3).map((tag, index) => (
                      <Badge key={index} color="blue" variant="soft" size="1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {filteredDoctors.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                No doctors available for the recommended specialization.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slot Selection */}
      {selectedDoctor && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="font-semibold">Step 2: Select a Time Slot</h3>
            <Button 
              size="1" 
              variant="soft" 
              onClick={() => setSelectedDoctor(null)}
            >
              Change Doctor
            </Button>
          </div>
          
          {isLoadingSlots || isFetchingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="3" />
              <span className="ml-2">Loading available slots...</span>
            </div>
          ) : transformedDoctorData ? (
            <DoctorSlotCard
              data={transformedDoctorData}
              formData={formData}
              setFormData={(newFormData) => {
                // Custom handler to work with our slot selection logic
                if (newFormData.selectedClinician) {
                  handleSlotSelect(selectedDoctor, newFormData.selectedClinician.selectedSlot);
                } else {
                  setFormData(newFormData);
                }
              }}
              mode={mode}
            />
          ) : (
            <div className="py-8 text-center text-gray-500">
              No slots available for this doctor on the selected date.
            </div>
          )}
        </div>
      )}

      {/* Error States */}
      {errorDoctors && (
        <div className="py-4 text-center text-red-500">
          Error loading doctors: {errorDoctors.message}
        </div>
      )}
      {errorSlots && (
        <div className="py-4 text-center text-red-500">
          Error loading slots: {errorSlots.message}
        </div>
      )}
    </div>
  );
}

export default BookingFormSelectSlotsNew;