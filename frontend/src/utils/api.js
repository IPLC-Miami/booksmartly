import { supabase } from "../utils/supabaseClient";
const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function getAddressFromCoords(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch address from coordinates.");
    }

    const data = await response.json();
    // console.log(data);

    const address = data.display_name;
    if (!address) {
      throw new Error("No address found for the given coordinates.");
    }

    return address;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch address.");
  }
}

export async function getClinicianSlots(date, specialization, userId, mode) {
  // const userId = appointmentData.userId;
  // const specialization = appointmentData.specialization;
  // const date = appointmentData.date;
  // console.log("Get Clinician Slots: ", date, specialization, userId);

  const response = await fetch(
    `${API_URL}/api/clinicians/availableSlots2/${userId}?specialization=${specialization}&date=${date}&mode=${mode}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    // console.log("error in getClinicianSlots: ", response.status);
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  // console.log(data);
  return data;
}
export async function getProfileDetails(userId) {
  const response = await fetch(`${API_URL}/api/users/userById/${userId}`);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}
export async function getClinicianDetails(clinicianId) {
  const response = await fetch(
    `${API_URL}/api/clinicians/clinicianDetailsById/${clinicianId}`,
  );
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}
export async function getClinicianAvailability(clinicianId) {
  const clinicianDetails = await getClinicianDetails(clinicianId);
  return clinicianDetails.availability;
}
export async function deleteAppointment(appointmentId) {
  const response = await fetch(
    `${API_URL}/api/appointments/delete/${appointmentId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete appointment");
  }

  return response.json();
}
export async function getPatientAppointments(patientId) {
  const today = new Date().toISOString().split("T")[0];
  try {
    const response = await fetch(
      `${API_URL}/api/appointments/upcomingAppointments/${patientId}?date=${today}`,
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // console.log("Patient Appointments:", data);
    const updatedData = await Promise.all(
      data.map(async (appointment) => {
        try {
          // ASSUMPTION: Backend will be updated to provide clinician_user_id (auth.users.id) on appointment objects
          // If appointment.clinician_id is the clinicians2.id (auto-generated),
          // and getClinicianDetails/getProfileDetails expect auth.users.id, we need clinician_user_id.
          if (!appointment.clinician_user_id) {
            console.warn("appointment object is missing clinician_user_id:", appointment);
            // Fallback or error handling if clinician_user_id is not present
            // For now, try with appointment.clinician_id but expect it might be the wrong ID type
            const clinician = await getClinicianDetails(appointment.clinician_id);
            const clinicianProfileDetails = await getProfileDetails(appointment.clinician_id);
            return { ...appointment, clinicianDetails: clinician, clinicianProfileDetails: clinicianProfileDetails };
          }
          const clinician = await getClinicianDetails(appointment.clinician_user_id);
          const clinicianProfileDetails = await getProfileDetails(appointment.clinician_user_id);
          // console.log("Clinician Details:", clinicianProfileDetails);
          return {
            ...appointment,
            clinicianDetails: clinician,
            clinicianProfileDetails: clinicianProfileDetails,
          };
        } catch (error) {
          console.error("Failed to fetch clinician details:", error);
          return { ...appointment, clinicianDetails: null, clinicianProfileDetails: null }; // Avoid breaking the loop
        }
      }),
    );
    
    const finalAppointments = updatedData.map((appointment) => ({
      appointmentId: appointment.id,
      clinician: appointment.clinicianProfileDetails?.name || "Unknown", // Updated
      specialization: appointment.clinicianDetails?.specialization || "Unknown", // Updated
      hospital: appointment.clinicianDetails?.hospitalData?.name || "Unknown", // Updated
      meetingLink: appointment.meeting_link || "N/A",
      appointment_time: appointment?.chosen_slot || "N/A",
      appointment_date: appointment.appointment_date,
      queuePosition: appointment.queuePosition || "N/A",
      address: appointment.clinicianDetails?.hospitalData?.address || "N/A", // Updated
      plus_code: appointment.clinicianDetails?.hospitalData?.plus_code || "N/A", // Updated
      // available_from: appointment.clinicianDetails?.available_from || null,
      checked_in_status: appointment.checked_in_status || null,
      queuePositionPostCheckin: appointment?.queuePositionPostCheckin || null,
  
    }));

    return finalAppointments; // Return the array
  } catch (error) {
    console.error("Failed to fetch patient appointments:", error);
    throw new Error("Failed to fetch patient appointments.");
  }
}

export async function getPatientAppointmentHistory(patientId) {
  try {
    const response = await fetch(
      `${API_URL}/api/appointments/completedAppointments/${patientId}`,
    );
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const updatedData = await Promise.all(
      data.map(async (appointment) => {
        try {
          // ASSUMPTION: Backend will be updated to provide clinician_user_id (auth.users.id) on appointment objects
          if (!appointment.clinician_user_id) {
            console.warn("appointment object is missing clinician_user_id for history:", appointment);
            // Fallback or error handling
            const clinician = await getClinicianDetails(appointment.clinician_id);
            const clinicianProfileDetails = await getProfileDetails(appointment.clinician_id);
            return { ...appointment, clinicianDetails: clinician, clinicianProfileDetails: clinicianProfileDetails };
          }
          const clinician = await getClinicianDetails(appointment.clinician_user_id);
          const clinicianProfileDetails = await getProfileDetails(appointment.clinician_user_id);
          // console.log("Clinician Details:", clinicianProfileDetails);
          return {
            ...appointment,
            clinicianDetails: clinician,
            clinicianProfileDetails: clinicianProfileDetails,
          };
        } catch (error) {
          console.error("Failed to fetch clinician details for history:", error);
          return { ...appointment, clinicianDetails: null, clinicianProfileDetails: null }; // Avoid breaking the loop
        }
      }),
    );
    // console.log("Appointment History:", updatedData);

    const finalAppointments = updatedData.map((appointment) => ({
      appointmentId: appointment.id,
      clinicianId: appointment.clinician_id, // Updated
      patientId: appointment.patient_id,
      patientName: appointment.personal_details.name,
      status: appointment.status,
      age: appointment.personal_details.age,
      gender: appointment.personal_details.gender,
      hospital: appointment.clinicianDetails.hospitalData.name, // Updated
      appointment_date: appointment.appointment_date,
      queuePosition: "N/A",
      currentMedication: "N/A",
      issue: "N/A",
      issueDetails: appointment.personal_details.health_issue,
      chosenSlot: appointment.chosen_slot,
      appointment_time: appointment.updated_at,
      clinician: appointment.clinicianProfileDetails?.name || "Unknown", // Updated
      specialization: appointment.clinicianDetails?.specialization || "Unknown", // Updated
      address: appointment.clinicianDetails?.hospitalData.address || "N/A", // Updated
      plus_code: appointment.clinicianDetails?.hospitalData.plus_code || "N/A", // Updated
    }));

    return finalAppointments;
  } catch (error) {
    console.error("Failed to fetch patient appointments:", error);
    throw new Error("Failed to fetch patient appointments.");
  }
}

export async function getQueueForClinician(clinicianId, selectedDate, selectedSlot) { // Renamed
  console.log("seelctedDate", selectedDate);
  console.log("selectedSlot", selectedSlot);
  const today = new Date().toISOString().split("T")[0]; // Formats as YYYY-MM-DD

  try {
    const response = await fetch(
      `${API_URL}/api/appointments/clinicianUpcomingAppointments/${clinicianId}?date=${selectedDate}&endTime=${selectedSlot.end_time}&startTime=${selectedSlot.start_time}`, // Updated route
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const clinicianProfileDetails = await getClinicianDetails(clinicianId); // Updated
    const finalData = await Promise.all(
      data.map(async (appointment) => {
        return {
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
          patientName: appointment.personal_details.name,
          age: appointment.personal_details.age,
          gender: appointment.personal_details.gender,
          hospital: clinicianProfileDetails.hospitalData.name, // Updated
          appointment_time: appointment?.chosen_slot || "N/A",
          meetingLink: appointment.meeting_link || "N/A",
          // available_from: clinicianProfileDetails?.available_from || "N/A",
          appointment_date: appointment.appointment_date,
          queuePosition: appointment.queuePosition,
          currentMedication: "N/A",
          issue: "N/A",
          issueDetails: appointment.personal_details.health_issue,
          checked_in_status: appointment.checked_in_status || null,
          queuePositionPostCheckin: appointment?.queuePositionPostCheckin || null,
        };
      }),
    );
    return finalData;
  } catch (error) {
    console.error("Failed to fetch queue for clinician:", error); // Updated
    throw new Error("Failed to fetch queue for clinician."); // Updated
  }
}

export async function getHistoryForClinician(clinicianId) { // Renamed
  try {
    const response = await fetch(
      `${API_URL}/api/appointments/clinicianCompletedAppointments/${clinicianId}`, // Updated route
    );
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const clinicianProfileDetails = await getClinicianDetails(clinicianId); // Updated
    const finalData = await Promise.all(
      data.map(async (appointment) => {
        return {
          appointmentId: appointment.id,
          patientId: appointment.patient_id,
          patientName: appointment.personal_details.name,
          age: appointment.personal_details.age,
          gender: appointment.personal_details.gender,
          hospital: clinicianProfileDetails.hospitalData.name, // Updated
          appointment_date: appointment.appointment_date,
          queuePosition: "N/A",
          currentMedication: "N/A",
          issue: appointment.personal_details.health_issue,
          issueDetails: appointment.personal_details.health_issue,
          appointment_time: appointment.updated_at,
          chosenSlot: appointment.chosen_slot,
        };
      }),
    );
    return finalData;
  } catch (error) {
    console.error("Failed to fetch patient appointments:", error);
    throw new Error("Failed to fetch patient appointments.");
  }

  // const testData = [
  //   {
  //     patiendId: 1,
  //     patientName: "John Doe",
  //     age: 25,
  //     gender: "Male",
  //     issue: "Toothache",
  //     issueDetails:
  //       "I have a severe toothache since last night. My gums are swollen and I can't eat anything. My gums feel puffy and tender, especially around certain teeth. They look red and swollen, and sometimes they even bleed a little when I brush or floss. It feels sore, and chewing can be uncomfortable.",
  //     currentMedication: "Crocin 500mg, Budamate 200mg",
  //     appointment_date: "28-09-2025",
  //     appointment_time: "10:00 AM - 2:00 PM",
  //     hospital: "CityCare General Hospital",
  //     uid: "132",
  //     queuePosition: 123,
  //     doctorPrescription: `## Medical Prescription Report
  //                           **Patient Name:** John Doe
  //                           **Age:** 45
  //                           **Gender:** Male
  //                           **Date:** 2025-02-02
  //
  //                           ## Diagnosis
  //                           - Hypertension
  //                           - Type 2 Diabetes Mellitus
  //
  //                           ## Prescriptions
  //                           | Medication          | Dosage          | Frequency         | Duration  |
  //                           |---------------------|-----------------|-------------------|-----------|
  //                           | Amlodipine 5mg      | 1 tablet        | Once daily (AM)   | 1 month   |
  //                           | Metformin 500mg     | 1 tablet        | Twice daily (AM/PM) | 1 month   |
  //                           | Atorvastatin 10mg   | 1 tablet        | Nightly (PM)      | 1 month   |
  //
  //                           ## Instructions
  //                           - Maintain a low-sodium diet.
  //                           - Monitor blood sugar levels daily.
  //                           - Engage in moderate exercise for 30 minutes/day.
  //
  //                           ## Notes
  //                           - Follow up in 4 weeks with updated blood pressure and glucose readings.
  //
  //                           **Clinician's Name:** Dr. Emily Carter
  //                           **Contact:** (123) 456-7890
  //                           **Signature:** ______________________`,
  //     clinicianRemarks: ``
  //   },
  //   {
  //     patiendId: 2,
  //     patientName: "Jane Doe",
  //     age: 25,
  //     gender: "Male",
  //     issue: "Toothache",
  //     issueDetails:
  //       "I have a severe toothache since last night. My gums are swollen and I can't eat anything. My gums feel puffy and tender, especially around certain teeth. They look red and swollen, and sometimes they even bleed a little when I brush or floss. It feels sore, and chewing can be uncomfortable.",
  //     currentMedication: "Crocin 500mg, Budamate 200mg",
  //     appointment_date: "28-09-2025",
  //     appointment_time: "9:00 AM - 1:00 PM",
  //     hospital: "CityCare General Hospital",
  //     uid: "2",
  //     queuePosition: 3,
  //     clinicianPrescription: ``,
  //     clinicianRemarks: ``
  //   },
  //   {
  //     patiendId: 1,
  //     patientName: "John Doe",
  //     age: 25,
  //     gender: "Male",
  //     issue: "Toothache",
  //     issueDetails:
  //       "I have a severe toothache since last night. My gums are swollen and I can't eat anything. My gums feel puffy and tender, especially around certain teeth. They look red and swollen, and sometimes they even bleed a little when I brush or floss. It feels sore, and chewing can be uncomfortable.",
  //     currentMedication: "Crocin 500mg, Budamate 200mg",
  //     appointment_date: "28-09-2025",
  //     appointment_time: "11:00 AM - 3:00 PM",
  //     hospital: "CityCare General Hospital",
  //     uid: "3",
  //     queuePosition: 141,
  //     clinicianPrescription: `Crocin 500mg, Budamate 200mg`,
  //     clinicianRemarks: ``
  //   },
  // ];
}
export async function getPrescription(appointmentId) {
  try {
    const response = await fetch(
      `${API_URL}/api/prescriptions/${appointmentId}`,
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Failed to fetch prescription:", error);
    throw new Error("Failed to fetch prescription.");
  }
}

export async function sendOtp(patientId) {
  const response = await fetch(`${API_URL}/api/users/sendOtp/${patientId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  // console.log(data);
  return response;
}
export async function validateOtp(patientId, otp) {
  const response = await fetch(
    `${API_URL}/api/users/validateOtp/${patientId}?otp=${otp}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  // console.log(data);
  return data.info.check;
}
export async function postPrescription(prescriptionData) {
  // console.log("Prescription-data:", prescriptionData);
  const val = {
    appointmentId: prescriptionData.appointmentId,
    medicines: prescriptionData.clinicianPrescription, // Updated
    clinicianNotes: prescriptionData.clinicianRemarks, // Updated
  };
  const response = await fetch(`${API_URL}/api/prescriptions/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(val),
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  // console.log(data);
  return data;
}

export async function postFeedback(appointmentId, feedback, clinicianId) { // Renamed parameter
  // // console.log("in post Feedback")
  // // console.log("clinicianId: " , clinicianId)

  const response = await fetch(`${API_URL}/api/feedback/add/${appointmentId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ feedback: feedback, clinicianId: clinicianId }), // Updated
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  // console.log(data);
  return data;
}
export async function postAppointmentStatus({ appointmentId, status }) {
  const response = await fetch(
    `${API_URL}/api/appointments/updateStatus/${appointmentId}?status=${status}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({status}),
    },
  );
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  // console.log(data);
  return data;
}
export async function postBookAppointment(bookingData) {
  const formData = bookingData.formData;
  const patientId = bookingData.patientId;
  const response = await fetch(`${API_URL}/api/appointments/book/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      patientId: patientId, //logged in user's id will come here
      clinicianId: formData.selectedClinician.clinician_id, // Updated
      appointment_date: formData.selectedDate.split("-").reverse().join("-"),
      book_status: "completed",
      personal_details: JSON.stringify({
        name: formData.fullName,
        address: formData.address,
        age: formData.age,
        gender: formData.gender,
        health_issue: formData.healthIssue,
      }),
      chosen_slot: JSON.stringify({
        mode: formData.selectedClinician.mode, // Updated
        start_time: formData.selectedClinician.selectedSlot.start_time, // Updated
        end_time: formData.selectedClinician.selectedSlot.end_time, // Updated
      }),
    }),
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  // console.log(data);
}
export async function getClinicianType(healthIssue) { // Renamed
  // console.log("in side ml");
  // console.log(healthIssue);
  try {
    const response = await fetch(
      `https://hackofiesta-369j.onrender.com/predict/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: healthIssue,
        }),
      },
    );
    if (!response.ok) {
      // console.log(response.status);
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // console.log("clinician type: ", data);
    return data.predicted_specialist;
  } catch (error) {
    console.error("Failed to fetch clinician type:", error); // Updated
    throw new Error("Failed to fetch clinician type."); // Updated
  }
}

export async function logIn(loginData) {
  // console.log("Attempting log-in...");
  // console.log(loginData);
  const { email, password } = loginData;
  // console.log("email :", email);
  // console.log("pasword :", password);

  // try {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  // }

  if (error) {
    // Throw an error to tigger onError
    throw new Error(error.message || "Login failed");
  }
  return data;

  // return data;
}

export async function getUserRoleById(userId, accessToken) {
  const response = await fetch(`${API_URL}/api/users/getRole/${userId}`, {
    method: "GET", // Use POST method to send data
    headers: {
      Authorization: `Bearer ${accessToken}`, // Send the token as part of the header
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch role");
  }

  const data = await response.json();
  // console.log(data);
  return data;
}

export async function getCurrentActiveUser() {
  // console.log("Attempting log-in...");
  const { error, data } = await supabase.auth.getUser();
  // // console.log("in api", data);
  return data;
}

export async function signUpNewUser(userData) {
  try {
    const apiUrl = `${API_URL}/api/users/addUserIfNotExist`;
    //     console.log("Requesting:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Try to parse JSON response
    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      throw new Error(
        `Invalid JSON response from server. Status: ${response.status}`,
      );
    }

    if (!response.ok) {
      // Throw a detailed error message from the API response
      throw new Error(result.error || `HTTP error! Status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error("Error signing up user:", error);

    return {
      success: false,
      message: error.message || "Something went wrong. Please try again.",
    };
  }
  // =======
  //   const apiUrl = `${API_URL}/api/users/addUserIfNotExist`;
  //   // console.log(apiUrl);
  //   const response = await fetch(apiUrl, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(userData),
  //   });
  //   const result = await response.json();
  // >>>>>>> main
}

export async function getUserDetailsByID(userId, accessToken) {
  const response = await fetch(`${API_URL}/api/users/getUserById/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`, // Send the token as part of the header
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch user data");

  const data = await response.json();
  return data;
}

export async function updateUserDetailsById(
  userId,
  accessToken,
  editedProfile,
) {
  const response = await fetch(`${API_URL}/api/users/updateDetails/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include token
    },
    body: JSON.stringify(editedProfile),
  });
  const data = await response.json(); // Parse response JSON
  // // console.log("Updated User:", data);

  // // console.log("User updated successfully:", data);
  // fetchUserProfile();

  return data;
}

export async function updateUserProfilePicture(userId, accessToken, formData) {
  // console.log("in frontend3", formData);
  const response = await fetch(`${API_URL}/api/uploadProfiles/upload`, {
    method: "POST",
    headers: {
      // "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include token
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error uploading file");
  }

  const data = await response.json();
  return data;
}

export async function chatBot(message) {
  const response = await fetch(
    `https://hackofiesta-5fik.onrender.com/faq/?query="${message}"`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch chatbot response");
  }

  const data = await response.json();
  return data;
}

export async function getClinicianProfileDetails(userId, accessToken) { // Renamed
  // // console.log(accessToken);
  // console.log("in api:", userId);
  const response = await fetch(
    `${API_URL}/api/clinicianProfileRoutes/getClinicianDetailsById/${userId}`, // Updated route
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Include token
      },
    },
  );

  if (!response.ok) return Error("Failed to fetch user data");

  const data = await response.json();
  // console.log(data);
  return data;
}

export async function resetPassword(accessToken, new_password) {
  // // console.log(accessToken);
  // // console.log("in api:", userId);
  // console.log("4444444444444444444444", new_password);
  const response = await fetch(`${API_URL}/api/users/updatePassword`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // Include token
    },
    body: JSON.stringify({ new_password }),
  });

  if (!response.ok) return Error("Failed to fetch user data");

  const data = await response.json();
  // console.log(data);
  return data;
}
export async function getReceptionProfileDetails(userId, accessToken) {
  // // console.log(accessToken);
  // console.log("in api:", userId);
  const response = await fetch(
    `${API_URL}/api/receptionProfileRoutes/getReceptionDetailsById/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Include token
      },
    },
  );

  if (!response.ok) return Error("Failed to fetch user data");

  const data = await response.json();
  // console.log(data);
  return data;
}
