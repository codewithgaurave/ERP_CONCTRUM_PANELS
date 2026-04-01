import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assetAPI } from '../apis/assetAPI';
import employeeAPI from '../apis/employeeAPI';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';
import { X, Send, History } from 'lucide-react';

const MyAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [transferring, setTransferring] = useState(false);
  
  const { user } = useAuth();
  const { themeColors } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (user._id || user.id)) {
      fetchMyAssets();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyAssets = async () => {
    try {
      setLoading(true);
      if (!user || (!user._id && !user.id)) {
        setLoading(false);
        return;
      }

      const userId = user._id || user.id;
      console.log('🔍 Fetching assets for User ID:', userId);
      
      const response = await assetAPI.getByEmployee(userId);
      console.log('📦 API Response:', response.data);
      
      if (response && response.data) {
        const allAssets = response.data.assets || [];
        console.log('📋 Total Assets from API:', allAssets.length);
        console.log('📋 All Assets:', allAssets);
        
        const activeAssets = allAssets.filter(asset => {
          if (!asset.assignedTo || !Array.isArray(asset.assignedTo)) return false;
          return asset.assignedTo.some(assignment => 
            assignment.isActive && 
            assignment.employee && 
            (assignment.employee._id === userId || assignment.employee.id === userId)
          );
        });
        
        console.log('✅ Active Assets Assigned to You:', activeAssets.length);
        console.log('✅ Active Assets Details:', activeAssets);
        setAssets(activeAssets);
      } else {
        console.log('❌ No data in response');
        setAssets([]);
      }
    } catch (error) {
      console.error('❌ Fetch assets error:', error);
      toast.error('Failed to fetch assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      
      const response = await employeeAPI.getColleagues();
      
      console.log('🔍 Colleagues Response:', response.data);
      
      const colleagues = response.data?.colleagues || [];
      
      console.log('✅ Total Colleagues:', colleagues.length);
      setEmployees(colleagues);
    } catch (error) {
      console.error('❌ Error fetching colleagues:', error);
      toast.error('Failed to fetch colleagues');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleTransferClick = (asset) => {
    setSelectedAsset(asset);
    setShowTransferModal(true);
    setSelectedEmployee('');
    fetchEmployees();
  };

  const handleTransferAsset = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    try {
      setTransferring(true);
      await assetAPI.transferAsset(selectedAsset._id, selectedEmployee, 'transfer');
      toast.success('Asset transferred successfully');
      setShowTransferModal(false);
      fetchMyAssets();
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error(error.response?.data?.message || 'Failed to transfer asset');
    } finally {
      setTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-lg">Loading assets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Assets</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/transfer-history')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md transition"
          >
            <History size={18} />
            Transfer History
          </button>
          <div className="text-sm text-gray-600 font-medium">
            Total Assets: {assets.length}
          </div>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">💻</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Assets Assigned</h3>
          <p className="text-gray-500">You don't have any assets assigned to you yet.</p>
          <button 
            onClick={fetchMyAssets}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset._id} className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{asset.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    asset.status === 'Assigned' ? 'bg-green-100 text-green-800' :
                    asset.status === 'Available' ? 'bg-blue-100 text-blue-800' :
                    asset.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {asset.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Asset ID:</span>
                    <span className="font-medium">{asset.assetId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span>{asset.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serial Number:</span>
                    <span>{asset.serialNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned Date:</span>
                    <span>{asset.assignedTo?.[0]?.assignedDate ? new Date(asset.assignedTo[0].assignedDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {asset.condition && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Condition:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        asset.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                        asset.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                        asset.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {asset.condition}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleTransferClick(asset)}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Transfer Asset
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Transfer Asset</h2>
              <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Asset: {selectedAsset?.name}</h3>
                <p className="text-sm text-gray-600">ID: {selectedAsset?.assetId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Employee</label>
                {loadingEmployees ? (
                  <div className="text-center py-4">Loading employees...</div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No employees found. Check console for details.
                  </div>
                ) : (
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Employee ({employees.length} available) --</option>
                    {employees.map((emp) => {
                      const empId = emp._id || emp.id;
                      const firstName = emp.name?.first || emp.firstName || '';
                      const lastName = emp.name?.last || emp.lastName || '';
                      const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';
                      const employeeId = emp.employeeId || empId;
                      const department = emp.department?.name || emp.department || 'N/A';
                      
                      return (
                        <option key={empId} value={empId}>
                          {employeeId} - {fullName} ({department})
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowTransferModal(false)}
                  disabled={transferring}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferAsset}
                  disabled={transferring || !selectedEmployee}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {transferring ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Transfer Asset
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Summary */}
      {assets.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Asset Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {assets.filter(a => a.status === 'Assigned').length}
              </div>
              <div className="text-sm text-gray-600">Assigned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {assets.filter(a => a.status === 'Maintenance').length}
              </div>
              <div className="text-sm text-gray-600">Maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {assets.filter(a => a.status === 'Available').length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {assets.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAssets;
