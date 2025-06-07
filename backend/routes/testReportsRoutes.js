const axios = require("axios"); // For handling file downloads
const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const multer = require("multer");
const { jwtValidation, roleExtraction, requireClinician, requireRole, requireOwnership } = require("../middleware/auth");
const upload = multer();

// POST /api/test-reports/upload - Upload new test report
// Requires clinician or admin role
router.post("/upload", jwtValidation, roleExtraction, requireClinician, upload.single("file"), async (req, res) => {
    const { appointmentId, testDate } = req.body;
    const file = req.file; // File is extracted using multer
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    try {
      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from("testReports")
        .upload(`test-reports/${appointmentId}/${file.originalname}`, file.buffer, {
          contentType: file.mimetype,
        });
  
      if (error) {
        console.error("Error uploading file to Supabase storage:", error);
        return res.status(400).json({ error: error.message });
      }
      const { data: reportData, error: reportError } = await supabase
        .from("test_reports")
        .insert([
          {
            appointment_id: appointmentId,
            test_date: testDate,
            report_url: data.path,
          },
        ])
        .select("*")
        .single();
  
      if (reportError) {
        return res.status(400).json({ error: reportError.message });
      }
      res.status(201).json(reportData);
      console.log("Test report uploaded successfully");
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error while uploading file" });
    }
  });

// GET /api/test-reports/download/:reportId - Download test report
// Requires authentication and appropriate role access
router.get("/download/:reportId", jwtValidation, roleExtraction, requireRole(['client', 'clinician', 'admin']), async (req, res) => {
  const { reportId } = req.params;

  try {
    // Fetch the test report details from the database
    const { data, error } = await supabase
      .from("test_reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (error) {
    console
      return res.status(400).json({ error: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: "Test report not found" });
    }
    
    const {data:file , error:fileError} = await supabase.storage.from("testReports").download(data.report_url);
    if (fileError) {
      return res.status(400).json({ error: fileError.message });
    }
    const contentType = file.type || "application/octet-stream"; // Default to binary if type is missing
    // Set headers for file download
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${data.report_url.split("/").pop()}"`);

    return res.send(Buffer.from(await file.arrayBuffer())); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching file" });
}
}
);

module.exports = router;
