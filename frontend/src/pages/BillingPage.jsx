import React, { useState, useEffect } from "react";
import { useAuthContext } from "../utils/ContextProvider";
import {
  createInvoice,
  createCheckoutSession,
  getClinicianInvoices,
  getAllInvoices,
  updateInvoiceStatus,
  exportInvoicesToCSV,
  formatCurrency,
  getInvoiceStatusColor,
} from "../utils/billingApi";

const BillingPage = () => {
  const { currentUser: user } = useAuthContext();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    limit: 20,
    offset: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    hasMore: false,
  });

  // Create invoice form state
  const [newInvoice, setNewInvoice] = useState({
    clientId: "",
    appointmentId: "",
    amount: "",
    currency: "USD",
    description: "",
  });

  // Check if user has access to billing
  const hasAccess = user?.role === "clinician" || user?.role === "reception";

  useEffect(() => {
    if (hasAccess) {
      fetchInvoices();
    }
  }, [hasAccess, filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (user.role === "clinician") {
        data = await getClinicianInvoices(user.id, filters);
      } else {
        data = await getAllInvoices(filters);
      }

      setInvoices(data.invoices || []);
      setPagination({
        total: data.total || 0,
        hasMore: data.hasMore || false,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const invoiceData = {
        ...newInvoice,
        amount: parseFloat(newInvoice.amount),
        clinicianId: user.id,
      };

      await createInvoice(invoiceData);
      setShowCreateForm(false);
      setNewInvoice({
        clientId: "",
        appointmentId: "",
        amount: "",
        currency: "USD",
        description: "",
      });
      fetchInvoices();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (invoiceId) => {
    try {
      const { url } = await createCheckoutSession(invoiceId);
      window.open(url, "_blank");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (invoiceId, status) => {
    try {
      await updateInvoiceStatus(invoiceId, status);
      fetchInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = () => {
    exportInvoicesToCSV(invoices, `invoices_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0, // Reset pagination when filters change
    }));
  };

  const loadMore = () => {
    setFilters(prev => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access the billing system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing Management</h1>
              <p className="mt-2 text-gray-600">
                {user.role === "clinician" 
                  ? "Manage your invoices and payments"
                  : "Manage all clinic invoices and payments"
                }
              </p>
            </div>
            <div className="flex space-x-4">
              {invoices.length > 0 && (
                <button
                  onClick={handleExport}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Export CSV
                </button>
              )}
              {user.role === "clinician" && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Invoice
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            {user.role === "reception" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search by client name or email..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Items per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange("limit", parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
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

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No invoices found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      {user.role === "reception" && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clinician
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{invoice.id.slice(0, 8)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {invoice.clients?.users?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {invoice.clients?.users?.email || 'N/A'}
                            </div>
                          </div>
                        </td>
                        {user.role === "reception" && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {invoice.clinicians2?.users?.name || 'N/A'}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {invoice.status === "pending" && (
                              <button
                                onClick={() => handlePayment(invoice.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Pay Now
                              </button>
                            )}
                            {user.role === "reception" && invoice.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(invoice.id, "paid")}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(invoice.id, "cancelled")}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.hasMore && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <button
                    onClick={loadMore}
                    className="w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Load More ({pagination.total - invoices.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Invoice Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Invoice
              </h3>
              <form onSubmit={handleCreateInvoice}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={newInvoice.clientId}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, clientId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment ID (optional)
                    </label>
                    <input
                      type="text"
                      value={newInvoice.appointmentId}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, appointmentId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={newInvoice.currency}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newInvoice.description}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Creating..." : "Create Invoice"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;