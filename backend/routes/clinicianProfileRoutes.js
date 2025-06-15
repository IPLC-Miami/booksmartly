const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const { jwtValidation, roleExtraction, requireClinician, requireOwnership } = require('../middleware/auth');
const { getCache, setCache } = require("../config/redisClient");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
router.get("/getClinicianDetailsByAuthUserId/:authUserId", jwtValidation, roleExtraction, requireClinician, requireOwnership('user'), async (req, res) => {
  try {
    console.time("API Call Time");
    const { authUserId } = req.params;
    if (!authUserId) {
      return res.status(400).json({ error: "Auth User ID is required" });
    }

    console.log("Fetching details for authUserId:", authUserId);

    const cacheKey = `clinicianProfileDetails:${authUserId}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      console.log("Returning cached data for authUserId:", authUserId);
      console.timeEnd("API Call Time");
      return res.json(parsedData);
    }

    // Fetch clinician-specific details from clinicians2 table using user_id
    const { data: clinicianRecord, error: clinicianError } = await supabase
      .from("clinicians2")
      .select("*")
      .eq("user_id", authUserId) // Query by user_id
      .single();

    if (clinicianError) {
      console.error("Supabase error fetching clinician record:", clinicianError.message);
      // If clinician record not found for the user_id, it might not be an error if user is not a clinician
      // However, this route implies we expect a clinician.
      return res
        .status(404) // Not found might be more appropriate if no clinician record for this user
        .json({ error: "Clinician record fetch failed", details: clinicianError.message });
    }

    // Fetch general user profile details from auth.users table
    const { data: userProfile, error: userProfileError } = await supabase
      .from("auth.users")
      .select("email, raw_user_meta_data")
      .eq("id", authUserId) // auth.users.id
      .single();

    if (userProfileError) {
      console.error("Supabase error fetching user profile:", userProfileError.message);
      return res
        .status(500)
        .json({ error: "User profile fetch failed", details: userProfileError.message });
    }
    
    const responseData = { clinicianRecord, userProfile }; // Combine data
    
    console.timeEnd("API Call Time");
    setCache(
      cacheKey,
      JSON.stringify(responseData),
      259200000 // 3 days in ms
    );
    return res.json(responseData);
  } catch (error) {
    console.error("Server error in /getClinicianDetailsByAuthUserId:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/download/:clinicianTableId", jwtValidation, roleExtraction, requireClinician, requireOwnership('clinician'), async (req, res) => {
  try {
    const { clinicianTableId } = req.params; // This is the auto-generated ID from clinicians2 table
    const date = new Date().toISOString().split("T")[0];

    // First, get the clinician's user_id from clinicians2 to fetch their name from profiles
    const { data: clinicianInfo, error: clinicianInfoError } = await supabase
      .from("clinicians2")
      .select("user_id, specialization") // Also get specialization directly if needed, or rely on join below
      .eq("id", clinicianTableId)
      .single();

    if (clinicianInfoError) {
      console.error("Error fetching clinician info:", clinicianInfoError.message);
      return res.status(404).json({ error: "Clinician not found." });
    }
    const clinicianAuthUserId = clinicianInfo.user_id;

    const { data: clinicianProfile, error: clinicianProfileError } = await supabase
      .from("auth.users")
      .select("email, raw_user_meta_data") // Get user data from auth.users
      .eq("id", clinicianAuthUserId)
      .single();

    if (clinicianProfileError) {
      console.error("Error fetching clinician profile name:", clinicianProfileError.message);
      // Continue without name or return error, for now, let's try to continue
    }
    const clinicianDisplayName = clinicianProfile?.raw_user_meta_data?.name || clinicianProfile?.raw_user_meta_data?.full_name || clinicianProfile?.email || "N/A";


    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments2")
      .select(
        `
          id,
          status,
          appointment_date,
          personal_details,
          clinicians2 (specialization)
        ` // Join with clinicians2
      )
      .eq("clinician_id", clinicianTableId) // This uses clinicians2.id
      .eq("appointment_date", date)
      .eq("book_status", "completed")
      .eq("chosen_slot->>mode", "offline");

    const { data: appointments2, error: appointments2Error } = await supabase
      .from("appointments2")
      .select(
        `
          id,
          status,
          appointment_date,
          personal_details,
          clinicians2 (specialization)
        ` // Join with clinicians2
      )
      .eq("clinician_id", clinicianTableId) // This uses clinicians2.id
      .eq("appointment_date", date)
      .eq("book_status", "completed")
      .eq("chosen_slot->>mode", "online");

    if (appointmentsError || appointments2Error) {
      console.error("Error fetching appointments:", appointmentsError?.message, appointments2Error?.message);
      return res.status(400).json({ error: "Failed to fetch appointments." });
    }
    
    if ((appointments?.length || 0) === 0 && (appointments2?.length || 0) === 0) {
      return res
        .status(404)
        .json({ error: "No appointments found for today." });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`OfflAppts - ${date}`);
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Patient Name", key: "name", width: 20 },
      { header: "Patient Address", key: "address", width: 20 },
      { header: "Patient Gender", key: "gender", width: 20 },
      { header: "Patient Age", key: "age", width: 20 },
      { header: "Status", key: "status", width: 20 },
      { header: "Clinician", key: "clinician_name", width: 20 },
      { header: "Clinician Specialization", key: "specialization", width: 20 },
    ];
    const formattedData = (appointments || []).map((appointment) => ({
      id: appointment.id,
      name: appointment.personal_details?.name || "N/A",
      address: appointment.personal_details?.address || "N/A",
      gender: appointment.personal_details?.gender || "N/A",
      age: appointment.personal_details?.age || "N/A",
      status: appointment.status || "N/A",
      clinician_name: clinicianDisplayName,
      specialization: appointment.clinicians2?.specialization || clinicianInfo.specialization || "N/A",
    }));

    worksheet.addRows(formattedData);
    const worksheet2 = workbook.addWorksheet(`OnlAppts - ${date}`);
    worksheet2.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Patient Name", key: "name", width: 20 },
      { header: "Patient Address", key: "address", width: 20 },
      { header: "Patient Gender", key: "gender", width: 20 },
      { header: "Patient Age", key: "age", width: 20 },
      { header: "Status", key: "status", width: 20 },
      { header: "Clinician", key: "clinician_name", width: 20 },
      { header: "Clinician Specialization", key: "specialization", width: 20 },
    ];

    const formattedData2 = (appointments2 || []).map((appointment) => ({
      id: appointment.id,
      name: appointment.personal_details?.name || "N/A",
      address: appointment.personal_details?.address || "N/A",
      gender: appointment.personal_details?.gender || "N/A",
      age: appointment.personal_details?.age || "N/A",
      status: appointment.status || "N/A",
      clinician_name: clinicianDisplayName,
      specialization: appointment.clinicians2?.specialization || clinicianInfo.specialization || "N/A",
    }));

    worksheet2.addRows(formattedData2);

    const fileName = `appointments-${date}.xlsx`;
    const filePath = path.join(process.cwd(), fileName); // Use process.cwd() for reliability

    await workbook.xlsx.writeFile(filePath);

    // Send file for download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error downloading file.");
      }

      // Optional: Delete file after download
      setTimeout(() => fs.unlinkSync(filePath), 5000);
    });
  } catch (error) {
    console.error("Error exporting appointments:", error);
    res.status(500).json({ error: error });
  }
});

module.exports = router;
