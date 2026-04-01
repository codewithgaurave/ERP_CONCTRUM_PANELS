// src/components/EmploymentStatuses.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import employmentStatusAPI from "../apis/employmentStatusAPI";
import CreateEmploymentStatusModal from "./modals/CreateEmploymentStatusModal";
import UpdateEmploymentStatusModal from "./modals/UpdateEmploymentStatusModal";
import { Eye, EyeOff, Edit, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, UserCheck } from "lucide-react";

const EmploymentStatuses = () => {
  const { themeColors } = useTheme();
  const [employmentStatuses, setEmploymentStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedEmploymentStatus, setSelectedEmploymentStatus] = useState(null);

  // Filter and pagination states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch employment statuses with filters
  const fetchEmploymentStatuses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await employmentStatusAPI.getAll(filters);
      setEmploymentStatuses(data.employmentStatuses || []);
      setPagination(data.pagination || {});

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching employment statuses");
      console.error("Fetch employment statuses error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle sort
  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "desc" ? "asc" : "desc",
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Toggle employment status
  const handleToggleStatus = async (id) => {
    try {
      const empStatus = employmentStatuses.find(status => status._id === id);
      if (!empStatus) return;

      const newStatus = empStatus.status === "Active" ? "Inactive" : "Active";
      
      const { data } = await employmentStatusAPI.update(id, { 
        ...empStatus, 
        status: newStatus 
      });
      
      setEmploymentStatuses(employmentStatuses.map(status =>
        status._id === id ? { ...status, status: newStatus } : status
      ));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error updating employment status");
    }
  };

  // Delete employment status
  const handleDelete = async (id) => {
    const empStatus = employmentStatuses.find(status => status._id === id);
    if (!empStatus) return;

    if (!window.confirm(`Are you sure you want to delete the "${empStatus.title}" employment status? This action cannot be undone.`)) {
      return;
    }

    try {
      await employmentStatusAPI.delete(id);
      // Refresh the list to maintain pagination
      fetchEmploymentStatuses();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error deleting employment status");
    }
  };

  // Handle employment status creation
  const handleEmploymentStatusCreated = () => {
    setShowCreateModal(false);
    fetchEmploymentStatuses(); // Refresh the list
  };

  // Handle employment status update
  const handleEmploymentStatusUpdated = () => {
    setShowUpdateModal(false);
    setSelectedEmploymentStatus(null);
    fetchEmploymentStatuses(); // Refresh the list
  };

  // Start editing an employment status
  const startEditing = (empStatus) => {
    setSelectedEmploymentStatus(empStatus);
    setShowUpdateModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format created by name
  const formatCreatedByName = (createdBy) => {
    if (!createdBy) return 'N/A';
    return `${createdBy.name?.first} ${createdBy.name?.last}`;
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10
    });
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return <ArrowUpDown size={14} />;
    return filters.sortOrder === "asc" ? "↑" : "↓";
  };

  useEffect(() => {
    fetchEmploymentStatuses();
  }, [filters]);

  if (loading && employmentStatuses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: themeColors.text }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employment Status Management</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Manage and organize employee employment statuses
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            Clear Filters
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: themeColors.primary
            }}
          >
            <UserCheck size={18} />
            + Add Status
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: themeColors.danger + '20', 
          borderColor: themeColors.danger,
          color: themeColors.danger
        }}>
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{pagination.totalCount}</div>
          <div className="text-sm">Total Statuses</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>
            {employmentStatuses.filter(status => status.status === "Active").length}
          </div>
          <div className="text-sm">Active Statuses</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>
            {employmentStatuses.filter(status => status.status === "Inactive").length}
          </div>
          <div className="text-sm">Inactive Statuses</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>
            {new Set(employmentStatuses.map(status => status.createdBy?._id)).size}
          </div>
          <div className="text-sm">Created By Users</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <h2 className="text-lg font-semibold mb-4">Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="title">Title</option>
              <option value="status">Status</option>
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Items Per Page</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employment Statuses Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Employment Statuses List</h2>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Showing {employmentStatuses.length} of {pagination.totalCount} statuses
          </div>
        </div>

        {employmentStatuses.length === 0 ? (
          <div className="text-center py-12" style={{ color: themeColors.textSecondary }}>
            <p className="text-lg mb-2">No employment statuses found</p>
            <p className="text-sm mb-4">Get started by creating your first employment status.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: themeColors.primary }}
            >
              <UserCheck size={18} />
              Create Employment Status
            </button>
          </div>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: themeColors.background }}>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-1">
                      Status Title
                      <span className="text-xs">{getSortIcon('title')}</span>
                    </div>
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Description</th>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <span className="text-xs">{getSortIcon('status')}</span>
                    </div>
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Created By</th>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      Created Date
                      <span className="text-xs">{getSortIcon('createdAt')}</span>
                    </div>
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employmentStatuses.map((empStatus) => (
                  <tr 
                    key={empStatus._id} 
                    className="border-b transition-colors hover:opacity-90"
                    style={{ borderColor: themeColors.border }}
                  >
                    <td className="p-3 text-sm font-medium">{empStatus.title}</td>
                    <td className="p-3 text-sm">
                      <div className="max-w-xs truncate" title={empStatus.description}>
                        {empStatus.description || 'No description'}
                      </div>
                    </td>
                    <td className="p-3">
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          empStatus.status === "Active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {empStatus.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <div>
                        <div className="font-medium">{formatCreatedByName(empStatus.createdBy)}</div>
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                          {empStatus.createdBy?.employeeId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{formatDate(empStatus.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(empStatus)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{ backgroundColor: themeColors.primary }}
                          title="Edit Employment Status"
                        >
                          <Edit size={14} />
                          <span className="text-xs">Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(empStatus._id)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{
                            backgroundColor: empStatus.status === "Active" ? themeColors.warning : themeColors.success,
                          }}
                          title={empStatus.status === "Active" ? "Deactivate Status" : "Activate Status"}
                        >
                          {empStatus.status === "Active" ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span className="text-xs">
                            {empStatus.status === "Active" ? "Deactivate" : "Activate"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(empStatus._id)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{
                            backgroundColor: themeColors.danger
                          }}
                          title="Delete Employment Status"
                        >
                          <Trash2 size={14} />
                          <span className="text-xs">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t" style={{ borderColor: themeColors.border }}>
                <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border 
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded text-sm transition-colors hover:opacity-90 ${
                          pagination.currentPage === pageNum ? 'text-white' : ''
                        }`}
                        style={{
                          backgroundColor: pagination.currentPage === pageNum ? themeColors.primary : themeColors.background,
                          border: `1px solid ${themeColors.border}`,
                          color: pagination.currentPage === pageNum ? 'white' : themeColors.text
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border 
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateEmploymentStatusModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEmploymentStatusCreated={handleEmploymentStatusCreated}
      />

      <UpdateEmploymentStatusModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedEmploymentStatus(null);
        }}
        employmentStatus={selectedEmploymentStatus}
        onEmploymentStatusUpdated={handleEmploymentStatusUpdated}
      />
    </div>
  );
};

export default EmploymentStatuses;