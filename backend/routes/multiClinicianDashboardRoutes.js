const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const { getIo } = require("../config/socket.js");
const { jwtValidation, roleExtraction, requireClinician, requireRole, requireOwnership } = require("../middleware/auth");
function getISTDateString() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
  const istTime = new Date(
    now.getTime() + istOffset - now.getTimezoneOffset() * 60000
  );
  return istTime.toISOString().split("T")[0];
}

const getQueuePosition = async (appointmentId) => {
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments2")
    .select(
      "clinician_id, appointment_date, chosen_slot->>start_time, chosen_slot->>end_time, created_at" // Updated field
    )
    .eq("id", appointmentId)
    .single();

  if (appointmentError || !appointment) {
    console.error("Error fetching appointment details:", appointmentError);
    return -1;
  }
  console.log("appointment: ", appointment);
  const { clinician_id, appointment_date, created_at, start_time, end_time } = // Updated field
    appointment;
  console.log("start_time: ", start_time);
  console.log("end_time: ", end_time);
  const { data, error } = await supabase
    .from("appointments2")
    .select("id")
    .eq("clinician_id", clinician_id) // Updated field
    .eq("appointment_date", appointment_date)
    .eq("chosen_slot->>start_time", start_time)
    .eq("chosen_slot->>end_time", end_time)
    .eq("status", "scheduled")
    .eq("book_status", "completed")
    .lt("created_at", created_at);

  if (error) {
    console.error("Error fetching queue position:", error);
    return -1;
  }

  return data.length + 1;
};
const getQueuePositionPostCheckin = async (appointmentId) => {
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments2")
    .select(
      "clinician_id, appointment_date, chosen_slot->>start_time, chosen_slot->>end_time, created_at" // Updated field
    )
    .eq("id", appointmentId)
    .single();

  if (appointmentError || !appointment) {
    console.error("Error fetching appointment details:", appointmentError);
    return -1;
  }
  console.log("appointment: ", appointment);
  const { clinician_id, appointment_date, created_at, start_time, end_time } = // Updated field
    appointment;
  console.log("start_time: ", start_time);
  console.log("end_time: ", end_time);
  const { data, error } = await supabase
    .from("appointments2")
    .select("id")
    .eq("clinician_id", clinician_id) // Updated field
    .eq("appointment_date", appointment_date)
    .eq("chosen_slot->>start_time", start_time)
    .eq("chosen_slot->>end_time", end_time)
    .eq("status", "scheduled")
    .eq("book_status", "completed")
    .eq("checked_in_status", true)
    .lt("created_at", created_at);

  if (error) {
    console.error("Error fetching queue position:", error);
    return -1;
  }
  return data.length + 1;
};

router.get("/nextAppointments/:clinicianId", jwtValidation, roleExtraction, requireClinician, requireOwnership('clinician'), async (req, res) => { // Renamed route parameter
  const { clinicianId } = req.params; // Renamed variable
  const date = getISTDateString();
  console.log(date); 

  const { data: appointments, error } = await supabase
    .from("appointments2")
    .select("*")
    .eq("clinician_id", clinicianId) // Updated field
    .eq("appointment_date", date)
    .eq("book_status", "completed")
    .eq("status", "scheduled")
    .eq("chosen_slot->>mode", "offline");

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  const updatedAppointments = await Promise.all(
    appointments.map(async (appointment) => {
      if (appointment.checked_in_status) {
        const queuePosition = await getQueuePositionPostCheckin(appointment.id);
        if (queuePosition !== -1 && queuePosition <= 4) {
          return { ...appointment, queuePosition };
        }
      }
      return null;
    })
  );

  const filteredAppointments = updatedAppointments.filter(
    (app) => app !== null
  );

  const result = filteredAppointments.map((appointment) => ({
    name: appointment.personal_details.name,
    queuePosition: appointment.queuePosition,
    checked_in_status: appointment.checked_in_status,
    age: appointment.personal_details.age,
  }));

  return res.json(result);
});

router.get("/allNextAppointments/:receptionId", jwtValidation, roleExtraction, requireRole(['admin', 'clinician']), async (req, res) => {
  const { receptionId } = req.params;
  const date = getISTDateString();
  console.log(date);

  const { data: receptionData, error: receptionError } = await supabase
    .from("clinicians2")
    .select("id, user_id") // Select user_id as well
    .eq("reception_id", receptionId);

  if (receptionError) {
    return res.status(400).json({ error: receptionError.message });
  }

  if (!receptionData || receptionData.length === 0) { // Check if receptionData is empty
    return res
      .status(404)
      .json({ error: "No clinicians found for this reception" });
  }

  const clinicianIdsFromReception = [];
  const clinicianAuthUserMap = {}; // Maps clinicians2.id to profiles.name via user_id

  await Promise.all(
    receptionData.map(async (clinician) => {
      // clinician.id is clinicians2.id, clinician.user_id is auth.users.id
      if (clinician.user_id) { // Ensure user_id exists
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", clinician.user_id) // Query profiles using user_id
          .single();

        if (profileError) {
          console.error(`Error fetching profile for clinician (user_id ${clinician.user_id}):`, profileError.message);
          // Decide how to handle - skip this clinician or use a placeholder name
          clinicianAuthUserMap[clinician.id] = "Name N/A";
        } else {
          clinicianAuthUserMap[clinician.id] = profileData.name;
        }
      } else {
         clinicianAuthUserMap[clinician.id] = "User ID Missing";
      }
      clinicianIdsFromReception.push(clinician.id); // This is clinicians2.id
    })
  );

  const result = {};

  await Promise.all(
    clinicianIdsFromReception.map(async (clinicianTableId) => { // This is clinicians2.id
      const { data: appointments, error } = await supabase
        .from("appointments2")
        .select("*")
        .eq("clinician_id", clinicianTableId) // This correctly uses clinicians2.id
        .eq("appointment_date", date)
        .eq("book_status", "completed")
        .eq("status", "scheduled")
        .eq("chosen_slot->>mode", "offline");
      console.log(appointments);

      if (error) {
        result[`${clinicianTableId}+${clinicianAuthUserMap[clinicianTableId]}`] = [];
        console.error(
          `Error fetching appointments for clinician ${clinicianTableId}:`,
          error
        );
        return;
      }

      const updatedAppointments = await Promise.all(
        appointments.map(async (appointment) => {
          if (appointment.checked_in_status) {
            const queuePosition = await getQueuePositionPostCheckin(
              appointment.id
            );
            if (queuePosition !== -1 && queuePosition <= 4) {
              return { ...appointment, queuePosition };
            }
          }
          return null;
        })
      );

      const filteredAppointments = updatedAppointments.filter(
        (app) => app !== null
      );

      const mappedAppointments = filteredAppointments.map((appointment) => ({
        name: appointment.personal_details.name,
        queuePosition: appointment.queuePosition,
        checked_in_status: appointment.checked_in_status,
        age: appointment.personal_details.age,
      }));

      result[`${clinicianTableId}+${clinicianAuthUserMap[clinicianTableId]}`] = mappedAppointments;
    })
  );

  console.log(result);
  return res.json(result);
});

module.exports = router;
