import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { Plus, Send, Eye, Calendar, Bell, User } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import apiRoutes from "../contants/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("hrms-token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

const TeamNotices = () => {
  const { themeColors } = useTheme();
  const [notices, setNotices] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({
    totalNoticesSent: 0,
    activeNotices: 0,
    teamMembers: 0
  });
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('notices');
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "General",
    priority: "Medium",
    expiryDate: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch notices created by team leader
      const noticesResponse = await axios.get(`${apiRoutes.notices}/my-notices`, {
        headers: getAuthHeader(),
      });
      
      // Fetch announcements from HR
      const announcementsResponse = await axios.get(`${apiRoutes.announcements}/employee-filtered`, {
        headers: getAuthHeader(),
      });
      
      const noticesData = noticesResponse.data.notices || [];
      const announcementsData = announcementsResponse.data.announcements || [];
      
      setNotices(noticesData);
      setAnnouncements(announcementsData);
      
      // Calculate stats
      const totalNoticesSent = noticesData.length;
      const activeNotices = noticesData.filter(notice => {
        if (!notice.expiryDate) return true;
        return new Date(notice.expiryDate) >= new Date();
      }).length;
      
      const teamMembers = noticesData.length > 0 ? noticesData[0].targetEmployees?.length || 0 : 2;
      
      setStats({
        totalNoticesSent,
        activeNotices,
        teamMembers
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(apiRoutes.notices, formData, {
        headers: getAuthHeader(),
      });
      toast.success("Notice sent to team successfully");
      setShowCreateModal(false);
      setFormData({
        title: "",
        content: "",
        type: "General",
        priority: "Medium",
        expiryDate: ""
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending notice");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Urgent: 'bg-red-100 text-red-800',
      Holiday: 'bg-green-100 text-green-800',
      Meeting: 'bg-blue-100 text-blue-800',
      Training: 'bg-purple-100 text-purple-800',
      Policy: 'bg-orange-100 text-orange-800',
      General: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={24} style={{ color: themeColors.primary }} />
            Team Communication
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Send notices to your team and view HR announcements
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg font-medium text-white flex items-center space-x-2"
          style={{ backgroundColor: themeColors.primary }}
        >
          <Plus size={16} />
          <span>Send Notice</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{stats.totalNoticesSent}</div>
          <div className="text-sm">My Notices Sent</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{stats.activeNotices}</div>
          <div className="text-sm">Active Notices</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>{stats.teamMembers}</div>
          <div className="text-sm">Team Members</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>{announcements.length}</div>
          <div className="text-sm">HR Announcements</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'notices' ? 'text-white' : ''
          }`}
          style={{
            backgroundColor: activeTab === 'notices' ? themeColors.primary : themeColors.background,
            color: activeTab === 'notices' ? 'white' : themeColors.text,
            border: `1px solid ${themeColors.border}`
          }}
        >
          My Notices ({notices.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'announcements' ? 'text-white' : ''
          }`}
          style={{
            backgroundColor: activeTab === 'announcements' ? themeColors.primary : themeColors.background,
            color: activeTab === 'announcements' ? 'white' : themeColors.text,
            border: `1px solid ${themeColors.border}`
          }}
        >
          HR Announcements ({announcements.length})
        </button>
      </div>

      {/* Content */}
      <div className="rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
          <h2 className="text-lg font-semibold">
            {activeTab === 'notices' ? 'My Team Notices' : 'HR Announcements'}
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activeTab === 'notices' ? (
              notices.length > 0 ? notices.map((notice) => (
                <div key={notice._id} className="p-4 rounded-lg border" style={{ borderColor: themeColors.border }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Notice
                        </span>
                        {notice.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                            {notice.priority}
                          </span>
                        )}
                        {notice.type && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.type)}`}>
                            {notice.type}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium">{notice.title}</h3>
                      <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                        {notice.content}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs" style={{ color: themeColors.textSecondary }}>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(notice.createdAt)}
                        </span>
                        <span>To: {notice.targetEmployees?.length || 0} team members</span>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8" style={{ color: themeColors.textSecondary }}>
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No notices sent yet</p>
                </div>
              )
            ) : (
              announcements.length > 0 ? announcements.map((announcement) => (
                <div key={announcement._id} className="p-4 rounded-lg border" style={{ borderColor: themeColors.border }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Announcement
                        </span>
                        {announcement.category && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(announcement.category)}`}>
                            {announcement.category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium">{announcement.title}</h3>
                      <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                        {announcement.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs" style={{ color: themeColors.textSecondary }}>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(announcement.createdAt)}
                        </span>
                        {announcement.createdBy && (
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {announcement.createdBy.name?.first} {announcement.createdBy.name?.last} (HR)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8" style={{ color: themeColors.textSecondary }}>
                  <Bell size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No announcements from HR</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Create Notice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg w-full max-w-2xl" style={{ backgroundColor: themeColors.surface }}>
            <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-bold">Send Notice to Team</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 rounded-lg border"
                    style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                    placeholder="Enter notice title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content *</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full p-3 rounded-lg border"
                    style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                    placeholder="Enter notice content"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border"
                      style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                    >
                      <option value="General">General</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Policy">Policy</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-lg border"
                      style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border"
                    style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border font-medium"
                  style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg font-medium text-white flex items-center space-x-2 disabled:opacity-50"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  <Send size={16} />
                  <span>{loading ? "Sending..." : "Send Notice"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamNotices;