// src/team-leader/TeamLeaderLeaves.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import leaveAPI from "../apis/leaveAPI";
import { 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  User
} from "lucide-react";

const TeamLeaderLeaves = () => {
  const { themeColors } = useTheme();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    status: "All",
    leaveType: "All",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10
  });

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Team Leader fetching leaves...');
      const { data } = await leaveAPI.getMyAndTeamLeaves(filters);
      console.log('📊 API Response:', data);
      
      setLeaves(data.leaves || []);
      
      if (data.statistics?.byRequests) {
        setStats(data.statistics.byRequests);
      }

    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.response?.data?.message || "Error fetching team leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this leave request?`)) {
      return;
    }

    try {
      await leaveAPI.updateStatus(id, newStatus);
      fetchLeaves();
    } catch (err) {
      setError(err.response?.data?.message || `Error ${newStatus.toLowerCase()}ing leave`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (leave) => {
    if (leave.totalDays !== undefined) return leave.totalDays;
    
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

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

  const getLeaveTypeBadge = (leaveType) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    
    switch (leaveType) {
      case "Casual":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Sick":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case "Earned":
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getEmployeeName = (employee) => {
    if (!employee) return 'N/A';
    return `${employee.name?.first || ''} ${employee.name?.last || ''}`.trim();
  };

  useEffect(() => {
    fetchLeaves();
  }, [filters.status, filters.leaveType, filters.sortBy, filters.sortOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: themeColors.text }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Team Leave Requests</h1>
        <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
          Manage your team members' leave requests
        </p>
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
            <button onClick={() => setError(null)} className="text-sm font-medium">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User size={18} />
          Team Leave Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
            <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{stats.total}</div>
            <div className="text-sm">Total Requests</div>
          </div>
          <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
            <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>{stats.pending}</div>
            <div className="text-sm">Pending</div>
          </div>
          <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
            <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{stats.approved}</div>
            <div className="text-sm">Approved</div>
          </div>
          <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
            <div className="text-3xl font-bold mb-2" style={{ color: themeColors.danger }}>{stats.rejected}</div>
            <div className="text-sm">Rejected</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter size={18} />
          Filters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-2 rounded-md border text-sm"
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
              onChange={(e) => setFilters(prev => ({ ...prev, leaveType: e.target.value }))}
              className="w-full p-2 rounded-md border text-sm"
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
            </select>
          </div>
        </div>
      </div>

      {/* Leaves Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Team Leave Requests</h2>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Total: {leaves.length} requests
          </div>
        </div>

        {leaves.length === 0 ? (
          <div className="text-center py-12" style={{ color: themeColors.textSecondary }}>
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No team leave requests found</p>
            <p className="text-sm">Your team members haven't submitted any leave requests yet.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: themeColors.background }}>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                  Team Member
                </th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Leave Type</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Date Range</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Duration</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Reason</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Status</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr 
                  key={leave._id} 
                  className="border-b transition-colors hover:opacity-90"
                  style={{ borderColor: themeColors.border }}
                >
                  <td className="p-3 text-sm">
                    <div>
                      <div className="font-medium">{getEmployeeName(leave.employee)}</div>
                      <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                        ID: {leave.employee?.employeeId || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={getLeaveTypeBadge(leave.leaveType)}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <div>
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </div>
                  </td>
                  <td className="p-3 text-sm font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {calculateDays(leave)} day(s)
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="max-w-xs" title={leave.reason}>
                      {leave.reason || 'No reason provided'}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={getStatusBadge(leave.status)}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {leave.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(leave._id, "Approved")}
                            className="p-2 rounded text-white transition-colors hover:opacity-90 flex items-center gap-1"
                            style={{ backgroundColor: themeColors.success }}
                            title="Approve Leave"
                          >
                            <CheckCircle size={14} />
                            <span className="text-xs">Approve</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(leave._id, "Rejected")}
                            className="p-2 rounded text-white transition-colors hover:opacity-90 flex items-center gap-1"
                            style={{ backgroundColor: themeColors.danger }}
                            title="Reject Leave"
                          >
                            <XCircle size={14} />
                            <span className="text-xs">Reject</span>
                          </button>
                        </>
                      )}
                      {(leave.status === "Approved" || leave.status === "Rejected") && (
                        <div className="text-xs text-center" style={{ color: themeColors.textSecondary }}>
                          Processed
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TeamLeaderLeaves;