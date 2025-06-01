const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const supabase = require("../config/supabaseClient");

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else
    cb(new Error("Invalid file type. Only JPG, PNG, and PDF allowed."), false);
};

const upload = multer({ storage, fileFilter });

router.post(
  "/healthCampRegistration",
  upload.fields([
    { name: "campImages", maxCount: 1 },
    { name: "policePermission", maxCount: 1 },
    { name: "localAuthPermission", maxCount: 1 },
    { name: "otherDocuments", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // 1) Extract text fields
      const campData = { ...req.body };

      // 2) Process file uploads
      const fileFields = [
        "campImages",
        "policePermission",
        "localAuthPermission",
        "otherDocuments",
      ];
      for (const field of fileFields) {
        if (req.files[field]?.length) {
          const file = req.files[field][0];
          const buffer = fs.readFileSync(file.path);
          const uniqueName = `${uuidv4()}-${file.filename}`;

          // upload
          const { error: upErr } = await supabase.storage
            .from("camps")
            .upload(`camps/${uniqueName}`, buffer, {
              cacheControl: "3600",
              upsert: false,
              contentType: file.mimetype,
            });
          if (upErr) throw upErr;

          // get URL
          const { data: urlData, error: urlErr } = await supabase.storage
            .from("camps")
            .getPublicUrl(`camps/${uniqueName}`);
          if (urlErr) throw urlErr;

          campData[field] = urlData.publicUrl;
          fs.unlinkSync(file.path);
        }
      }

      // 3) Parse JSON array fields
      if (
        campData.medicalServices &&
        typeof campData.medicalServices === "string"
      ) {
        campData.medicalServices = JSON.parse(campData.medicalServices);
      }

      // 4) SANITIZE numeric fields
      Object.keys(campData).forEach((key) => {
        const val = campData[key];
        if (val === "") {
          campData[key] = null;
        } else if (typeof val === "string" && !isNaN(val)) {
          campData[key] = Number(val);
        }
      });

      // 5) DEBUG: warn on any remaining non-number in float columns
      const floatCols = [
        "latitude",
        "longitude",
        "temperature",
        "height",
        "weight",
      ];
      floatCols.forEach((col) => {
        if (campData[col] != null && typeof campData[col] !== "number") {
          console.warn(`Field ${col} is not a number:`, campData[col]);
        }
      });

      // 6) Insert into Supabase
      const { data, error } = await supabase.from("camps").insert([campData]);
      if (error) throw error;

      res.status(201).json({
        message: "Camp data received and stored successfully",
        data,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

router.post("/healthcheckups", async (req, res) => {
  console.log("recieve jhealth checkup data", req.body);
  try {
    // Get data from client request
    const formData = req.body;

    // Insert into Supabase table
    const { data, error } = await supabase
      .from("healthcheckups")
      .insert([formData]);

    if (error) throw error;

    res
      .status(201)
      .json({ message: "Health checkup recorded successfully", data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/healthcamps", async (req, res) => {
  try {
    // Query the camps table
    const { data, error } = await supabase.from("camps").select("*");

    if (error) {
      console.error("Error fetching camps from Supabase:", error);
      return res.status(500).json({ error: "Failed to fetch health camps" });
    }

    // Return the data
    return res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Optional: Add a route to fetch a specific camp by ID
router.get("/healthcamps/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("camps")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching camp from Supabase:", error);
      return res.status(500).json({ error: "Failed to fetch health camp" });
    }

    if (!data) {
      return res.status(404).json({ error: "Health camp not found" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/clinician-volunteer", async (req, res) => { // Renamed route
  try {
    const { clinicianId, campId, camp_start_date, camp_end_date } = req.body; // Renamed doctorId

    // Check for overlapping camp dates for the same clinician.
    // This query looks for any camp where:
    //   - existing camp_start_date is on or before the new camp_end_date AND
    //   - existing camp_end_date is on or after the new camp_start_date.
    const { data: overlappingCamps, error: checkError } = await supabase
      .from("campsxclinicians") // Renamed table
      .select("*")
      .eq("clinician_id", clinicianId) // Renamed column
      .or(
        `camp_start_date.lte.${camp_end_date},camp_end_date.gte.${camp_start_date}`
      );

    if (checkError) {
      throw checkError;
    }

    if (overlappingCamps && overlappingCamps.length > 0) {
      return res.status(400).json({
        error: "Camp dates conflict with an existing record for this clinician.", // Updated message
      });
    }

    // If no overlapping camps, proceed with the insert.
    const { data, error } = await supabase.from("campsxclinicians").insert( // Renamed table
      [
        {
          clinician_id: clinicianId, // Renamed column
          camp_id: campId,
          camp_start_date: camp_start_date,
          camp_end_date: camp_end_date,
        },
      ],
      { ignoreDuplicates: true }
    );

    if (error) {
      throw error;
    }

    res.status(200).json({
      message: "Record inserted or already exists",
      data,
    });
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({
      error: error.message,
    });
  }
});
router.get("/clinician/volunteered/:clinicianId", async (req, res) => { // Renamed route and param
  const { clinicianId } = req.params; // Renamed doctorId

  try {
    const { data, error } = await supabase
      .from("campsxclinicians") // Renamed table
      .select("camp_id")
      .eq("clinician_id", clinicianId); // Renamed column

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Extract just the list of camp_ids
    const campIds = data.map((item) => item.camp_id);

    res.status(200).json(campIds);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

