const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const {
  jwtValidation,
  roleExtraction,
  requireRole,
  requireClinician,
  requireAdmin,
  requireOwnership
} = require("../middleware/auth");

// GET /api/clinicians - Get all clinicians (Admin only)
router.get("/", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("clinicians2")
      .select(`
        *,
        profile:profiles!user_id (
          id,
          name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching clinicians:", error);
      return res.status(400).json({ error: error.message });
    }
    
    // Transform data to match frontend expectations
    const transformedData = data.map(clinician => ({
      id: clinician.id,
      user_id: clinician.user_id,
      name: clinician.profile?.name || 'Unknown',
      email: clinician.profile?.email || '',
      phone: clinician.profile?.phone || clinician.phone || '',
      specialty: clinician.specialization || '',
      experience_years: clinician.experience_years || 0,
      hospital_name: clinician.hospital_name || '',
      available_from: clinician.available_from,
      available_to: clinician.available_to,
      created_at: clinician.created_at,
      updated_at: clinician.updated_at
    }));
    
    res.status(200).json(transformedData);
  } catch (err) {
    console.error("Unexpected error in GET /clinicians:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  const {
    userId,
    specialization,
    experience,
    hospital,
    available_from,
    available_to,
  } = req.body;
  const { data, error } = await supabase
    .from("clinicians2") // Changed to clinicians2
    .insert([
      {
        user_id: userId, // This is the auth.users.id
        specialization: specialization,
        experience_years: experience,
        hospital_name: hospital,
        available_from: available_from,
        available_to: available_to,
        // Add other fields from clinicians2 DDL if they are expected from req.body
        // e.g., license_number, bio, office_address, etc.
      },
    ])
    .select() // Select all by default, or specify columns
    .single();

  if (error) {
    console.error("Error inserting clinician:", error);
    return res.status(400).json({ error: error.message });
  }
  // data from insert is an array, .single() might not be appropriate if select() returns multiple,
  // but for a single insert, it should return the inserted row in an array.
  res.status(201).json(data); // Return the inserted record (data is already the object if .single() is used after select())
  console.log("Clinician added successfully"); // Updated log message
});

router.put("/:Id", jwtValidation, roleExtraction, requireClinician, requireOwnership('clinician'), async (req, res) => {
  const Id = req.params.Id;
  const { specialization, experience, hospital, available_from, available_to } =
    req.body;
  const { data, error } = await supabase
    .from("clinicians2") // Changed to clinicians2
    .update({
      specialization: specialization,
      experience_years: experience,
      hospital_name: hospital,
      available_from: available_from,
      available_to: available_to,
      // Add other updatable fields from clinicians2 DDL if needed
    })
    .eq("id", Id) // This Id should be the auto-generated clinicians2.id
    .select()
    .single();

  if (error) {
    console.error("Error updating clinician:", error);
    return res.status(400).json({ error: error.message });
  }
  res.status(200).json(data); // Return the updated record
  console.log("Clinician updated successfully"); // Updated log message
});

router.get("/availableSlots2/:userId", jwtValidation, roleExtraction, requireRole(['client', 'clinician', 'admin']), async (req, res) => {
  const userId = req.params.userId;
  console.log("userId: ", userId);
  const { specialization, date, mode, sort } = req.query; // mode: 'online' or 'offline', sort: 'earliest' or 'most_available'
  console.log(specialization, date, mode, sort);
  // Assuming userId here is the client's auth.users.id, which should match appointments2.client_id
  const {data , error:DeletePendingAppointmentsError} = await supabase.from('appointments2').delete().eq('client_id' , userId).eq('book_status', 'pending');
  if(DeletePendingAppointmentsError){
    return res.status(400).json({error: DeletePendingAppointmentsError.message});
  }
   const weekday = (new Date(date).toLocaleString("en-US", { weekday: "long" })).charAt(0).toUpperCase() + (new Date(date).toLocaleString("en-US", { weekday: "long" })).slice(1);
   console.log(weekday);
  const {data:availableSlots , error:availableSlotsError} = await supabase.rpc("get_available_slots_by_earliest2", { // Assuming RPC function might need update or be generic
    p_specialization: specialization,
    p_date: date,
    p_mode: mode,
    p_weekday: weekday,});
  if(availableSlotsError){
    return res.status(400).json({error: availableSlotsError.message});
  }
  console.log(availableSlots);
  return res.status(200).json(availableSlots);
});
router.get("/clinicianDetailsById/:Id", jwtValidation, roleExtraction, requireRole(['client', 'clinician', 'admin']), async (req, res) => { // Renamed route
  const { Id } = req.params;
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!uuidRegex.test(Id)) {
    return res.status(400).json({ error: "Invalid UUID format" });
  }

  console.log("Fetching clinician with ID:", Id); // Updated log message
  const {data: profiledata , error: profileerror} = await supabase.from("profiles").select("*").eq("id", Id).single();
  if (profileerror) {
    console.error("Supabase error:", profileerror);
    return res.status(400).json({ error: profileerror.message });
  }
  console.log("profiledata:");
  console.log(profiledata);
  const { data, error } = await supabase
    .from("clinicians2") // Assuming table name will be updated (e.g., clinicians or clinicians2)
    .select("*")
    // Assuming Id is auth.users.id, so query by user_id in clinicians2
    .eq("user_id", Id)
    .single();
  if(error){
    console.log("Error fetching from clinicians2:", error);
    return res.status(400).json({error: error.message});
  }

  // Ensure data is not null before trying to access data.reception_id
  if (!data) {
    return res.status(404).json({ error: "Clinician details not found in clinicians2." });
  }

  const {data: hospitalData , error: hospitalDataError} = await supabase .from("reception").select("*").eq("id" , data.reception_id).single();
  
  if (hospitalDataError) {
    console.error("Supabase error:", hospitalDataError);
    return res.status(400).json({ error: hospitalDataError.message });
  }
  console.log("hospitalData:");
  console.log(hospitalData);
  data.name=profiledata.name;
  data.hospitalData = hospitalData;
  console.log(data);
  res.json(data);
});

module.exports = router;
