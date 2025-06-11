import { supabase } from './supabaseClient.js';

// Use relative URL for development to enable Vite proxy
const API_URL = import.meta.env.DEV
  ? '/api'  // This will be proxied to localhost:3001 by Vite in development
  : import.meta.env.VITE_API_BASE_URL;

// Helper function to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }
  return {
    'Content-Type': 'application/json'
  };
}

// Authenticated fetch wrapper
async function authenticatedFetch(url, options = {}) {
  const headers = await getAuthHeaders();
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
}

// Schedule Management API Functions

/**
 * Get all schedules with optional filtering
 * @param {Object} filters - Optional filters (clinician_id, date_from, date_to)
 * @returns {Promise<Array>} Array of schedule objects
 */
export async function getSchedules(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.clinician_id) queryParams.append('clinician_id', filters.clinician_id);
    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);

    const url = `${API_URL}/schedules${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch schedules:', error);
    throw new Error('Failed to fetch schedules.');
  }
}

/**
 * Create a new schedule
 * @param {Object} scheduleData - Schedule data object
 * @returns {Promise<Object>} Created schedule object
 */
export async function createSchedule(scheduleData) {
  try {
    const response = await authenticatedFetch(`${API_URL}/schedules`, {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to create schedule:', error);
    throw error;
  }
}

/**
 * Update an existing schedule
 * @param {string} scheduleId - Schedule ID
 * @param {Object} scheduleData - Updated schedule data
 * @returns {Promise<Object>} Updated schedule object
 */
export async function updateSchedule(scheduleId, scheduleData) {
  try {
    const response = await authenticatedFetch(`${API_URL}/schedules/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to update schedule:', error);
    throw error;
  }
}

/**
 * Delete a schedule
 * @param {string} scheduleId - Schedule ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteSchedule(scheduleId) {
  try {
    const response = await authenticatedFetch(`${API_URL}/schedules/${scheduleId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    throw error;
  }
}

// Doctor Slots Management API Functions

/**
 * Get all doctor slots with optional filtering
 * @param {Object} filters - Optional filters (clinician_id, schedule_id, date_from, date_to)
 * @returns {Promise<Array>} Array of doctor slot objects
 */
export async function getDoctorSlots(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.clinician_id) queryParams.append('clinician_id', filters.clinician_id);
    if (filters.schedule_id) queryParams.append('schedule_id', filters.schedule_id);
    if (filters.date_from) queryParams.append('date_from', filters.date_from);
    if (filters.date_to) queryParams.append('date_to', filters.date_to);

    const url = `${API_URL}/schedules/doctor-slots${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch doctor slots:', error);
    throw new Error('Failed to fetch doctor slots.');
  }
}

/**
 * Create a new doctor slot
 * @param {Object} slotData - Doctor slot data object
 * @returns {Promise<Object>} Created doctor slot object
 */
export async function createDoctorSlot(slotData) {
  try {
    const response = await authenticatedFetch(`${API_URL}/schedules/doctor-slots`, {
      method: 'POST',
      body: JSON.stringify(slotData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to create doctor slot:', error);
    throw error;
  }
}

/**
 * Update an existing doctor slot
 * @param {string} slotId - Doctor slot ID
 * @param {Object} slotData - Updated doctor slot data
 * @returns {Promise<Object>} Updated doctor slot object
 */
export async function updateDoctorSlot(slotId, slotData) {
  try {
    const response = await authenticatedFetch(`${API_URL}/schedules/doctor-slots/${slotId}`, {
      method: 'PUT',
      body: JSON.stringify(slotData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to update doctor slot:', error);
    throw error;
  }
}

/**
 * Delete a doctor slot
 * @param {string} slotId - Doctor slot ID
 * @returns {Promise<Object>} Success response
 */
export async function deleteDoctorSlot(slotId) {
  try {
    const response = await authenticatedFetch(`${API_URL}/schedules/doctor-slots/${slotId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to delete doctor slot:', error);
    throw error;
  }
}

// Utility Functions

/**
 * Format date for API (YYYY-MM-DD format)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateForAPI(date) {
  if (!date) return null;
  return date instanceof Date ? date.toISOString().split('T')[0] : date;
}

/**
 * Format time for API (HH:MM:SS format)
 * @param {string} time - Time string to format
 * @returns {string} Formatted time string
 */
export function formatTimeForAPI(time) {
  if (!time) return null;
  // Ensure time is in HH:MM:SS format
  if (time.length === 5) { // HH:MM format
    return `${time}:00`;
  }
  return time;
}

/**
 * Validate schedule data before submission
 * @param {Object} scheduleData - Schedule data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateScheduleData(scheduleData) {
  const errors = [];
  
  if (!scheduleData.clinician_id) {
    errors.push('Clinician is required');
  }
  
  if (!scheduleData.date) {
    errors.push('Date is required');
  }
  
  if (!scheduleData.start_time) {
    errors.push('Start time is required');
  }
  
  if (!scheduleData.end_time) {
    errors.push('End time is required');
  }
  
  if (scheduleData.start_time && scheduleData.end_time) {
    if (scheduleData.start_time >= scheduleData.end_time) {
      errors.push('End time must be after start time');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate doctor slot data before submission
 * @param {Object} slotData - Doctor slot data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateDoctorSlotData(slotData) {
  const errors = [];
  
  if (!slotData.schedule_id) {
    errors.push('Schedule is required');
  }
  
  if (!slotData.start_time) {
    errors.push('Start time is required');
  }
  
  if (!slotData.end_time) {
    errors.push('End time is required');
  }
  
  if (slotData.start_time && slotData.end_time) {
    if (slotData.start_time >= slotData.end_time) {
      errors.push('End time must be after start time');
    }
  }
  
  if (slotData.max_patients !== undefined && slotData.max_patients < 1) {
    errors.push('Maximum patients must be at least 1');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get all clinicians
 * @returns {Promise<Array>} Array of clinician objects
 */
export async function getClinicians() {
  try {
    const response = await authenticatedFetch(`${API_URL}/clinicians`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch clinicians:', error);
    throw new Error('Failed to fetch clinicians.');
  }
}