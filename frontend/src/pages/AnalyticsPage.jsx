import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getAppointmentsPerClinician,
  getRevenueAnalytics,
  getPatientDemographics,
  getAppointmentTrends,
  getDashboardSummary,
  formatDateForAPI,
  getDateRangePresets,
  formatCurrency,
  formatPercentage,
  calculatePercentageChange,
  getTrendIndicator,
  exportAnalyticsToCSV,
  chartColors,
  getChartColor,
} from "../utils/analyticsApi";

const AnalyticsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [demographicsData, setDemographicsData] = useState({ age: [], gender: [] });
  const [trendsData, setTrendsData] = useState([]);

  // Filter states
  const [dateRange, setDateRange] = useState("lastMonth");
  const [customDateRange, setCustomDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [selectedClinician, setSelectedClinician] = useState("");
  const [groupBy, setGroupBy] = useState("day");

  // Get user data from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserId && storedUserRole) {
      setUser({ id: storedUserId, role: storedUserRole });
    }
  }, []);

  // Check if user has access to analytics
  const hasAccess = user?.role === "clinician" || user?.role === "reception";

  const datePresets = getDateRangePresets();

  useEffect(() => {
    if (hasAccess) {
      fetchAllData();
    }
  }, [hasAccess, dateRange, customDateRange, selectedClinician, groupBy, user]);

  const getFilters = () => {
    const filters = {};
    
    if (dateRange === "custom") {
      if (customDateRange.startDate) filters.startDate = formatDateForAPI(customDateRange.startDate);
      if (customDateRange.endDate) filters.endDate = formatDateForAPI(customDateRange.endDate);
    } else if (datePresets[dateRange]) {
      filters.startDate = datePresets[dateRange].startDate;
      filters.endDate = datePresets[dateRange].endDate;
    }
    
    if (selectedClinician && user?.role === "reception") {
      filters.clinicianId = selectedClinician;
    } else if (user?.role === "clinician") {
      filters.clinicianId = user?.id;
    }
    
    return filters;
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = getFilters();

      const [dashboard, appointments, revenue, demographics, trends] = await Promise.all([
        getDashboardSummary(filters),
        getAppointmentsPerClinician(filters),
        getRevenueAnalytics({ ...filters, groupBy }),
        getPatientDemographics(filters),
        getAppointmentTrends({ ...filters, groupBy }),
      ]);

      setDashboardData(dashboard);
      setAppointmentsData(appointments);
      setRevenueData(revenue);
      setDemographicsData(demographics);
      setTrendsData(trends);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (data, filename, headers) => {
    exportAnalyticsToCSV(data, filename, headers);
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access the analytics system.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "appointments", label: "Appointments", icon: "📅" },
    { id: "revenue", label: "Revenue", icon: "💰" },
    { id: "demographics", label: "Demographics", icon: "👥" },
    { id: "trends", label: "Trends", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">
            {user?.role === "clinician"
              ? "View your practice analytics and insights"
              : "View clinic-wide analytics and insights"
            }
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(datePresets).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.label}
                  </option>
                ))}
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group By
              </label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.totalAppointments}</p>
                    </div>
                    <div className="text-3xl">📅</div>
                  </div>
                  {dashboardData.appointmentChange !== undefined && (
                    <div className="mt-2 flex items-center">
                      <span className={`text-sm ${getTrendIndicator(dashboardData.appointmentChange).color}`}>
                        {getTrendIndicator(dashboardData.appointmentChange).icon}
                        {Math.abs(dashboardData.appointmentChange).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.totalRevenue)}
                      </p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                  {dashboardData.revenueChange !== undefined && (
                    <div className="mt-2 flex items-center">
                      <span className={`text-sm ${getTrendIndicator(dashboardData.revenueChange).color}`}>
                        {getTrendIndicator(dashboardData.revenueChange).icon}
                        {Math.abs(dashboardData.revenueChange).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Clients</p>
                      <p className="text-2xl font-bold text-gray-900">{dashboardData.activeClients}</p>
                    </div>
                    <div className="text-3xl">👥</div>
                  </div>
                  {dashboardData.clientChange !== undefined && (
                    <div className="mt-2 flex items-center">
                      <span className={`text-sm ${getTrendIndicator(dashboardData.clientChange).color}`}>
                        {getTrendIndicator(dashboardData.clientChange).icon}
                        {Math.abs(dashboardData.clientChange).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs previous period</span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Revenue/Appointment</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData.avgRevenuePerAppointment)}
                      </p>
                    </div>
                    <div className="text-3xl">📊</div>
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === "appointments" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Appointments by Clinician</h3>
                  <button
                    onClick={() => handleExport(appointmentsData, "appointments_by_clinician.csv", ["Clinician", "Total Appointments", "Completed", "Cancelled", "No Show"])}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={appointmentsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="clinician_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_appointments" fill={chartColors.primary} name="Total" />
                    <Bar dataKey="completed" fill={chartColors.success} name="Completed" />
                    <Bar dataKey="cancelled" fill={chartColors.danger} name="Cancelled" />
                    <Bar dataKey="no_show" fill={chartColors.warning} name="No Show" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === "revenue" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Over Time</h3>
                  <button
                    onClick={() => handleExport(revenueData, "revenue_analytics.csv", ["Period", "Revenue", "Appointments"])}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="revenue" orientation="left" />
                    <YAxis yAxisId="appointments" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === "revenue" ? formatCurrency(value) : value,
                        name === "revenue" ? "Revenue" : "Appointments"
                      ]}
                    />
                    <Legend />
                    <Line 
                      yAxisId="revenue" 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke={chartColors.primary} 
                      strokeWidth={3}
                      name="Revenue"
                    />
                    <Line 
                      yAxisId="appointments" 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke={chartColors.secondary} 
                      strokeWidth={2}
                      name="Appointments"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Demographics Tab */}
            {activeTab === "demographics" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Age Distribution</h3>
                    <button
                      onClick={() => handleExport(demographicsData.age, "age_demographics.csv", ["Age Group", "Count", "Percentage"])}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                    >
                      Export
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={demographicsData.age}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ age_group, percentage }) => `${age_group}: ${formatPercentage(percentage)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {demographicsData.age.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Gender Distribution</h3>
                    <button
                      onClick={() => handleExport(demographicsData.gender, "gender_demographics.csv", ["Gender", "Count", "Percentage"])}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                    >
                      Export
                    </button>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={demographicsData.gender}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ gender, percentage }) => `${gender}: ${formatPercentage(percentage)}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {demographicsData.gender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [value, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Trends Tab */}
            {activeTab === "trends" && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Appointment Trends</h3>
                  <button
                    onClick={() => handleExport(trendsData, "appointment_trends.csv", ["Period", "Total", "Completed", "Cancelled", "No Show"])}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke={chartColors.primary} 
                      strokeWidth={3}
                      name="Total"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke={chartColors.success} 
                      strokeWidth={2}
                      name="Completed"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cancelled" 
                      stroke={chartColors.danger} 
                      strokeWidth={2}
                      name="Cancelled"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="no_show" 
                      stroke={chartColors.warning} 
                      strokeWidth={2}
                      name="No Show"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;