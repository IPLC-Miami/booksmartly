const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { jwtValidation, roleExtraction, requireRole, requireOwnership } = require('../middleware/auth');
const axios = require('axios');

// Ping endpoint - health check for FastAPI chatbot service (no auth required)
router.get('/ping', async (req, res) => {
  try {
    // Test the FastAPI health check endpoint
    const response = await axios.get('http://127.0.0.1:3001/', {
      timeout: 5000, // 5 second timeout for health check
    });

    // If we get here, the service is responding
    res.json({
      success: true,
      status: 'pong',
      message: 'AI FAQ chatbot service is healthy',
      service_response: response.data
    });

  } catch (error) {
    console.error('Health check failed for AI FAQ chatbot:', error.message);
    
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: 'AI FAQ service is not running',
        details: 'Connection refused'
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        status: 'unhealthy',
        error: 'AI FAQ service timeout',
        details: 'Health check timed out'
      });
    }

    // Generic error
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      details: error.message
    });
  }
});

// Get chat messages for a specific appointment
router.get('/:appointmentId', jwtValidation, roleExtraction, requireRole(['client', 'clinician']), requireOwnership('appointment'), async (req, res) => {
  try {
    const { appointmentId } = req.params;

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
router.post('/send', jwtValidation, roleExtraction, requireRole(['client', 'clinician']), requireOwnership('appointment'), async (req, res) => {
  try {
    const { appointmentId, message } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!appointmentId || !message || !message.trim()) {
      return res.status(400).json({ error: 'Appointment ID and message are required' });
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
router.get('/:appointmentId/participants', jwtValidation, roleExtraction, requireRole(['client', 'clinician']), requireOwnership('appointment'), async (req, res) => {
  try {
    const { appointmentId } = req.params;

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

// AI FAQ Chatbot route - proxy to FastAPI service
router.post('/faq', async (req, res) => {
  try {
    const { message } = req.body;

    // Validate input
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Forward request to FastAPI chatbot service
    const response = await axios.get(`http://127.0.0.1:3001/faq/?query=${encodeURIComponent(message.trim())}`, {
      timeout: 30000 // 30 second timeout
    });

    // Return the chatbot response
    res.json({
      success: true,
      data: {
        message: response.data.answer || response.data.message || 'No response from chatbot',
        source: 'ai_faq'
      }
    });

  } catch (error) {
    console.error('Error forwarding to AI FAQ chatbot:', error.message);
    
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'AI FAQ service is currently unavailable',
        details: 'Chatbot service connection refused'
      });
    }
    
    if (error.response) {
      // FastAPI returned an error response
      return res.status(error.response.status).json({
        error: 'AI FAQ service error',
        details: error.response.data?.detail || error.response.data?.message || 'Unknown error'
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'AI FAQ service timeout',
        details: 'Request to chatbot service timed out'
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Internal server error',
      details: 'Failed to process AI FAQ request'
    });
  }
});

module.exports = router;