const express = require('express');
const router = express.Router();
const { upload, uploadFile, downloadFile, deleteFile, listFiles } = require('../controllers/fileController');
const verifyToken = require('../config/verifyToken');

// Middleware to verify authentication for all file routes
router.use(verifyToken);

// POST /api/files/upload - Upload files to Supabase Storage
router.post('/upload', upload.single('file'), uploadFile);

// GET /api/files/download/:key - Generate signed download URLs
router.get('/download/:key', downloadFile);

// DELETE /api/files/:key - Delete files (reception only)
router.delete('/:key', deleteFile);

// GET /api/files/patient/:patientId - List files for a patient
router.get('/patient/:patientId', listFiles);

module.exports = router;