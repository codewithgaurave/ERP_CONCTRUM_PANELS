import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import employeeAPI from "../apis/employeeAPI";
import { Eye, Mail, Phone } from "lucide-react";
import SimpleEmployeeModal from "../components/SimpleEmployeeModal";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const TeamMembers = () => {
  const { themeColors } = useTheme();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const { data } = await employeeAPI.getTeamMembers();
      setTeamMembers(data.teamMembers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching team members");
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (id) => {
    console.log('View Profile clicked for ID:', id);
    setSelectedEmployeeId(id);
    setIsModalOpen(true);
    console.log('Modal state set to true');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Team Members</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Manage and view your team members
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{teamMembers.length}</div>
          <div className="text-sm">Total Team Members</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{teamMembers.filter(m => m.isActive).length}</div>
          <div className="text-sm">Active Members</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>{new Set(teamMembers.map(m => m.designation?.title)).size}</div>
          <div className="text-sm">Different Roles</div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member._id} className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: themeColors.primary }}>
                {member.name?.first?.charAt(0)}{member.name?.last?.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{member.name?.first} {member.name?.last}</h3>
                <p className="text-sm" style={{ color: themeColors.textSecondary }}>{member.employeeId}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Role:</span>
                <span className="text-sm">{member.designation?.title || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Department:</span>
                <span className="text-sm">{member.department?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={14} />
                <span className="text-sm">{member.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={14} />
                <span className="text-sm">{member.mobile}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewProfile(member._id)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1"
                style={{ backgroundColor: themeColors.primary, color: themeColors.onPrimary }}
              >
                <Eye size={14} />
                <span>View Profile</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <p style={{ color: themeColors.textSecondary }}>No team members found</p>
        </div>
      )}

      {/* Employee Profile Modal */}
      <SimpleEmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        employeeId={selectedEmployeeId}
      />
    </div>
  );
};

export default TeamMembers;