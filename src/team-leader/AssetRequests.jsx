import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const AssetRequests = () => {
  const { themeColors } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeamAssetRequests();
  }, []);

  const fetchTeamAssetRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(apiRoutes.assetRequests, {
        headers: getAuthHeader(),
      });
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Error fetching team asset requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'Rejected':
        return <XCircle size={16} className="text-red-500" />;
      case 'Pending':
        return <Clock size={16} className="text-yellow-500" />;
      default:
        return <Package size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      <div>
        <h1 className="text-2xl font-bold">Team Asset Requests</h1>
        <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
          Asset requests from your team members
        </p>
      </div>

      {/* Team Asset Requests */}
      <div className="rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="p-6">
          <div className="space-y-4">
            {requests.length > 0 ? requests.map((request) => (
              <div key={request._id || request.id} className="p-4 rounded-lg border" style={{ borderColor: themeColors.border }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium">{request.assetCategory || request.category} - {request.requestType || request.type}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span>{request.status}</span>
                      </span>
                    </div>
                    <p className="text-sm mb-2" style={{ color: themeColors.textSecondary }}>
                      {request.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs" style={{ color: themeColors.textSecondary }}>
                      <span>Requested by: {request.requestedBy?.name?.first} {request.requestedBy?.name?.last} ({request.requestedBy?.employeeId})</span>
                      <span>Date: {new Date(request.createdAt || request.date).toLocaleDateString()}</span>
                      <span>Priority: {request.priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8" style={{ color: themeColors.textSecondary }}>
                <Package size={48} className="mx-auto mb-4 opacity-50" />
                <p>No team asset requests found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetRequests;