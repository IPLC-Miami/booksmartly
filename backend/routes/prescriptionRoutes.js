const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { jwtValidation, roleExtraction, requireRole, requireClinician, requireOwnership } = require('../middleware/auth');
router.post('/generate', jwtValidation, roleExtraction, requireClinician, async (req, res) => {
  const { appointmentId, medicines, clinicianNotes } = req.body;
  const {data , error} = await supabase.from('prescriptions').insert([
    {
      appointment_id: appointmentId,
      medicines: medicines,
      clinician_notes: clinicianNotes
    }
  ]).select('*').single();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  console.log('Prescription generated successfully');
  return res.status(201).json(data);
});
router.get('/:appointmentId', jwtValidation, roleExtraction, requireRole(['client', 'clinician']), requireOwnership('appointment'), async (req, res) => {
  const { appointmentId } = req.params;

  try {
    const prescription = await supabase.from('prescriptions').select('*').eq('appointment_id', appointmentId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }
    return res.json(prescription);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

