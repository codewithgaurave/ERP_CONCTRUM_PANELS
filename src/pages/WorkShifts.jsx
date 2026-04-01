// src/components/WorkShifts.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import workShiftAPI from "../apis/workShiftAPI";
import CreateWorkShiftModal from "./modals/CreateWorkShiftModal";
import UpdateWorkShiftModal from "./modals/UpdateWorkShiftModal";
import { Eye, EyeOff, Edit, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, Clock } from "lucide-react";

const WorkShifts = () => {
  const { themeColors } = useTheme();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);

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

  // Fetch work shifts with filters
  const fetchWorkShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await workShiftAPI.getAll(filters);
      setShifts(data.shifts || []);
      setPagination(data.pagination || {});

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching work shifts");
      console.error("Fetch work shifts error:", err);
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

  // Toggle shift status
  const handleToggleStatus = async (id) => {
    try {
      const shift = shifts.find(shift => shift._id === id);
      if (!shift) return;

      const newStatus = shift.status === "Active" ? "Inactive" : "Active";
      
      const { data } = await workShiftAPI.update(id, { 
        ...shift, 
        status: newStatus 
      });
      
      setShifts(shifts.map(shift =>
        shift._id === id ? { ...shift, status: newStatus } : shift
      ));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error updating work shift status");
    }
  };

  // Delete work shift
  const handleDelete = async (id) => {
    const shift = shifts.find(shift => shift._id === id);
    if (!shift) return;

    if (!window.confirm(`Are you sure you want to delete the "${shift.name}" work shift? This action cannot be undone.`)) {
      return;
    }

    try {
      await workShiftAPI.delete(id);
      // Refresh the list to maintain pagination
      fetchWorkShifts();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error deleting work shift");
    }
  };

  // Handle work shift creation
  const handleWorkShiftCreated = () => {
    setShowCreateModal(false);
    fetchWorkShifts(); // Refresh the list
  };

  // Handle work shift update
  const handleWorkShiftUpdated = () => {
    setShowUpdateModal(false);
    setSelectedShift(null);
    fetchWorkShifts(); // Refresh the list
  };

  // Start editing a work shift
  const startEditing = (shift) => {
    setSelectedShift(shift);
    setShowUpdateModal(true);
  };

  // Format time to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Calculate duration
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    
    // Handle overnight shifts
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
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
    fetchWorkShifts();
  }, [filters]);

  if (loading && shifts.length === 0) {
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
          <h1 className="text-2xl font-bold">Work Shifts Management</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Manage and organize company work shifts
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
            <Clock size={18} />
            + Add Work Shift
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
          <div className="text-sm">Total Shifts</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>
            {shifts.filter(shift => shift.status === "Active").length}
          </div>
          <div className="text-sm">Active Shifts</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>
            {shifts.filter(shift => shift.status === "Inactive").length}
          </div>
          <div className="text-sm">Inactive Shifts</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>
            {new Set(shifts.map(shift => calculateDuration(shift.startTime, shift.endTime))).size}
          </div>
          <div className="text-sm">Different Durations</div>
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
              placeholder="Search by shift name..."
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
              <option value="name">Name</option>
              <option value="startTime">Start Time</option>
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

      {/* Work Shifts Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Work Shifts List</h2>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Showing {shifts.length} of {pagination.totalCount} shifts
          </div>
        </div>

        {shifts.length === 0 ? (
          <div className="text-center py-12" style={{ color: themeColors.textSecondary }}>
            <p className="text-lg mb-2">No work shifts found</p>
            <p className="text-sm mb-4">Get started by creating your first work shift.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Clock size={18} />
              Create Work Shift
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
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Shift Name
                      <span className="text-xs">{getSortIcon('name')}</span>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('startTime')}
                  >
                    <div className="flex items-center gap-1">
                      Time Schedule
                      <span className="text-xs">{getSortIcon('startTime')}</span>
                    </div>
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Duration</th>
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
                {shifts.map((shift) => (
                  <tr 
                    key={shift._id} 
                    className="border-b transition-colors hover:opacity-90"
                    style={{ borderColor: themeColors.border }}
                  >
                    <td className="p-3 text-sm font-medium">{shift.name}</td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <div className="font-semibold text-xs" style={{ color: themeColors.primary }}>START</div>
                          <div className="text-sm">{formatTime(shift.startTime)}</div>
                        </div>
                        <div className="text-gray-400">→</div>
                        <div className="text-center">
                          <div className="font-semibold text-xs" style={{ color: themeColors.primary }}>END</div>
                          <div className="text-sm">{formatTime(shift.endTime)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm font-medium" style={{ color: themeColors.info }}>
                      {calculateDuration(shift.startTime, shift.endTime)}
                    </td>
                    <td className="p-3">
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          shift.status === "Active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {shift.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <div>
                        <div className="font-medium">{formatCreatedByName(shift.createdBy)}</div>
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                          {shift.createdBy?.employeeId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{formatDate(shift.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(shift)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{ backgroundColor: themeColors.primary }}
                          title="Edit Work Shift"
                        >
                          <Edit size={14} />
                          <span className="text-xs">Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(shift._id)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{
                            backgroundColor: shift.status === "Active" ? themeColors.warning : themeColors.success,
                          }}
                          title={shift.status === "Active" ? "Deactivate Shift" : "Activate Shift"}
                        >
                          {shift.status === "Active" ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span className="text-xs">
                            {shift.status === "Active" ? "Deactivate" : "Activate"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(shift._id)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{
                            backgroundColor: themeColors.danger
                          }}
                          title="Delete Work Shift"
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
      <CreateWorkShiftModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onWorkShiftCreated={handleWorkShiftCreated}
      />

      <UpdateWorkShiftModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedShift(null);
        }}
        shift={selectedShift}
        onWorkShiftUpdated={handleWorkShiftUpdated}
      />
    </div>
  );
};

export default WorkShifts;