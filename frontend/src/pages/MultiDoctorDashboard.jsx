import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { supabase } from "../utils/supabaseClient";
const API_URL = import.meta.env.VITE_API_BASE_URL;

const SOCKET_SERVER_URL = `${API_URL}`;
const api = import.meta.env.VITE_API_BASE_URL;

const NoAppointmentsView = () => (
  <div className="flex h-[calc(100vh-200px)] items-center justify-center">
    <div className="text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto mb-6 h-28 w-28 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 className="text-2xl font-semibold text-gray-700">
        No appointments scheduled
      </h3>
      <p className="mt-3 text-gray-500">All clinicians have clear schedules</p>
      <div className="mt-6 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-600">
        <span className="mr-2 h-2 w-2 rounded-full bg-blue-500"></span>
        Monitoring active - System ready
      </div>
    </div>
  </div>
);

const MultiDoctorDashboard = () => {
  // Get reception ID from localStorage instead of auth token
  const [receptionId, setReceptionId] = useState(
    localStorage.getItem("userId") || ""
  );
  const [clinicianQueues, setClinicianQueues] = useState({});
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Remove auth-related useEffect since we're getting ID from localStorage

  const fetchCompleteReceptionClinicianQueue = async (receptionId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${api}/multiDoctorDashboardRoutes/allNextAppointments/${receptionId}`,
      );
      const clinicianData = response.data;
      console.log(clinicianData);
      // Create a new object with update timestamps for each clinician
      const updatedClinicianQueues = {};
      const currentTime = new Date();

      Object.entries(clinicianData).forEach(([clinicianId, patients]) => {
        updatedClinicianQueues[clinicianId] = {
          patients,
          lastUpdate: currentTime,
        };
      });

      setClinicianQueues(updatedClinicianQueues);
      setLastUpdate(currentTime); // Keep this for the global refresh indicator
    } catch (error) {
      console.error(
        `Error fetching queue for reception ${receptionId}:`,
        error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);
    socket.emit("joinReception", receptionId);
    fetchCompleteReceptionClinicianQueue(receptionId);

    socket.on("clinicianQueueChanged", (data) => {
      const { clinicianId, receptionIdFromSocket } = data;
      if (receptionIdFromSocket == receptionId) {
        fetchClinicianQueue(clinicianId);
      }
    });

    // Set up refresh interval
    const intervalId = setInterval(() => {
      fetchCompleteReceptionClinicianQueue(receptionId);
    }, 60000); // Refresh every minute

    return () => {
      socket.disconnect();
      clearInterval(intervalId);
    };
  }, [receptionId]);

  const fetchClinicianQueue = async (clinicianId) => {
    const onlyId = clinicianId.split("+")[0];

    try {
      const response = await axios.get(
        `${api}/multiDoctorDashboardRoutes/nextAppointments/${onlyId}`,
      );
      const clinicianData = response.data;
      const currentTime = new Date();

      setClinicianQueues((prevQueues) => ({
        ...prevQueues,
        [clinicianId]: {
          patients: clinicianData,
          lastUpdate: currentTime,
        },
      }));

      // Global update time remains unchanged for overall system status
      setLastUpdate(new Date());
    } catch (error) {
      console.error(`Error fetching queue for clinician ${clinicianId}:`, error);
    }
  };

  // Extract clinician name from clinicianId
  const extractClinicianName = (clinicianId) => {
    const parts = clinicianId.split("+");
    return parts.length > 1 ? parts[1] : clinicianId;
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 10) return "Just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  };

  // Get status based on queue length
  const getStatusInfo = (patients) => {
    if (patients.length === 0) return { color: "gray", label: "Clear" };
    if (patients.length > 3) return { color: "red", label: "Busy" };
    if (patients.length > 1) return { color: "orange", label: "Active" };
    return { color: "green", label: "Optimal" };
  };

  // Get actual CSS classes for colors to avoid Tailwind purging issues
  const getColorClasses = (color) => {
    switch (color) {
      case "green":
        return {
          border: "border-green-500",
          bg: "bg-green-500",
          bgLight: "bg-green-100",
          text: "text-green-600",
          textDark: "text-green-900",
          progress: "bg-green-500",
          badge: "bg-green-100 text-green-800",
        };
      case "orange":
        return {
          border: "border-orange-500",
          bg: "bg-orange-500",
          bgLight: "bg-orange-100",
          text: "text-orange-600",
          textDark: "text-orange-900",
          progress: "bg-orange-500",
          badge: "bg-orange-100 text-orange-800",
        };
      case "red":
        return {
          border: "border-red-500",
          bg: "bg-red-500",
          bgLight: "bg-red-100",
          text: "text-red-600",
          textDark: "text-red-900",
          progress: "bg-red-500",
          badge: "bg-red-100 text-red-800",
        };
      default:
        return {
          border: "border-gray-500",
          bg: "bg-gray-500",
          bgLight: "bg-gray-100",
          text: "text-gray-600",
          textDark: "text-gray-900",
          progress: "bg-gray-500",
          badge: "bg-gray-100 text-gray-800",
        };
    }
  };

  // Check if all clinicians have empty queues
  const allCliniciansHaveNoAppointments = Object.entries(clinicianQueues).every(
    ([_, info]) => info.patients.length === 0,
  );

  // Calculate total patients
  const totalPatients = Object.values(clinicianQueues).reduce(
    (sum, info) => sum + info.patients.length,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation bar */}
      <nav className="bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-lg font-semibold text-gray-900">
                  BookSmartly Monitor
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <span className="hidden sm:inline">Last updated: </span>
                <span className="font-medium text-gray-900">
                  {getRelativeTime(lastUpdate)}
                </span>
              </div>
              <button
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => fetchCompleteReceptionClinicianQueue(receptionId)}
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Status bar */}
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-blue-100 p-3">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Total Patients
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {totalPatients}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-green-100 p-3">
                  <svg
                    className="h-6 w-6 text-green-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Active Clinicians
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {Object.keys(clinicianQueues).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md bg-indigo-100 p-3">
                  <svg
                    className="h-6 w-6 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Current Time
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {formatTime(new Date())}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="mb-6 flex items-center justify-center rounded-md bg-blue-50 px-4 py-2 text-blue-700 shadow-sm">
            <svg
              className="mr-2 h-5 w-5 animate-spin text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Updating queue information...
          </div>
        )}

        <h2 className="mb-6 text-xl font-bold text-gray-900">
          Patient Queue Monitor
        </h2>

        {allCliniciansHaveNoAppointments ? (
          <NoAppointmentsView />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(clinicianQueues).map(([clinicianId, clinicianInfo]) => {
              const { patients, lastUpdate: clinicianLastUpdate } = clinicianInfo;

              // Sort patients to ensure Q1 is first
              const sortedPatients = [...patients].sort(
                (a, b) => a.queuePosition - b.queuePosition,
              );

              const statusInfo = getStatusInfo(sortedPatients);
              const colorClasses = getColorClasses(statusInfo.color);

              return (
                <div
                  key={clinicianId}
                  className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  <div
                    className={`border-b-4 ${colorClasses.border} px-4 py-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClasses.bgLight}`}
                        >
                          <svg
                            className={`h-6 w-6 ${colorClasses.text}`}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {extractClinicianName(clinicianId)}
                          </h3>
                          <div className="mt-1 flex items-center">
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${colorClasses.bg}`}
                            ></span>
                            <span className="ml-1.5 text-sm text-gray-600">
                              {sortedPatients.length === 0
                                ? "No patients"
                                : sortedPatients.length === 1
                                  ? "1 patient waiting"
                                  : `${sortedPatients.length - 1} patients waiting`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`rounded-full ${colorClasses.badge} px-3 py-1 text-sm font-medium`}
                      >
                        {statusInfo.label}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg
                        className="mr-1.5 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Updated {getRelativeTime(clinicianLastUpdate)}
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    {sortedPatients.length === 0 ? (
                      <div className="flex items-center justify-center py-6 text-center">
                        <p className="text-gray-500">No patients in queue</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {sortedPatients.map((patient, index) => (
                          <li key={patient.name + index} className="py-2">
                            <div
                              className={`group flex items-center rounded-lg ${
                                index === 0
                                  ? "bg-green-50 shadow-sm"
                                  : "hover:bg-gray-50"
                              } px-3 py-3`}
                            >
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                  index === 0 ? "bg-green-500" : "bg-gray-200"
                                }`}
                              >
                                <span className="text-sm font-medium text-white">
                                  Q{patient.queuePosition}
                                </span>
                              </div>
                              <div className="ml-4 flex-grow">
                                <p
                                  className={`text-sm font-semibold ${
                                    index === 0
                                      ? "text-green-900"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {patient.name}
                                </p>
                                <p
                                  className={`text-xs ${
                                    index === 0
                                      ? "text-green-500"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {index === 0
                                    ? "Currently with clinician"
                                    : `Queue position ${index + 1}`}
                                </p>
                              </div>
                              {index === 0 && (
                                <div className="relative ml-2 flex-shrink-0">
                                  <span className="flex h-3 w-3">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                                  </span>
                                </div>
                              )}
                              <button className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500 group-hover:opacity-100 sm:opacity-0">
                                <svg
                                  className="h-5 w-5"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">
                        Queue Status
                      </span>
                      <span className={`font-medium ${colorClasses.text}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${colorClasses.progress}`}
                        style={{
                          width: `${sortedPatients.length ? Math.min(sortedPatients.length * 25, 100) : 0}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MultiDoctorDashboard;

