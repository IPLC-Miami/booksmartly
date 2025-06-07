const express = require('express');
const router = express.Router();
const { upload, uploadFile, downloadFile, deleteFile, listFiles } = require('../controllers/fileController');
const { jwtValidation, roleExtraction, requireRole, requireClinician, requireOwnership } = require('../middleware/auth');

// POST /api/files/upload - Upload files to Supabase Storage
// Requires clinician or admin role
router.post('/upload', jwtValidation, roleExtraction, requireClinician, upload.single('file'), uploadFile);

// GET /api/files/download/:key - Generate signed download URLs
// Requires authentication and appropriate role
router.get('/download/:key', jwtValidation, roleExtraction, requireRole(['client', 'clinician', 'admin']), downloadFile);

// DELETE /api/files/:key - Delete files (clinician/admin only)
router.delete('/:key', jwtValidation, roleExtraction, requireClinician, deleteFile);

// GET /api/files/patient/:patientId - List files for a patient
// Requires authentication and ownership validation
router.get('/patient/:patientId', jwtValidation, roleExtraction, requireRole(['client', 'clinician', 'admin']), requireOwnership('client'), listFiles);

module.exports = router;