import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Package, Laptop, Monitor, Smartphone, Headphones, User } from "lucide-react";
import assetAPI from "../apis/assetAPI";
import { toast } from "sonner";

const MyAssets = () => {
  const { themeColors } = useTheme();
  const { user } = useAuth();
  const [leaderAssets, setLeaderAssets] = useState([]);
  const [teamAssets, setTeamAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('my');
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({ totalAssets: 0, teamSize: 0, categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamAssets();
  }, []);

  const fetchTeamAssets = async () => {
    try {
      setLoading(true);
      
      // Fetch both team assets and leader's own assets
      const [teamResponse, leaderResponse] = await Promise.all([
        assetAPI.getTeamLeaderAssets().catch(() => ({ data: { assets: [], teamMembers: [], stats: {} } })),
        user?._id || user?.id ? assetAPI.getByEmployee(user._id || user.id).catch(() => ({ data: { assets: [] } })) : Promise.resolve({ data: { assets: [] } })
      ]);
      
      const teamAssetsData = teamResponse.data.assets || [];
      const leaderAssetsData = leaderResponse.data.assets || [];
      
      // Filter leader's active assets
      const activeLeaderAssets = leaderAssetsData.filter(asset => {
        if (!asset.assignedTo || !Array.isArray(asset.assignedTo)) return false;
        return asset.assignedTo.some(assignment => 
          assignment.isActive && 
          assignment.employee && 
          (assignment.employee._id === (user?._id || user?.id) || assignment.employee.id === (user?._id || user?.id))
        );
      });
      
      setLeaderAssets(activeLeaderAssets);
      setTeamAssets(teamAssetsData);
      setTeamMembers(teamResponse.data.teamMembers || []);
      setStats({
        totalAssets: activeLeaderAssets.length + teamAssetsData.length,
        teamSize: teamResponse.data.stats?.teamSize || 0,
        categories: teamResponse.data.stats?.categories || []
      });
    } catch (error) {
      console.error('Error fetching team assets:', error);
      toast.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const getAssetIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'laptop':
        return <Laptop size={24} />;
      case 'monitor':
        return <Monitor size={24} />;
      case 'mobile':
        return <Smartphone size={24} />;
      case 'headphones':
        return <Headphones size={24} />;
      default:
        return <Package size={24} />;
    }
  };

  const getConditionColor = (condition) => {
    switch (condition.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const assets = activeTab === 'my' ? leaderAssets : teamAssets;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Assets</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            View assets assigned to you and your team
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: themeColors.border }}>
        <button
          onClick={() => setActiveTab('my')}
          className="px-6 py-3 font-medium transition-colors"
          style={{
            color: activeTab === 'my' ? themeColors.primary : themeColors.textSecondary,
            borderBottom: activeTab === 'my' ? `2px solid ${themeColors.primary}` : 'none'
          }}
        >
          My Assets ({leaderAssets.length})
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className="px-6 py-3 font-medium transition-colors"
          style={{
            color: activeTab === 'team' ? themeColors.primary : themeColors.textSecondary,
            borderBottom: activeTab === 'team' ? `2px solid ${themeColors.primary}` : 'none'
          }}
        >
          Team Assets ({teamAssets.length})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{stats.totalAssets}</div>
          <div className="text-sm">Total Assets</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{stats.teamSize}</div>
          <div className="text-sm">Team Members</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>{stats.categories.length}</div>
          <div className="text-sm">Categories</div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: themeColors.primary + '10' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Asset</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Brand/Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Serial Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Assigned Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Condition</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: themeColors.border }}>
              {assets.map((asset) => {
                const assignedEmployee = asset.assignedTo?.[0]?.employee;
                return (
                  <tr key={asset._id} className="hover:bg-opacity-50" style={{ backgroundColor: themeColors.surface }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full" style={{ backgroundColor: themeColors.primary + '20', color: themeColors.primary }}>
                          {getAssetIcon(asset.category)}
                        </div>
                        <div>
                          <div className="font-medium">{asset.name}</div>
                          <div className="text-sm" style={{ color: themeColors.textSecondary }}>{asset.assetId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{asset.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{asset.brand}</div>
                      <div className="text-xs" style={{ color: themeColors.textSecondary }}>{asset.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{asset.serialNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignedEmployee ? (
                        <div className="flex items-center space-x-2">
                          <User size={16} style={{ color: themeColors.textSecondary }} />
                          <div>
                            <div className="text-sm font-medium">{assignedEmployee.name.first} {assignedEmployee.name.last}</div>
                            <div className="text-xs" style={{ color: themeColors.textSecondary }}>{assignedEmployee.employeeId}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: themeColors.textSecondary }}>Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {asset.assignedTo?.[0]?.assignedDate ? new Date(asset.assignedTo[0].assignedDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${asset.status === 'Assigned' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getConditionColor(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {assets.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package size={48} style={{ color: themeColors.textSecondary }} className="mx-auto mb-4" />
          <p style={{ color: themeColors.textSecondary }}>
            {activeTab === 'my' ? 'No assets assigned to you' : 'No assets assigned to your team'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyAssets;