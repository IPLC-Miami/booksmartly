import React, { useState, useEffect } from 'react';
import useUserRoleById from "../hooks/useUserRoleById";
import { useGetCurrentUser } from "../hooks/useGetCurrentUser";
import { getQueueForClinician, getHistoryForClinician, getPatientAppointments, getPatientAppointmentHistory } from '../utils/api';
import { useQuery } from '@tanstack/react-query';
import ChatWidget from '../components/ChatWidget';
import { supabase } from '../utils/supabaseClient';

function ChatPage() {
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const tokenString = localStorage.getItem("sb-itbxttkivivyeqnduxjb-auth-token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  const accessToken = token?.access_token;

  const { data: dataUser } = useGetCurrentUser();
  const { data: dataRole } = useUserRoleById(userId, accessToken);

  useEffect(() => {
    if (token && dataUser) {
      setUserId(dataUser?.user?.id);
    }
  }, [dataUser, token]);

  useEffect(() => {
    if (dataRole?.data && dataRole.data.length > 0) {
      setRole(dataRole.data[0].role);
    }
  }, [dataRole]);

  // Fetch appointments based on user role
  const { data: upcomingAppointments = [], isLoading: upcomingLoading } = useQuery({
    queryKey: ['upcomingAppointments', userId, role],
    queryFn: async () => {
      if (!userId || !role) return [];
      
      if (role === 'clinician') {
        // For clinicians, we need to get today's appointments
        const today = new Date().toISOString().split('T')[0];
        const selectedSlot = { start_time: '00:00', end_time: '23:59' }; // Get all slots for the day
        return getQueueForClinician(userId, today, selectedSlot);
      } else if (role === 'PATIENT') {
        return getPatientAppointments(userId);
      } else if (role === 'RECEPTION') {
        // Reception can see all appointments - we'll need to implement this endpoint
        // For now, return empty array
        return [];
      }
      return [];
    },
    enabled: !!userId && !!role,
  });

  const { data: pastAppointments = [], isLoading: pastLoading } = useQuery({
    queryKey: ['pastAppointments', userId, role],
    queryFn: async () => {
      if (!userId || !role) return [];
      
      if (role === 'clinician') {
        return getHistoryForClinician(userId);
      } else if (role === 'PATIENT') {
        return getPatientAppointmentHistory(userId);
      } else if (role === 'RECEPTION') {
        // Reception can see all appointments - we'll need to implement this endpoint
        // For now, return empty array
        return [];
      }
      return [];
    },
    enabled: !!userId && !!role,
  });

  const currentAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;
  const isLoadingAppointments = activeTab === 'upcoming' ? upcomingLoading : pastLoading;

  const formatAppointmentDisplay = (appointment) => {
    if (role === 'clinician') {
      return {
        id: appointment.appointmentId,
        title: `${appointment.patientName} (${appointment.age}${appointment.gender ? ', ' + appointment.gender : ''})`,
        subtitle: `${appointment.appointment_date} - ${appointment.appointment_time}`,
        details: appointment.issueDetails || 'No details provided',
      };
    } else if (role === 'PATIENT') {
      return {
        id: appointment.appointmentId,
        title: `Dr. ${appointment.clinician} - ${appointment.specialization}`,
        subtitle: `${appointment.appointment_date} - ${appointment.appointment_time}`,
        details: appointment.hospital || 'No hospital information',
      };
    }
    return null;
  };

  if (!userId || !role) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mb-24 mt-12 flex flex-col overflow-hidden p-4 font-noto md:px-12 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chat System</h1>
        <p className="text-gray-600 mt-2">
          {role === "clinician" ? "Communicate with patients through appointment-based conversations" : 
           role === "PATIENT" ? "Chat with your clinicians about your appointments" :
           "View and monitor all appointment conversations"}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            {/* Role-specific header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-2">Your Appointments</h2>
              
              {role === 'clinician' && (
                <p className="text-sm text-blue-600">
                  Select an appointment to chat with your patient
                </p>
              )}
              
              {role === 'PATIENT' && (
                <p className="text-sm text-green-600">
                  Select an appointment to chat with your clinician
                </p>
              )}
              
              {role === 'RECEPTION' && (
                <p className="text-sm text-purple-600">
                  View all appointment conversations
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  activeTab === 'upcoming'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 py-2 px-4 text-sm font-medium ${
                  activeTab === 'past'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Past
              </button>
            </div>

            {/* Appointments List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoadingAppointments ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : currentAppointments.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No {activeTab} appointments found
                </div>
              ) : (
                currentAppointments.map((appointment) => {
                  const displayData = formatAppointmentDisplay(appointment);
                  if (!displayData) return null;
                  
                  return (
                    <div
                      key={displayData.id}
                      onClick={() => setSelectedAppointment(displayData)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedAppointment?.id === displayData.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <h3 className="font-medium text-gray-900 truncate">
                        {displayData.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {displayData.subtitle}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {displayData.details}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Chat Widget */}
        <div className="lg:col-span-2">
          {selectedAppointment ? (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedAppointment.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedAppointment.subtitle}
                </p>
              </div>
              <div className="p-4">
                <ChatWidget
                  appointmentId={selectedAppointment.id}
                  currentUser={dataUser?.user}
                  userRole={role}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select an Appointment
              </h3>
              <p className="text-gray-600">
                Choose an appointment from the list to start or view the conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;