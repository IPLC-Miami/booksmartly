const API_URL = import.meta.env.VITE_API_BASE_URL;

// Create invoice
export async function createInvoice(invoiceData) {
  try {
    const response = await fetch(`${API_URL}/api/billing/create-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to create invoice:", error);
    throw error;
  }
}

// Create Stripe checkout session
export async function createCheckoutSession(invoiceId) {
  try {
    const response = await fetch(`${API_URL}/api/billing/create-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoiceId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    throw error;
  }
}

// Get invoices for clinician
export async function getClinicianInvoices(clinicianId, filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.limit) queryParams.append("limit", filters.limit);
    if (filters.offset) queryParams.append("offset", filters.offset);

    const response = await fetch(
      `${API_URL}/api/billing/clinician/${clinicianId}?${queryParams}`,
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
    console.error("Failed to fetch clinician invoices:", error);
    throw error;
  }
}

// Get all invoices (for reception staff)
export async function getAllInvoices(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.limit) queryParams.append("limit", filters.limit);
    if (filters.offset) queryParams.append("offset", filters.offset);
    if (filters.search) queryParams.append("search", filters.search);

    const response = await fetch(
      `${API_URL}/api/billing/all?${queryParams}`,
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
    console.error("Failed to fetch all invoices:", error);
    throw error;
  }
}

// Update invoice status
export async function updateInvoiceStatus(invoiceId, status) {
  try {
    const response = await fetch(
      `${API_URL}/api/billing/update-status/${invoiceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to update invoice status:", error);
    throw error;
  }
}

// Export invoices to CSV
export function exportInvoicesToCSV(invoices, filename = "invoices.csv") {
  const headers = [
    "Invoice ID",
    "Client Name",
    "Client Email",
    "Clinician Name",
    "Amount",
    "Currency",
    "Status",
    "Appointment Date",
    "Created Date"
  ];

  const csvContent = [
    headers.join(","),
    ...invoices.map(invoice => [
      invoice.id,
      `"${invoice.clients?.users?.name || 'N/A'}"`,
      `"${invoice.clients?.users?.email || 'N/A'}"`,
      `"${invoice.clinicians2?.users?.name || 'N/A'}"`,
      invoice.amount,
      invoice.currency,
      invoice.status,
      invoice.appointments2?.appointment_date || 'N/A',
      new Date(invoice.created_at).toLocaleDateString()
    ].join(","))
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

// Format currency
export function formatCurrency(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// Get invoice status color
export function getInvoiceStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "paid":
      return "text-green-600 bg-green-100";
    case "pending":
      return "text-yellow-600 bg-yellow-100";
    case "cancelled":
      return "text-red-600 bg-red-100";
    case "refunded":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}