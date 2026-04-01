import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import apiRoutes from '../contants/api';
import { 
  Calendar,
  Clock,
  User,
  Plus,
  Filter
} from 'lucide-react';

const MyLeaves = () => {
  const { themeColors } = useTheme();
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('hrms-token');
      console.log('Team Leader - Fetching leaves with token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${apiRoutes.leaves}/my-leaves`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Team Leader - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Team Leader - API Response:', data);
        
        // Handle different response structures
        if (data.leaves) {
          setLeaves(data.leaves);
        } else if (Array.isArray(data)) {
          setLeaves(data);
        } else {
          console.log('Team Leader - Unexpected data structure:', data);
          setLeaves([]);
        }
        
        // Set leave balance for dropdown
        if (data.leaveBalance) {
          setLeaveBalance(data.leaveBalance);
        }
      } else {
        const errorData = await response.json();
        console.error('Team Leader - API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch leaves');
      }
    } catch (err) {
      setError(err.message || 'Error fetching leaves');
      console.error('Team Leader - Error fetching my leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLeave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(apiRoutes.leaves, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
        },
        body: JSON.stringify(newLeave)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        setNewLeave({ leaveType: '', startDate: '', endDate: '', reason: '' });
        setShowCreateForm(false);
        fetchMyLeaves();
      } else {
        throw new Error(responseData.message || 'Failed to create leave request');
      }
    } catch (err) {
      setError(err.message || 'Error creating leave request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (leave) => {
    if (leave.totalDays !== undefined) {
      return leave.totalDays;
    }
    
    const startDate = leave.startDate;
    const endDate = leave.endDate;
    
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    return daysDiff;
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

  const getProcessedByName = (leave) => {
    if (leave.status === "Approved" && leave.approvedBy) {
      return `Approved by: ${leave.approvedBy.name?.first} ${leave.approvedBy.name?.last}`;
    }
    if (leave.status === "Rejected" && leave.rejectedBy) {
      return `Rejected by: ${leave.rejectedBy.name?.first} ${leave.rejectedBy.name?.last}`;
    }
    return null;
  };

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
          <h1 className="text-2xl font-bold">My Leaves</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Apply for leaves and manage your leave history
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: themeColors.primary,
              borderColor: themeColors.primary,
              color: 'white'
            }}
          >
            <Plus size={16} />
            Apply for Leave
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

      {/* Leaves Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My Leave History</h2>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Total: {leaves.length} leaves
          </div>
        </div>

        {leaves.length === 0 ? (
          <div className="text-center py-12" style={{ color: themeColors.textSecondary }}>
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No leave requests found</p>
            <p className="text-sm">You haven't applied for any leaves yet.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: themeColors.background }}>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Leave Type</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Date Range</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Duration</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Reason</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Status</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr 
                  key={leave._id} 
                  className="border-b transition-colors hover:opacity-90"
                  style={{ borderColor: themeColors.border }}
                >
                  <td className="p-3">
                    <span className={getLeaveTypeBadge(leave.leaveType)}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(leave.startDate)}
                      </div>
                      <div className="text-xs text-gray-500">to</div>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(leave.endDate)}
                      </div>
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
                    <div className="flex flex-col gap-1">
                      <span className={getStatusBadge(leave.status)}>
                        {leave.status}
                      </span>
                      {getProcessedByName(leave) && (
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                          {getProcessedByName(leave)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm">{formatDate(leave.appliedOn || leave.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Leave Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: themeColors.surface }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: themeColors.text }}>Apply for Leave</h2>
            <form onSubmit={handleCreateLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>Leave Type</label>
                <select
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({...newLeave, leaveType: e.target.value})}
                  className="w-full p-2 rounded-md border text-sm"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveBalance.map((balance) => (
                    <option key={balance.leaveType} value={balance.leaveType}>
                      {balance.leaveType} ({balance.availableDays} available)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>Start Date</label>
                <input
                  type="date"
                  value={newLeave.startDate}
                  onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})}
                  className="w-full p-2 rounded-md border text-sm"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>End Date</label>
                <input
                  type="date"
                  value={newLeave.endDate}
                  onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})}
                  className="w-full p-2 rounded-md border text-sm"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>Reason</label>
                <textarea
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})}
                  className="w-full p-2 rounded-md border text-sm"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                  rows="3"
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border rounded-md transition-colors hover:opacity-90"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 rounded-md transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: 'white'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLeaves;