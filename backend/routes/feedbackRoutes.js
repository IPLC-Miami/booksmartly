const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const { jwtValidation, roleExtraction, requireRole, requireOwnership } = require("../middleware/auth");

// POST /api/feedback/add/:id - Add feedback for an appointment
// Requires authentication and appointment ownership validation
router.post("/add/:id", jwtValidation, roleExtraction, requireRole(['client', 'clinician']), requireOwnership('appointment'), async (req, res) => {
  const { id } = req.params;
  console.log("body: ", req.body);
  const { feedback, clinicianId } = req.body; // Renamed doctorId to clinicianId
  let classifiedTags = null; // Renamed tag to classifiedTags, expecting it might be an array or object
  try {
    const response = await fetch(
      "https://hackofiesta-1-f4m2.onrender.com/classify/", // This external API might need review/replacement
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      }
    );
    if (!response.ok) {
      throw new Error("Error in classifying feedback");
    }
    const classificationData = await response.json();
    classifiedTags = classificationData.tag; // Assuming 'tag' is the key for tags
  } catch (error) {
    console.log("Error classifying feedback:", error);
    // Decide if this error is critical or if we can proceed without tags
    // For now, let's proceed and tags will be null if classification fails
  }

  // Update clinician's aggregated tags if classification was successful and clinicianId is provided
  if (classifiedTags && clinicianId) {
    const { data: currentClinicianTags, error: currentClinicianTagsError } = await supabase
      .from("clinicians2") // Changed doctors2 to clinicians2
      .select("tags")
      .eq("id", clinicianId) // Changed doctorId to clinicianId
      .single();

    if (currentClinicianTagsError) {
      // Log error but don't necessarily block feedback submission
      console.error("Error fetching current clinician tags:", currentClinicianTagsError.message);
    } else {
      console.log("Current clinician tags: ", currentClinicianTags);
      let tagMap = currentClinicianTags?.tags || {};
      // Assuming classifiedTags is a single tag string, adjust if it's an array
      if (typeof classifiedTags === 'string') {
        tagMap[classifiedTags] = (tagMap[classifiedTags] || 0) + 1;
      } else if (Array.isArray(classifiedTags)) {
        classifiedTags.forEach(t => {
          tagMap[t] = (tagMap[t] || 0) + 1;
        });
      }
      // else, classifiedTags might be an object, handle as needed or ignore if format is unexpected

      const { error: updateClinicianError } = await supabase
        .from("clinicians2") // Changed doctors2 to clinicians2
        .update({ tags: tagMap })
        .eq("id", clinicianId) // Changed doctorId to clinicianId
        .select("*")
        .single();

      if (updateClinicianError) {
        // Log error but don't necessarily block feedback submission
        console.error("Error updating clinician tags:", updateClinicianError.message);
      }
    }
  }

  // Insert the feedback
  const { data, error } = await supabase
    .from("feedback")
    .insert([
      {
        appointment_id: id,
        message: feedback,
        clinician_id: clinicianId, // Added clinician_id
        tags: classifiedTags,     // Added tags from classification
        // user_id will be set by RLS policy based on auth.uid()
      },
    ])
    .select("*")
    .single();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  console.log("Feedback added successfully");
  return res.status(201).json(data);
});
module.exports = router;

