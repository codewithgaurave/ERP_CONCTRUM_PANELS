// src/components/LeavesManagement.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import leaveAPI from "../apis/leaveAPI";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  User,
  AlertCircle,
  Search,
  Download
} from "lucide-react";

const LeavesManagement = () => {
  const { themeColors } = useTheme();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and pagination states
  const [filters, setFilters] = useState({
    status: "All",
    leaveType: "All",
    employeeId: "",
    startDate: "",
    endDate: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10
  });

  const [searchTerm, setSearchTerm] = useState(""); // Frontend search
  const [allLeaves, setAllLeaves] = useState([]); // Store all leaves for filtering

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  const [statsByRequests, setStatsByRequests] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const [statsByDays, setStatsByDays] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  // Fetch all leaves (HR can see all leaves)
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Remove employeeId from backend filters to avoid errors
      const backendFilters = { ...filters };
      delete backendFilters.employeeId;
      
      console.log('🔍 Fetching leaves with filters:', backendFilters);
      const { data } = await leaveAPI.getMyAndTeamLeaves(backendFilters);
      console.log('📊 API Response:', data);
      console.log('📋 Leaves count:', data.leaves?.length || 0);
      console.log('📈 Statistics:', data.statistics);
      
      setAllLeaves(data.leaves || []); // Store all leaves
      setPagination(data.pagination || {});
      
      // Update stats from the response
      if (data.statistics) {
        if (data.statistics.byRequests) {
          const requests = data.statistics.byRequests;
          setStatsByRequests({
            pending: requests.pending || 0,
            approved: requests.approved || 0,
            rejected: requests.rejected || 0,
            total: requests.total || 0
          });
        }
        
        if (data.statistics.byDays) {
          const days = data.statistics.byDays;
          setStatsByDays({
            pending: days.totalPending || 0,
            approved: days.totalApproved || 0,
            rejected: days.totalRejected || 0,
            total: days.totalRequested || 0
          });
        }
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching leaves");
      console.error("Fetch leaves error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Frontend filtering function
  const getFilteredLeaves = () => {
    let filtered = [...allLeaves];
    
    // Filter by search term (employee ID or name)
    if (searchTerm) {
      filtered = filtered.filter(leave => {
        const employeeName = getEmployeeName(leave.employee).toLowerCase();
        const employeeId = leave.employee?.employeeId?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return employeeName.includes(search) || employeeId.includes(search);
      });
    }
    
    return filtered;
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    if (key === 'employeeId') {
      setSearchTerm(value); // Handle search separately
      return;
    }
    
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

  // Handle leave status update
  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this leave request?`)) {
      return;
    }

    try {
      await leaveAPI.updateStatus(id, newStatus);
      // Refresh the list to show updated status
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Error ${newStatus.toLowerCase()}ing leave`);
    }
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

  // Calculate number of days between two dates (using totalDays from API if available)
  const calculateDays = (leave) => {
    // Use totalDays from API if available, otherwise calculate manually
    if (leave.totalDays !== undefined) {
      return leave.totalDays;
    }
    
    const startDate = leave.startDate;
    const endDate = leave.endDate;
    
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
    
    return daysDiff;
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case "Approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "Pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get leave type badge style
  const getLeaveTypeBadge = (leaveType) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    
    switch (leaveType) {
      case "Casual":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Sick":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "Earned":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Maternity":
        return `${baseClasses} bg-pink-100 text-pink-800`;
      case "Paternity":
        return `${baseClasses} bg-teal-100 text-teal-800`;
      case "Other":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get employee name
  const getEmployeeName = (employee) => {
    if (!employee) return 'N/A';
    return `${employee.name?.first} ${employee.name?.last}`;
  };

  // Get approver/rejecter name
  const getProcessedByName = (leave) => {
    if (leave.status === "Approved" && leave.approvedBy) {
      return `Approved by: ${leave.approvedBy.name?.first} ${leave.approvedBy.name?.last}`;
    }
    if (leave.status === "Rejected" && leave.rejectedBy) {
      return `Rejected by: ${leave.rejectedBy.name?.first} ${leave.rejectedBy.name?.last}`;
    }
    return null;
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "All",
      leaveType: "All",
      employeeId: "",
      startDate: "",
      endDate: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10
    });
    setSearchTerm("");
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return <ArrowUpDown size={14} />;
    return filters.sortOrder === "asc" ? "↑" : "↓";
  };

  // Export leaves data
  const handleExportLeaves = () => {
    // Simple CSV export implementation
    const headers = ['Employee', 'Employee ID', 'Leave Type', 'Start Date', 'End Date', 'Duration', 'Reason', 'Status', 'Requested On', 'Processed By'];
    const csvData = leaves.map(leave => [
      getEmployeeName(leave.employee),
      leave.employee?.employeeId || 'N/A',
      leave.leaveType,
      formatDate(leave.startDate),
      formatDate(leave.endDate),
      `${calculateDays(leave)} days`,
      leave.reason || 'No reason',
      leave.status,
      formatDate(leave.createdAt),
      getProcessedByName(leave) || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leaves-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchLeaves();
  }, [filters.status, filters.leaveType, filters.startDate, filters.endDate, filters.sortBy, filters.sortOrder, filters.page, filters.limit]);

  // Update leaves when allLeaves or searchTerm changes
  useEffect(() => {
    setLeaves(getFilteredLeaves());
  }, [allLeaves, searchTerm]);

  if (loading && leaves.length === 0) {
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
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Manage and approve all employee leave requests
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={handleExportLeaves}
            className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.success,
              color: themeColors.success
            }}
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.warning,
              color: themeColors.warning
            }}
          >
            <Filter size={16} />
            Clear Filters
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

      {/* Statistics Section */}
      <div className="space-y-6">
        {/* By Requests Stats */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User size={18} />
            Statistics by Requests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{statsByRequests.total}</div>
              <div className="text-sm">Total Leaves</div>
            </div>
            <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>{statsByRequests.pending}</div>
              <div className="text-sm">Pending Approval</div>
            </div>
            <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{statsByRequests.approved}</div>
              <div className="text-sm">Approved</div>
            </div>
            <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <div className="text-3xl font-bold mb-2" style={{ color: themeColors.danger }}>{statsByRequests.rejected}</div>
              <div className="text-sm">Rejected</div>
            </div>
          </div>
        </div>

        {/* By Days Stats */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} />
            Statistics by Days
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{statsByDays.total}</div>
              <div className="text-sm">Total Days</div>
            </div>
            <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>{statsByDays.pending}</div>
              <div className="text-sm">Pending Days</div>
            </div>
            <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{statsByDays.approved}</div>
              <div className="text-sm">Approved Days</div>
            </div>
            <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <div className="text-3xl font-bold mb-2" style={{ color: themeColors.danger }}>{statsByDays.rejected}</div>
              <div className="text-sm">Rejected Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter size={18} />
          Filters & Search
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Leave Type</label>
            <select
              value={filters.leaveType}
              onChange={(e) => handleFilterChange('leaveType', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="All">All Types</option>
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Earned">Earned</option>
              <option value="Maternity">Maternity</option>
              <option value="Paternity">Paternity</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search Employee</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by employee ID or name..."
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            />
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
              <option value="createdAt">Created Date</option>
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
              <option value="status">Status</option>
              <option value="leaveType">Leave Type</option>
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

      {/* Leaves Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All Leave Requests</h2>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Showing {leaves.length} of {pagination.totalCount} leaves
          </div>
        </div>

        {leaves.length === 0 ? (
          <div className="text-center py-12" style={{ color: themeColors.textSecondary }}>
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No leave requests found</p>
            <p className="text-sm">No leave requests match your current filters.</p>
          </div>
        ) : (
          <>
            <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '18%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '7%' }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: themeColors.background }}>
                  <th className="px-3 py-2 text-left border-b font-medium" style={{ borderColor: themeColors.border }}>Employee</th>
                  <th className="px-3 py-2 text-left border-b font-medium" style={{ borderColor: themeColors.border }}>Leave Type</th>
                  <th
                    className="px-3 py-2 text-left border-b font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center gap-1">Date Range <span>{getSortIcon('startDate')}</span></div>
                  </th>
                  <th className="px-3 py-2 text-left border-b font-medium" style={{ borderColor: themeColors.border }}>Duration</th>
                  <th className="px-3 py-2 text-left border-b font-medium" style={{ borderColor: themeColors.border }}>Reason</th>
                  <th
                    className="px-3 py-2 text-left border-b font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">Status <span>{getSortIcon('status')}</span></div>
                  </th>
                  <th
                    className="px-3 py-2 text-left border-b font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">Requested <span>{getSortIcon('createdAt')}</span></div>
                  </th>
                  <th className="px-3 py-2 text-left border-b font-medium" style={{ borderColor: themeColors.border }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr
                    key={leave._id}
                    className="border-b transition-colors hover:opacity-90"
                    style={{ borderColor: themeColors.border }}
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium truncate">{getEmployeeName(leave.employee)}</div>
                      <div className="text-xs truncate" style={{ color: themeColors.textSecondary }}>ID: {leave.employee?.employeeId || 'N/A'}</div>
                      <div className="text-xs truncate" style={{ color: themeColors.textSecondary }}>{leave.employee?.designation || 'N/A'}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={getLeaveTypeBadge(leave.leaveType)}>{leave.leaveType}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1"><Calendar size={11} />{formatDate(leave.startDate)}</div>
                      <div className="text-xs" style={{ color: themeColors.textSecondary }}>to</div>
                      <div className="flex items-center gap-1"><Calendar size={11} />{formatDate(leave.endDate)}</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1"><Clock size={13} />{calculateDays(leave)}d</div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="truncate" title={leave.reason}>{leave.reason || 'No reason provided'}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={getStatusBadge(leave.status)}>{leave.status}</span>
                      {getProcessedByName(leave) && (
                        <div className="text-xs mt-1 truncate" style={{ color: themeColors.textSecondary }}>{getProcessedByName(leave)}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">{formatDate(leave.createdAt)}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-col gap-1">
                        {leave.status === "Pending" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(leave._id, "Approved")}
                              className="px-2 py-1 rounded text-white text-xs transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1 justify-center"
                              style={{ backgroundColor: themeColors.success }}
                              title="Approve Leave"
                            >
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(leave._id, "Rejected")}
                              className="px-2 py-1 rounded text-white text-xs transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1 justify-center"
                              style={{ backgroundColor: themeColors.danger }}
                              title="Reject Leave"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {(leave.status === "Approved" || leave.status === "Rejected") && (
                          <div className="text-xs text-center" style={{ color: themeColors.textSecondary }}>
                            <div className="font-bold" style={{ color: themeColors.success }}>Processed</div>
                            <div className="mt-1">
                              {leave.approvedBy && <span>By {leave.approvedBy.name?.first}</span>}
                              {leave.rejectedBy && <span>By {leave.rejectedBy.name?.first}</span>}
                            </div>
                          </div>
                        )}
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
    </div>
  );
};

export default LeavesManagement;