import { useState, useEffect } from 'react';
import { assetAPI } from '../apis/assetAPI';
import { toast } from 'sonner';

const AssetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    requestType: 'New',
    assetCategory: '',
    description: '',
    justification: '',
    priority: 'Medium'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, categoriesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BASE_API}/api/asset-requests/my-requests`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('hrms-token')}` }
        }),
        assetAPI.getCategories()
      ]);
      
      const requestsData = await requestsRes.json();
      setRequests(requestsData.requests || []);
      setCategories(categoriesRes.data?.categories || ['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Mobile', 'Tablet']);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API}/api/asset-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hrms-token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Asset request submitted successfully');
        setShowRequestForm(false);
        setFormData({
          requestType: 'New',
          assetCategory: '',
          description: '',
          justification: '',
          priority: 'Medium'
        });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit request');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Asset Requests</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowRequestForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            New Request
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">My Asset Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Request ID</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No asset requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request._id} className="border-b">
                    <td className="px-4 py-3 font-medium">{request.requestId}</td>
                    <td className="px-4 py-3">{request.requestType}</td>
                    <td className="px-4 py-3">{request.assetCategory}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.priority === 'High' ? 'bg-red-100 text-red-800' :
                        request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {request.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">New Asset Request</h2>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Request Type</label>
                <select
                  value={formData.requestType}
                  onChange={(e) => setFormData({...formData, requestType: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="New">New Asset</option>
                  <option value="Replacement">Replacement</option>
                  <option value="Upgrade">Upgrade</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Asset Category</label>
                <select
                  value={formData.assetCategory}
                  onChange={(e) => setFormData({...formData, assetCategory: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Describe the asset you need..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Justification</label>
                <textarea
                  value={formData.justification}
                  onChange={(e) => setFormData({...formData, justification: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Explain why you need this asset..."
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
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

export default AssetRequests;