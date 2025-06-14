import { supabase } from './supabaseClient.js';

// Use relative URL for development to enable Vite proxy
const API_URL = import.meta.env.DEV
  ? '/api'  // This will be proxied to localhost:3001 by Vite in development
  : import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }
  return {
    'Content-Type': 'application/json'
  };
}

// Authenticated fetch wrapper
async function authenticatedFetch(url, options = {}) {
  const headers = await getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
}

export async function getAddressFromCoords(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch address from coordinates.");
    }

    const data = await response.json();

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
  const response = await authenticatedFetch(
    `${API_URL}/clinicians/availableSlots2/${userId}?specialization=${specialization}&date=${date}&mode=${mode}`,
    {
      method: "GET",
    },
  );
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function getProfileDetails(userId) {
  const response = await authenticatedFetch(`${API_URL}/users/getUserById/${userId}`);
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function getClinicianDetails(clinicianId) {
  const response = await authenticatedFetch(
    `${API_URL}/clinicians/clinicianDetailsById/${clinicianId}`,
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
  const response = await authenticatedFetch(
    `${API_URL}/appointments/delete/${appointmentId}`,
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
    const response = await authenticatedFetch(
      `${API_URL}/appointments/upcomingAppointments/${patientId}?date=${today}`,
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const updatedData = await Promise.all(
      data.map(async (appointment) => {
        try {
          // ASSUMPTION: Backend will be updated to provide clinician_user_id (auth.users.id) on appointment objects
          // If appointment.clinician_id is the clinicians2.id (auto-generated),
          // and getClinicianDetails/getProfileDetails expect auth.users.id, we need clinician_user_id.
          if (!appointment.clinician_user_id) {
            // Fallback or error handling if clinician_user_id is not present
            // For now, try with appointment.clinician_id but expect it might be the wrong ID type
            const clinician = await getClinicianDetails(appointment.clinician_id);
            const clinicianProfileDetails = await getProfileDetails(appointment.clinician_id);
            return { ...appointment, clinicianDetails: clinician, clinicianProfileDetails: clinicianProfileDetails };
          }
          const clinician = await getClinicianDetails(appointment.clinician_user_id);
          const clinicianProfileDetails = await getProfileDetails(appointment.clinician_user_id);
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
    const response = await authenticatedFetch(
      `${API_URL}/appointments/completedAppointments/${patientId}`,
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
            // Fallback or error handling
            const clinician = await getClinicianDetails(appointment.clinician_id);
            const clinicianProfileDetails = await getProfileDetails(appointment.clinician_id);
            return { ...appointment, clinicianDetails: clinician, clinicianProfileDetails: clinicianProfileDetails };
          }
          const clinician = await getClinicianDetails(appointment.clinician_user_id);
          const clinicianProfileDetails = await getProfileDetails(appointment.clinician_user_id);
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
  const today = new Date().toISOString().split("T")[0]; // Formats as YYYY-MM-DD

  try {
    const response = await authenticatedFetch(
      `${API_URL}/appointments/clinicianUpcomingAppointments/${clinicianId}?date=${selectedDate}&endTime=${selectedSlot.end_time}&startTime=${selectedSlot.start_time}`, // Updated route
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
    const response = await authenticatedFetch(
      `${API_URL}/appointments/clinicianCompletedAppointments/${clinicianId}`, // Updated route
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
}

export async function getPrescription(appointmentId) {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/prescriptions/${appointmentId}`,
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
  const response = await authenticatedFetch(`${API_URL}/users/sendOtp/${patientId}`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return response;
}

export async function validateOtp(patientId, otp) {
  const response = await authenticatedFetch(
    `${API_URL}/users/validateOtp/${patientId}?otp=${otp}`,
    {
      method: "GET",
    },
  );
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data.info.check;
}

export async function postPrescription(prescriptionData) {
  const val = {
    appointmentId: prescriptionData.appointmentId,
    medicines: prescriptionData.clinicianPrescription, // Updated
    clinicianNotes: prescriptionData.clinicianRemarks, // Updated
  };
  const response = await authenticatedFetch(`${API_URL}/prescriptions/generate`, {
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
  return data;
}

export async function postFeedback(appointmentId, feedback, clinicianId) { // Renamed parameter

  const response = await authenticatedFetch(`${API_URL}/feedback/add/${appointmentId}`, {
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
  return data;
}

export async function postAppointmentStatus({ appointmentId, status }) {
  const response = await authenticatedFetch(
    `${API_URL}/appointments/updateStatus/${appointmentId}?status=${status}`,
    {
      method: "POST",
      // body: JSON.stringify({status}),
    },
  );
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

export async function postBookAppointment(bookingData) {
  const formData = bookingData.formData;
  const patientId = bookingData.patientId;
  const response = await authenticatedFetch(`${API_URL}/appointments/book/`, {
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
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        symptoms: formData.symptoms,
        medical_history: formData.medicalHistory || '',
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
  return data;
}

export async function getClinicianType(healthIssue) { // Renamed
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
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.predicted_specialist;
  } catch (error) {
    console.error("Failed to fetch clinician type:", error); // Updated
    throw new Error("Failed to fetch clinician type."); // Updated
  }
}

export async function getUserRoleById(userId) {
  const response = await authenticatedFetch(`${API_URL}/users/getRole/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch role");
  }

  const data = await response.json();
  return data;
}

export async function signUpNewUser(userData) {
  try {
    const apiUrl = `${API_URL}/users/addUserIfNotExist`;

    const response = await authenticatedFetch(apiUrl, {
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
}

export async function getUserDetailsByID(userId) {
  const response = await authenticatedFetch(`${API_URL}/users/getUserById/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  const data = await response.json();
  return data;
}

export async function updateUserDetailsById(
  userId,
  editedProfile,
) {
  const response = await authenticatedFetch(`${API_URL}/users/updateDetails/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(editedProfile),
  });
  const data = await response.json(); // Parse response JSON

  return data;
}

export async function updateUserProfilePicture(userId, formData) {
  const headers = await getAuthHeaders();
  delete headers['Content-Type']; // Let browser set Content-Type for FormData
  
  const response = await fetch(`${API_URL}/uploadProfiles/upload`, {
    method: "POST",
    headers: headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error uploading file");
  }

  const data = await response.json();
  return data;
}

export async function chatBot(message) {
  const response = await authenticatedFetch(`${API_URL}/chat/faq`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: message }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch chatbot response");
  }

  const data = await response.json();
  return data;
}

export async function getClinicianProfileDetails(userId) { // Renamed
  const response = await authenticatedFetch(
    `${API_URL}/clinicianProfileRoutes/getClinicianDetailsById/${userId}`, // Updated route
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) return Error("Failed to fetch user data");

  const data = await response.json();
  return data;
}

export async function resetPassword(token, new_password) {
  const response = await authenticatedFetch(`${API_URL}/users/updatePassword`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, new_password }),
  });

  if (!response.ok) return Error("Failed to fetch user data");

  const data = await response.json();
  return data;
}

export async function getReceptionProfileDetails(userId) {
  const response = await authenticatedFetch(
    `${API_URL}/receptionProfileRoutes/getReceptionDetailsById/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  const data = await response.json();
  return data;
}

// Chat API functions
export async function getChatMessages(appointmentId) {
  try {
    const response = await authenticatedFetch(`${API_URL}/chat/${appointmentId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
}

export async function sendChatMessage(messageData) {
  try {
    const response = await authenticatedFetch(`${API_URL}/chat/send`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

export async function getChatParticipants(appointmentId) {
  try {
    const response = await authenticatedFetch(`${API_URL}/chat/${appointmentId}/participants`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching chat participants:', error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const response = await authenticatedFetch(`${API_URL}/users/allusers`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch all users:", error);
    throw new Error("Failed to fetch all users.");
  }
}

// New slot generation API functions
export async function generateSlots(doctorId, date) {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/schedules/generate-slots/${doctorId}/${date}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to generate slots:", error);
    throw new Error("Failed to generate slots.");
  }
}

export async function getDoctors() {
  try {
    const response = await authenticatedFetch(
      `${API_URL}/schedules/doctors`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // Extract the doctors array from the response data structure
    return data.data || data || [];
  } catch (error) {
    console.error("Failed to fetch doctors:", error);
    throw new Error("Failed to fetch doctors.");
  }
}