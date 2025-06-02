const API_URL = import.meta.env.VITE_API_BASE_URL;

// Get appointments per clinician
export async function getAppointmentsPerClinician(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.status) queryParams.append("status", filters.status);

    const response = await fetch(
      `${API_URL}/api/analytics/appointments-per-clinician?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch appointments per clinician:", error);
    throw error;
  }
}

// Get revenue analytics
export async function getRevenueAnalytics(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.groupBy) queryParams.append("groupBy", filters.groupBy);
    if (filters.clinicianId) queryParams.append("clinicianId", filters.clinicianId);

    const response = await fetch(
      `${API_URL}/api/analytics/revenue?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch revenue analytics:", error);
    throw error;
  }
}

// Get patient demographics
export async function getPatientDemographics(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.clinicianId) queryParams.append("clinicianId", filters.clinicianId);

    const response = await fetch(
      `${API_URL}/api/analytics/patient-demographics?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch patient demographics:", error);
    throw error;
  }
}

// Get appointment trends
export async function getAppointmentTrends(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.groupBy) queryParams.append("groupBy", filters.groupBy);
    if (filters.clinicianId) queryParams.append("clinicianId", filters.clinicianId);

    const response = await fetch(
      `${API_URL}/api/analytics/appointment-trends?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch appointment trends:", error);
    throw error;
  }
}

// Get dashboard summary
export async function getDashboardSummary(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.clinicianId) queryParams.append("clinicianId", filters.clinicianId);

    const response = await fetch(
      `${API_URL}/api/analytics/dashboard-summary?${queryParams}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch dashboard summary:", error);
    throw error;
  }
}

// Format date for API
export function formatDateForAPI(date) {
  if (!date) return null;
  return date instanceof Date ? date.toISOString().split('T')[0] : date;
}

// Get date range presets
export function getDateRangePresets() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const lastQuarter = new Date(today);
  lastQuarter.setMonth(lastQuarter.getMonth() - 3);
  
  const lastYear = new Date(today);
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  return {
    today: {
      label: "Today",
      startDate: formatDateForAPI(today),
      endDate: formatDateForAPI(today)
    },
    yesterday: {
      label: "Yesterday",
      startDate: formatDateForAPI(yesterday),
      endDate: formatDateForAPI(yesterday)
    },
    lastWeek: {
      label: "Last 7 days",
      startDate: formatDateForAPI(lastWeek),
      endDate: formatDateForAPI(today)
    },
    lastMonth: {
      label: "Last 30 days",
      startDate: formatDateForAPI(lastMonth),
      endDate: formatDateForAPI(today)
    },
    lastQuarter: {
      label: "Last 3 months",
      startDate: formatDateForAPI(lastQuarter),
      endDate: formatDateForAPI(today)
    },
    lastYear: {
      label: "Last year",
      startDate: formatDateForAPI(lastYear),
      endDate: formatDateForAPI(today)
    }
  };
}

// Format currency for display
export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// Format percentage
export function formatPercentage(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

// Calculate percentage change
export function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Get trend indicator
export function getTrendIndicator(change) {
  if (change > 0) return { direction: "up", color: "text-green-600", icon: "↗" };
  if (change < 0) return { direction: "down", color: "text-red-600", icon: "↘" };
  return { direction: "neutral", color: "text-gray-600", icon: "→" };
}

// Export analytics data to CSV
export function exportAnalyticsToCSV(data, filename, headers) {
  const csvContent = [
    headers.join(","),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header.toLowerCase().replace(/\s+/g, '_')];
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Color palette for charts
export const chartColors = {
  primary: "#3B82F6",
  secondary: "#10B981",
  accent: "#F59E0B",
  danger: "#EF4444",
  warning: "#F97316",
  info: "#06B6D4",
  success: "#22C55E",
  muted: "#6B7280"
};

// Get color by index for multiple series
export function getChartColor(index) {
  const colors = Object.values(chartColors);
  return colors[index % colors.length];
}