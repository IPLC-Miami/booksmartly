import { Button, Badge } from "@radix-ui/themes";
import DoctorSlotCard from "./DoctorSlotCard";
import { useState, useEffect } from "react";

function BookingFormSelectSlots({
  doctors,
  formData,
  setFormData,
  refetchSlots,
  dataDoctorType,
  setMode,
  mode,
}) {
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
          max={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} // 14 days from now
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
              selectedDoctor: null,
            });
          }}
        />
        <Button onClick={() => refetchSlots()}>Refresh Slots</Button>
      </div>
      <div className="mb-4 flex items-center gap-x-2">
        <div className="flex font-noto text-xs font-semibold">
          Recommended Doctor Type:
        </div>
        <Badge color="jade" variant="soft" radius="full">
          {dataDoctorType}
        </Badge>
      </div>

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
              setFormData({ ...formData, selectedDoctor: null });
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
              setFormData({ ...formData, selectedDoctor: null });
            }}
          >
            Offline Visit
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-y-4">
        {doctors?.map((doctor, ix) => (
          <DoctorSlotCard
            key={`${doctor.id}`}
            data={doctor}
            formData={formData}
            setFormData={setFormData}
            mode={mode}
          />
        ))}
        {doctors.length === 0 && (
          <div className="my-12 text-center text-gray-500">
            No doctors available for this date!
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingFormSelectSlots;

