const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const sendEmail = require("../services/emailService");
const {
  jwtValidation,
  roleExtraction,
  requireRole,
  requireClient,
  requireClinician,
  requireOwnership
} = require("../middleware/auth");
const { getIo } = require("../config/socket.js");
const { calendar, event } = require("../services/meetScheduler");
const {
  oauth2client,
  loadTokens,
  refreshAccessToken,
} = require("../config/googleClient");
const getQueuePosition = async (appointmentId) => {
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments2")
    .select(
      "clinician_id, appointment_date, chosen_slot->>start_time, chosen_slot->>end_time, created_at" // Changed doctor_id to clinician_id
    )
    .eq("id", appointmentId)
    .single();

  if (appointmentError || !appointment) {
    console.error("Error fetching appointment details:", appointmentError);
    return -1;
  }
  console.log("appointment: ", appointment);
  const { clinician_id, appointment_date, created_at, start_time, end_time } = // Changed doctor_id to clinician_id
    appointment;
  console.log("start_time: ", start_time);
  console.log("end_time: ", end_time);
  const { data, error } = await supabase
    .from("appointments2")
    .select("id")
    .eq("clinician_id", clinician_id) // Changed doctor_id to clinician_id
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
      "clinician_id, appointment_date, chosen_slot->>start_time, chosen_slot->>end_time, created_at" // Changed doctor_id to clinician_id
    )
    .eq("id", appointmentId)
    .single();

  if (appointmentError || !appointment) {
    console.error("Error fetching appointment details:", appointmentError);
    return -1;
  }
  console.log("appointment: ", appointment);
  const { clinician_id, appointment_date, created_at, start_time, end_time } = // Changed doctor_id to clinician_id
    appointment;
  console.log("start_time: ", start_time);
  console.log("end_time: ", end_time);
  const { data, error } = await supabase
    .from("appointments2")
    .select("id")
    .eq("clinician_id", clinician_id) // Changed doctor_id to clinician_id
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
router.post("/book", jwtValidation, roleExtraction, requireClient, async (req, res) => {
  const {
    patientId,    // This should be client_id to match table structure if patientId is auth.users.id
    clinicianId,  // Changed from doctorId
    appointment_date,
    chosen_slot,
    book_status,
    personal_details,
  } = req.body;

  const { data: removedData, error: removePendingError } = await supabase
    .from("appointments2")
    .delete()
    .eq("client_id", patientId) // Assuming patientId from req.body is the client's auth.users.id, matching client_id
    .eq("book_status", "pending");

  if (removePendingError) {
    return res.status(400).json({ error: removePendingError.message }); // Added .message
  }

  let parsedPersonalDetails;
  try { // Added try block here
    parsedPersonalDetails =
      typeof personal_details === "string"
        ? JSON.parse(personal_details)
        : personal_details;
  } catch (parseError) {
    console.error("Error parsing personal_details:", parseError);
    return res.status(400).json({ error: "Invalid personal_details format" });
  }

  let parsedChosenSlot;
  try {
    parsedChosenSlot =
      typeof chosen_slot === "string" ? JSON.parse(chosen_slot) : chosen_slot;
  } catch (parseError) {
    console.error("Error parsing chosen_slot:", parseError);
    return res.status(400).json({ error: "Invalid chosen_slot format" });
  }

  const { data: patientData, error: patientError } = await supabase
    .from("auth.users")
    .select("email, raw_user_meta_data")
    .eq("id", patientId)
    .single();

  if (patientError) {
    return res.status(400).json({ error: patientError.message });
  }

  let googleMeetLink = null;
  if (parsedChosenSlot.mode === "online") {
    event.start.dateTime = new Date(
      appointment_date + "T" + parsedChosenSlot.start_time + ":00+05:30"
    ).toISOString();
    event.end.dateTime = new Date(
      appointment_date + "T" + parsedChosenSlot.end_time + ":00+05:30"
    ).toISOString();
    event.attendees[0].email = patientData.email;
    loadTokens();
    try {
      const result = await calendar.events.insert({
        calendarId: "primary",
        auth: oauth2client,
        resource: event,
        conferenceDataVersion: 1,
      });
      googleMeetLink = result.data.hangoutLink;
    } catch (err) {
      console.log("Google Meet scheduling error:", err);
      return res.status(400).json({ error: "Failed to schedule Google Meet" });
    }
  }

  const { data, error } = await supabase
    .from("appointments2")
    .insert([
      {
        client_id: patientId, // Changed patient_id to client_id
        clinician_id: clinicianId, // Changed doctor_id to clinician_id
        book_status: book_status,
        appointment_date: appointment_date,
        personal_details: parsedPersonalDetails,
        chosen_slot: parsedChosenSlot,
        meeting_link: googleMeetLink,
      },
    ])
    .select() // Select all by default
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  console.log("Appointment booked successfully");

  const patientEmail = patientData.email;
  const patientName = patientData.raw_user_meta_data?.name || patientData.raw_user_meta_data?.full_name || patientData.email || "Unknown User";
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
        }
        .footer {
            font-size: 14px;
            color: #777;
            margin-top: 20px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Appointment Confirmed!</h2>
        <p class="message">Hello <strong>${patientName}</strong>,</p>
        <p class="message">Your appointment has been successfully booked with the doctor. Please check your dashboard for more details.</p>
        ${
          googleMeetLink
            ? `<p class="message">Your Google Meet link: <a href="${googleMeetLink}" target="_blank">Join Here</a></p>`
            : ""
        }
        <div class="footer">
            <p>If you have any questions, feel free to <a href="mailto:BookSmartlywell@gmail.com">contact us</a>.</p>
            <p>&copy; 2025 BookSmartly. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

  sendEmail(patientEmail, "Appointment Confirmed - BookSmartly", html);
  return res.status(201).json(data);
});
router.post("/updateStatus/:appointmentId", jwtValidation, roleExtraction, requireClinician, async (req, res) => {
  console.log("update status request recieved");
  const { appointmentId } = req.params;
  const { status } = req.query;
  console.log(req);
  const { data, error } = await supabase
    .from("appointments2")
    .update({ status: status, updated_at: new Date().toISOString() })
    .eq("id", appointmentId)
    .select("*")
    .single();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  console.log("Appointment status updated successfully");
  console.log(data);
  // const { data2, err } = await supabase
  //   .from("appointments")
  //   .select("doctor_id")
  //   .eq("id", appointmentId)
  //   .single();

  // console.log(data2?.dpctor, " ", err)
  const { data: data2, error: error2 } = await supabase
    .from("auth.users") // This fetches user data of the clinician using clinician_id from appointments2
    .select("email, raw_user_meta_data")
    .eq("id", (await supabase.from("clinicians2").select("user_id").eq("id", data?.clinician_id).single())?.data?.user_id ); // Get auth.users.id from clinicians2
  const { data: data3, error: error3 } = await supabase
    .from("clinicians2") // Changed from doctors2
    .select("reception_id")
    .eq("id", data?.clinician_id); // data.clinician_id is the clinicians2.id
  console.log(data2, " ", data3);

  if (error) { // This 'error' is from the update operation, not data2/data3 fetch
    return res.status(400).json({ error: error.message });
  }
  // Construct clinicianIdentifier using clinicians2.id and name from profiles
  const clinicianAuthId = (await supabase.from("clinicians2").select("user_id").eq("id", data?.clinician_id).single())?.data?.user_id;
  const clinicianUserData = clinicianAuthId ? (await supabase.from("auth.users").select("email, raw_user_meta_data").eq("id", clinicianAuthId).single())?.data : null;
  const clinicianProfileName = clinicianUserData ? (clinicianUserData.raw_user_meta_data?.name || clinicianUserData.raw_user_meta_data?.full_name || clinicianUserData.email || "Unknown Clinician") : "Unknown Clinician";
  const clinicianIdentifier = `${data?.clinician_id}+${clinicianProfileName}`;

  console.log(clinicianIdentifier);
  console.log("reaching end");
  const receptionId = data3[0]?.reception_id;
  if (clinicianIdentifier) { // Changed from doctorId to clinicianIdentifier
    const io = getIo();
    console.log("clinician queue changed");
    io.to(receptionId).emit("clinicianQueueChanged", {
      clinicianId: clinicianIdentifier,
      receptionIdFromSocket: data3 && data3.length > 0 ? data3[0]?.reception_id : null, // Added null check for data3
    });
  }

  return res.json(data);
});
router.get("/upcomingAppointments/:patientId", jwtValidation, roleExtraction, requireClient, requireOwnership('client'), async (req, res) => {
  const { patientId } = req.params;
  const { date } = req.query;
  const { data: appointments, error } = await supabase
    .from("appointments2")
    .select("*, clinicians2 ( user_id )") // Select user_id from clinicians2, aliased as clinician_user_id by Supabase
    .eq("client_id", patientId) // Changed patient_id to client_id
    .gte("appointment_date", date)
    .eq("book_status", "completed")
    .eq("status", "scheduled");
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  const updatedAppointments = await Promise.all(
    appointments.map(async (appointment) => {
      const position = await getQueuePosition(appointment.id);
      if (appointment.checked_in_status) {
        console.log("checked in appointment: ", appointment);
        const pos2 = await getQueuePositionPostCheckin(appointment.id);
        console.log("checked in appointment position: ", pos2);
        return {
          ...appointment,
          queuePosition: position,
          queuePositionPostCheckin: pos2,
        };
      }
      return { ...appointment, queuePosition: position };
    })
  );
  return res.json(updatedAppointments);
});
router.get("/completedAppointments/:patientId", jwtValidation, roleExtraction, requireClient, requireOwnership('client'), async (req, res) => {
  const { patientId } = req.params;
  const { data: appointments, error } = await supabase
    .from("appointments2")
    .select("*, clinicians2 ( user_id )") // Select user_id from clinicians2
    .eq("client_id", patientId) // Changed patient_id to client_id
    .in("status", ["completed", "missed"]);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // Rename clinicians2.user_id to clinician_user_id for frontend consistency
  const processedAppointments = appointments.map(app => ({
    ...app,
    clinician_user_id: app.clinicians2?.user_id,
    clinicians2: undefined // remove the nested clinicians2 object
  }));
  console.log(processedAppointments);
  return res.json(processedAppointments);
});
router.get("/clinicianUpcomingAppointments/:clinicianId", jwtValidation, roleExtraction, requireClinician, requireOwnership('clinician'), async (req, res) => { // Renamed route and param
  const { clinicianId } = req.params; // Renamed param
  const { date, endTime, startTime } = req.query;
  const { data: appointments, error } = await supabase
    .from("appointments2")
    .select("*, clinicians2 ( user_id )") // Select user_id from clinicians2
    .eq("clinician_id", clinicianId) // Changed doctor_id to clinician_id
    .eq("appointment_date", date)
    .eq("book_status", "completed")
    .eq("status", "scheduled")
    .eq("chosen_slot->>start_time", startTime)
    .eq("chosen_slot->>end_time", endTime);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  const updatedAppointments = await Promise.all(
    appointments.map(async (appointment) => {
      const position = await getQueuePosition(appointment.id); // getQueuePosition uses clinician_id internally
      let processedAppointment = {
        ...appointment,
        queuePosition: position,
        clinician_user_id: appointment.clinicians2?.user_id, // Add clinician_user_id
      };
      delete processedAppointment.clinicians2; // Clean up nested object

      if (appointment.checked_in_status) {
        const pos2 = await getQueuePositionPostCheckin(appointment.id);
        processedAppointment.queuePositionPostCheckin = pos2;
      }
      return processedAppointment;
    })
  );
  return res.json(updatedAppointments);
});
router.get("/clinicianCompletedAppointments/:clinicianId", jwtValidation, roleExtraction, requireClinician, requireOwnership('clinician'), async (req, res) => { // Renamed route and param
  const { clinicianId } = req.params; // Renamed param
  const { data: appointments, error } = await supabase
    .from("appointments2")
    .select("*, clinicians2 ( user_id )") // Select user_id from clinicians2
    .eq("clinician_id", clinicianId) // Changed doctor_id to clinician_id
    .eq("status", "completed");
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  // Rename clinicians2.user_id to clinician_user_id for frontend consistency
  const processedAppointments = appointments.map(app => ({
    ...app,
    clinician_user_id: app.clinicians2?.user_id,
    clinicians2: undefined // remove the nested clinicians2 object
  }));
  console.log(processedAppointments);
  return res.json(processedAppointments);
});
router.delete("/delete/:appointmentId", jwtValidation, roleExtraction, requireRole(['client', 'clinician']), requireOwnership('appointment'), async (req, res) => {
  const { appointmentId } = req.params;
  const { data, error } = await supabase
    .from("appointments2")
    .delete()
    .eq("id", appointmentId);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  return res.json(data);
});
module.exports = router;

