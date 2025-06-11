const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const {
  jwtValidation,
  roleExtraction,
  requireRole,
  requireAdmin
} = require('../middleware/auth');

// Helper function to get schedules with clinician info
async function getSchedulesWithClinicianInfo() {
  try {
    const { data, error } = await supabase
      .from("schedules")
      .select(`
        *,
        clinician:clinicians2!clinician_id (
          user_id,
          name,
          phone,
          specialty
        )
      `)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Helper function to get doctor slots with clinician info
async function getDoctorSlotsWithInfo(filters = {}) {
  try {
    let query = supabase
      .from("doctor_slots")
      .select(`
        *,
        clinician:clinicians2!clinician_id (
          user_id,
          name,
          phone,
          specialty
        ),
        schedule:schedules!schedule_id (
          day_of_week,
          start_time,
          end_time
        ),
        appointment:appointments!appointment_id (
          id,
          status
        )
      `)
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Apply filters
    if (filters.clinician_id) {
      query = query.eq('clinician_id', filters.clinician_id);
    }
    if (filters.slot_date) {
      query = query.eq('slot_date', filters.slot_date);
    }
    if (filters.is_available !== undefined) {
      query = query.eq('is_available', filters.is_available);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// =============================================================================
// SCHEDULE ROUTES
// =============================================================================

// GET /api/schedules - Get all schedules (Admin only)
router.get("/", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await getSchedulesWithClinicianInfo();
    
    if (error) {
      console.error("Error fetching schedules:", error);
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error in GET /schedules:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/schedules/:id - Get specific schedule (Admin only)
router.get("/:id", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from("schedules")
      .select(`
        *,
        clinician:clinicians2!clinician_id (
          user_id,
          name,
          phone,
          specialty
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Schedule not found" });
      }
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error in GET /schedules/:id:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/schedules - Create new schedule (Admin only)
router.post("/", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  const { clinician_id, day_of_week, start_time, end_time, is_active = true } = req.body;
  
  // Validation
  if (!clinician_id || day_of_week === undefined || !start_time || !end_time) {
    return res.status(400).json({ 
      error: "Missing required fields: clinician_id, day_of_week, start_time, end_time" 
    });
  }
  
  if (day_of_week < 0 || day_of_week > 6) {
    return res.status(400).json({ 
      error: "day_of_week must be between 0 (Sunday) and 6 (Saturday)" 
    });
  }
  
  try {
    const { data, error } = await supabase
      .from("schedules")
      .insert([{
        clinician_id,
        day_of_week,
        start_time,
        end_time,
        is_active
      }])
      .select(`
        *,
        clinician:clinicians2!clinician_id (
          user_id,
          name,
          phone,
          specialty
        )
      `)
      .single();
    
    if (error) {
      console.error("Error creating schedule:", error);
      return res.status(400).json({ error: error.message });
    }
    
    res.status(201).json(data);
  } catch (err) {
    console.error("Unexpected error in POST /schedules:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /api/schedules/:id - Update schedule (Admin only)
router.put("/:id", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { clinician_id, day_of_week, start_time, end_time, is_active } = req.body;
  
  // Build update object with only provided fields
  const updateData = {};
  if (clinician_id !== undefined) updateData.clinician_id = clinician_id;
  if (day_of_week !== undefined) {
    if (day_of_week < 0 || day_of_week > 6) {
      return res.status(400).json({ 
        error: "day_of_week must be between 0 (Sunday) and 6 (Saturday)" 
      });
    }
    updateData.day_of_week = day_of_week;
  }
  if (start_time !== undefined) updateData.start_time = start_time;
  if (end_time !== undefined) updateData.end_time = end_time;
  if (is_active !== undefined) updateData.is_active = is_active;
  
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }
  
  try {
    const { data, error } = await supabase
      .from("schedules")
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        clinician:clinicians2!clinician_id (
          user_id,
          name,
          phone,
          specialty
        )
      `)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Schedule not found" });
      }
      console.error("Error updating schedule:", error);
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error in PUT /schedules/:id:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/schedules/:id - Delete schedule (Admin only)
router.delete("/:id", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from("schedules")
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Schedule not found" });
      }
      console.error("Error deleting schedule:", error);
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json({ message: "Schedule deleted successfully", data });
  } catch (err) {
    console.error("Unexpected error in DELETE /schedules/:id:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// =============================================================================
// DOCTOR SLOTS ROUTES
// =============================================================================

// GET /api/schedules/slots - Get all doctor slots (Admin only)
router.get("/slots", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  try {
    const filters = {};
    if (req.query.clinician_id) filters.clinician_id = req.query.clinician_id;
    if (req.query.slot_date) filters.slot_date = req.query.slot_date;
    if (req.query.is_available !== undefined) filters.is_available = req.query.is_available === 'true';
    
    const { data, error } = await getDoctorSlotsWithInfo(filters);
    
    if (error) {
      console.error("Error fetching doctor slots:", error);
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error in GET /schedules/slots:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/schedules/slots/:id - Get specific doctor slot (Admin only)
router.get("/slots/:id", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from("doctor_slots")
      .select(`
        *,
        clinician:clinicians2!clinician_id (
          user_id,
          name,
          phone,
          specialty
        ),
        schedule:schedules!schedule_id (
          day_of_week,
          start_time,
          end_time
        ),
        appointment:appointments!appointment_id (
          id,
          status
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Doctor slot not found" });
      }
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error in GET /schedules/slots/:id:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/schedules/slots - Create new doctor slot (Admin only)
router.post("/slots", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  const { 
    clinician_id, 
    schedule_id, 
    slot_date, 
    start_time, 
    end_time, 
    is_available = true 
  } = req.body;
  
  // Validation
  if (!clinician_id || !slot_date || !start_time || !end_time) {
    return res.status(400).json({ 
      error: "Missing required fields: clinician_id, slot_date, start_time, end_time" 
    });
  }
  
  try {
    const { data, error } = await supabase
      .from("doctor_slots")
      .insert([{
        clinician_id,
        schedule_id,
        slot_date,
        start_time,
        end_time,
        is_available
      }])
      .select(`
        *,
        clinician:clinicians2!clinician_id (
          user_id,
          name,
          phone,
          specialty
        ),
        schedule:schedules!schedule_id (
          day_of_week,
          start_time,
          end_time
        )
      `)
      .single();
    
    if (error) {
      console.error("Error creating doctor slot:", error);
      return res.status(400).json({ error: error.message });
    }
    
    res.status(201).json(data);
  } catch (err) {
    console.error("Unexpected error in POST /schedules/slots:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /api/schedules/slots/:id - Update doctor slot (Admin only)
router.put("/slots/:id", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { 
    clinician_id, 
    schedule_id, 
    slot_date, 
    start_time, 
    end_time, 
    is_available,
    appointment_id 
  } = req.body;
  
  // Build update object with only provided fields
  const updateData = {};
  if (clinician_id !== undefined) updateData.clinician_id = clinician_id;
  if (schedule_id !== undefined) updateData.schedule_id = schedule_id;
  if (slot_date !== undefined) updateData.slot_date = slot_date;
  if (start_time !== undefined) updateData.start_time = start_time;
  if (end_time !== undefined) updateData.end_time = end_time;
  if (is_available !== undefined) updateData.is_available = is_available;
  if (appointment_id !== undefined) updateData.appointment_id = appointment_id;
  
  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }
  
  try {
    const { data, error } = await supabase
      .from("doctor_slots")
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        clinician:clinicians2!clinician_id (
          user_id,
          name,
          phone,
          specialty
        ),
        schedule:schedules!schedule_id (
          day_of_week,
          start_time,
          end_time
        ),
        appointment:appointments!appointment_id (
          id,
          status
        )
      `)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Doctor slot not found" });
      }
      console.error("Error updating doctor slot:", error);
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error in PUT /schedules/slots/:id:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/schedules/slots/:id - Delete doctor slot (Admin only)
router.delete("/slots/:id", jwtValidation, roleExtraction, requireAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from("doctor_slots")
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Doctor slot not found" });
      }
      console.error("Error deleting doctor slot:", error);
      return res.status(400).json({ error: error.message });
    }
    
    res.status(200).json({ message: "Doctor slot deleted successfully", data });
  } catch (err) {
    console.error("Unexpected error in DELETE /schedules/slots/:id:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;