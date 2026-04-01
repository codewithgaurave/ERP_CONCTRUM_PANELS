import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import apiRoutes from '../contants/api';

const MyLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false
  });

  useEffect(() => {
    fetchMyLeaves();
    fetchLeaveTypes();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      console.log('Starting fetchMyLeaves...');
      const token = localStorage.getItem('hrms-token');
      if (!token) {
        toast.error('Please login again');
        return;
      }

      console.log('Making API call to my-leaves...');
      const response = await fetch(`${apiRoutes.leaves}/my-leaves`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('My leaves data:', data);
        setLeaves(data.leaves || []);
        setLeaveBalance(data.leaveBalance || []);
      } else {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch leaves');
      }
    } catch (error) {
      console.error('Leave fetch error:', error);
      toast.error(error.message || 'Failed to fetch leaves');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const token = localStorage.getItem('hrms-token');
      const response = await fetch(`${apiRoutes.leaves}/available-types`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Leave types response:', data);
        // Use the correct property from API response
        const types = data.availableLeaveTypes || [];
        setLeaveTypes(types);
      } else {
        console.error('Failed to fetch leave types');
        // Fallback to default leave types
        setLeaveTypes([
          { leaveType: 'Sick', maxLeavesPerYear: 12 },
          { leaveType: 'Casual', maxLeavesPerYear: 15 },
          { leaveType: 'Earned', maxLeavesPerYear: 21 }
        ]);
      }
    } catch (error) {
      console.error('Leave types fetch error:', error);
      // Fallback to default leave types
      setLeaveTypes([
        { leaveType: 'Sick', maxLeavesPerYear: 12 },
        { leaveType: 'Casual', maxLeavesPerYear: 15 },
        { leaveType: 'Earned', maxLeavesPerYear: 21 }
      ]);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiRoutes.leaves, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        toast.success('Leave application submitted successfully');
        setShowApplyForm(false);
        setFormData({ leaveType: '', startDate: '', endDate: '', reason: '', isHalfDay: false });
        fetchMyLeaves();
      } else {
        toast.error(responseData.message || 'Failed to apply for leave');
      }
    } catch (error) {
      console.error('Leave application error:', error);
      toast.error('Failed to apply for leave');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Leaves</h1>
        <button
          onClick={() => setShowApplyForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Apply for Leave
        </button>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaveBalance.length > 0 ? leaveBalance.slice(0, 6).map((balance, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold text-lg">{balance.leaveType}</h3>
            <p className="text-2xl font-bold text-blue-600">{balance.availableDays}</p>
            <p className="text-sm text-gray-600">Available Days</p>
            <p className="text-xs text-gray-500">Used: {balance.usedDays}/{balance.maxLeavesPerYear}</p>
          </div>
        )) : (
          <div className="col-span-3 text-center text-gray-500">
            <p>No leave balance information available</p>
          </div>
        )}
      </div>

      {/* Leave Applications */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Leave Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Leave Type</th>
                <th className="px-4 py-3 text-left">Start Date</th>
                <th className="px-4 py-3 text-left">End Date</th>
                <th className="px-4 py-3 text-left">Days</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Reason</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No leave applications found
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} className="border-b">
                    <td className="px-4 py-3">{leave.leaveType}</td>
                    <td className="px-4 py-3">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{leave.totalDays}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{leave.reason}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Apply for Leave</h2>
            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {Array.isArray(leaveTypes) && leaveTypes.map((type, index) => {
                    const balance = leaveBalance.find(b => b.leaveType === type.leaveType);
                    return (
                      <option key={index} value={type.leaveType}>
                        {type.leaveType} {balance ? `(${balance.availableDays} available)` : `(${type.maxLeavesPerYear} max)`}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows="3"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isHalfDay}
                  onChange={(e) => setFormData({...formData, isHalfDay: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm">Half Day</label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
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