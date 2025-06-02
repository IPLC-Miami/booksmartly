const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authenticateToken, requireAnyRole } = require('../middleware/auth');

// Get chat messages for a specific appointment
router.get('/:appointmentId', authenticateToken, requireAnyRole, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.userRole;

    // Verify user has access to this appointment
    let hasAccess = false;

    if (userRole === 'reception') {
      // Reception can view all appointments
      hasAccess = true;
    } else if (userRole === 'clinician') {
      // Check if clinician is assigned to this appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('clinician_id')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Get clinician record to match user_id
      const { data: clinician, error: clinicianError } = await supabase
        .from('clinicians2')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (clinicianError || !clinician) {
        return res.status(403).json({ error: 'Clinician profile not found' });
      }

      hasAccess = appointment.clinician_id === clinician.id;
    } else if (userRole === 'client') {
      // Check if client is the patient for this appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Get client record to match user_id
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (clientError || !client) {
        return res.status(403).json({ error: 'Client profile not found' });
      }

      hasAccess = appointment.patient_id === client.id;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this appointment' });
    }

    // Fetch messages for the appointment
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        appointment_id,
        sender_id,
        message,
        created_at,
        sender:sender_id (
          id,
          email,
          user_metadata
        )
      `)
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Format messages with sender information
    const formattedMessages = messages.map(message => ({
      id: message.id,
      appointment_id: message.appointment_id,
      sender_id: message.sender_id,
      message: message.message,
      created_at: message.created_at,
      sender_name: message.sender?.user_metadata?.full_name || 
                   message.sender?.user_metadata?.name || 
                   message.sender?.email || 
                   'Unknown User'
    }));

    res.json({
      success: true,
      data: formattedMessages
    });

  } catch (error) {
    console.error('Error in get chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a new chat message
router.post('/send', authenticateToken, requireAnyRole, async (req, res) => {
  try {
    const { appointmentId, message } = req.body;
    const userId = req.user.id;
    const userRole = req.userRole;

    // Validate input
    if (!appointmentId || !message || !message.trim()) {
      return res.status(400).json({ error: 'Appointment ID and message are required' });
    }

    // Verify user has access to this appointment (same logic as GET)
    let hasAccess = false;

    if (userRole === 'reception') {
      // Reception can view but typically shouldn't send messages
      // You might want to restrict this based on business rules
      hasAccess = true;
    } else if (userRole === 'clinician') {
      // Check if clinician is assigned to this appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('clinician_id')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Get clinician record to match user_id
      const { data: clinician, error: clinicianError } = await supabase
        .from('clinicians2')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (clinicianError || !clinician) {
        return res.status(403).json({ error: 'Clinician profile not found' });
      }

      hasAccess = appointment.clinician_id === clinician.id;
    } else if (userRole === 'client') {
      // Check if client is the patient for this appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      // Get client record to match user_id
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (clientError || !client) {
        return res.status(403).json({ error: 'Client profile not found' });
      }

      hasAccess = appointment.patient_id === client.id;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this appointment' });
    }

    // Insert the new message
    const { data: newMessage, error: insertError } = await supabase
      .from('messages')
      .insert({
        appointment_id: appointmentId,
        sender_id: userId,
        message: message.trim()
      })
      .select(`
        id,
        appointment_id,
        sender_id,
        message,
        created_at,
        sender:sender_id (
          id,
          email,
          user_metadata
        )
      `)
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    // Format the response
    const formattedMessage = {
      id: newMessage.id,
      appointment_id: newMessage.appointment_id,
      sender_id: newMessage.sender_id,
      message: newMessage.message,
      created_at: newMessage.created_at,
      sender_name: newMessage.sender?.user_metadata?.full_name || 
                   newMessage.sender?.user_metadata?.name || 
                   newMessage.sender?.email || 
                   'Unknown User'
    };

    res.status(201).json({
      success: true,
      data: formattedMessage
    });

  } catch (error) {
    console.error('Error in send message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointment participants (for chat UI)
router.get('/:appointmentId/participants', authenticateToken, requireAnyRole, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.userRole;

    // Verify user has access to this appointment (same logic as above)
    let hasAccess = false;

    if (userRole === 'reception') {
      hasAccess = true;
    } else if (userRole === 'clinician') {
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('clinician_id')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      const { data: clinician, error: clinicianError } = await supabase
        .from('clinicians2')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (clinicianError || !clinician) {
        return res.status(403).json({ error: 'Clinician profile not found' });
      }

      hasAccess = appointment.clinician_id === clinician.id;
    } else if (userRole === 'client') {
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('patient_id')
        .eq('id', appointmentId)
        .single();

      if (appointmentError) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (clientError || !client) {
        return res.status(403).json({ error: 'Client profile not found' });
      }

      hasAccess = appointment.patient_id === client.id;
    }

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this appointment' });
    }

    // Get appointment details with participant information
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        clinician_id,
        patient:patient_id (
          id,
          user_id,
          user:user_id (
            id,
            email,
            user_metadata
          )
        ),
        clinician:clinician_id (
          id,
          user_id,
          user:user_id (
            id,
            email,
            user_metadata
          )
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const participants = [];

    // Add patient
    if (appointment.patient?.user) {
      participants.push({
        id: appointment.patient.user.id,
        role: 'client',
        name: appointment.patient.user.user_metadata?.full_name || 
              appointment.patient.user.user_metadata?.name || 
              appointment.patient.user.email || 
              'Patient',
        email: appointment.patient.user.email
      });
    }

    // Add clinician
    if (appointment.clinician?.user) {
      participants.push({
        id: appointment.clinician.user.id,
        role: 'clinician',
        name: appointment.clinician.user.user_metadata?.full_name || 
              appointment.clinician.user.user_metadata?.name || 
              appointment.clinician.user.email || 
              'Clinician',
        email: appointment.clinician.user.email
      });
    }

    res.json({
      success: true,
      data: participants
    });

  } catch (error) {
    console.error('Error in get participants:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;