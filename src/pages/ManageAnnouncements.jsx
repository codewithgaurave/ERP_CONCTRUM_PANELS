import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import announcementAPI from "../apis/announcementAPI";
import departmentAPI from "../apis/departmentAPI";
import designationAPI from "../apis/designationAPI";
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Filter,
  Users,
  Eye,
  EyeOff,
  Download,
  Calendar,
  AlertCircle,
  MessageSquare,
  User
} from "lucide-react";

const ManageAnnouncements = () => {
  const { themeColors } = useTheme();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [stats, setStats] = useState({});
  const [hrManagedData, setHrManagedData] = useState(null);
  
  const [filters, setFilters] = useState({
    category: "",
    isActive: "",
    page: 1,
    limit: 10,
  });

  // Frontend pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    category: "",
    audience: {
      allEmployees: true,
      departments: [],
      designations: [],
      roles: [],
    },
    isActive: true,
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  const categories = ["General", "Holiday", "Meeting", "Policy", "Training", "Urgent"];
  const roles = ["HR_Manager", "Team_Leader", "Employee"];

  useEffect(() => {
    fetchAnnouncements();
    fetchStats();
  }, [filters]);

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
  }, []);

  const fetchHRManagedData = async () => {
    try {
      const response = await announcementAPI.getHRManagedEmployees();
      setHrManagedData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch HR managed data:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Remove status filter from API call - do frontend filtering instead
      const apiFilters = {
        category: filters.category,
        page: filters.page,
        limit: filters.limit
      };
      
      let response;
      // Use different endpoints based on user role
      if (user?.role === 'HR_Manager') {
        // HR sees only announcements they created
        response = await announcementAPI.getMyCreated(apiFilters);
      } else {
        // Team Leaders and Employees see announcements from their HR
        response = await announcementAPI.getEmployeeFiltered(apiFilters);
      }
      
      let fetchedAnnouncements = response.data.announcements;
      
      // Apply frontend status filtering
      if (filters.isActive !== "") {
        const statusFilter = filters.isActive === "true";
        fetchedAnnouncements = fetchedAnnouncements.filter(announcement => 
          announcement.isActive === statusFilter
        );
      }
      
      setAnnouncements(fetchedAnnouncements);
      setPagination(response.data.pagination);
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      let response;
      // Use different stats endpoints based on user role
      if (user?.role === 'HR_Manager') {
        // HR sees stats for their created announcements
        response = await announcementAPI.getMyStats();
      } else {
        // For non-HR users, we can create a simple stats calculation
        // or use a different endpoint if needed
        response = await announcementAPI.getMyStats();
      }
      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll({ limit: 100 });
      setDepartments(response.data.departments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await designationAPI.getAll({ limit: 100 });
      setDesignations(response.data.designations);
    } catch (error) {
      console.error("Failed to fetch designations:", error);
    }
  };

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        message: announcement.message,
        category: announcement.category,
        audience: announcement.audience,
        isActive: announcement.isActive,
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: "",
        message: "",
        category: "",
        audience: {
          allEmployees: true,
          departments: [],
          designations: [],
          roles: [],
        },
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await announcementAPI.update(editingAnnouncement._id, formData);
      } else {
        // Use regular create for all users temporarily
        await announcementAPI.create(formData);
      }
      handleCloseDialog();
      fetchAnnouncements();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save announcement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await announcementAPI.delete(id);
        fetchAnnouncements();
        fetchStats();
      } catch (err) {
        setError("Failed to delete announcement");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await announcementAPI.toggleStatus(id);
      fetchAnnouncements();
      fetchStats();
    } catch (err) {
      setError("Failed to update announcement status");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleAudienceChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      audience: {
        ...prev.audience,
        [key]: value
      }
    }));
  };

  const getAudienceText = (audience) => {
    if (audience.allEmployees) return "All Employees";
    
    const parts = [];
    if (audience.departments?.length > 0) parts.push(`${audience.departments.length} Dept(s)`);
    if (audience.designations?.length > 0) parts.push(`${audience.designations.length} Desig(s)`);
    if (audience.roles?.length > 0) parts.push(`${audience.roles.length} Role(s)`);
    
    return parts.join(", ") || "Specific Audience";
  };

  const getCategoryColor = (category) => {
    const colors = {
      Urgent: "red",
      Holiday: "green",
      Meeting: "blue",
      Training: "yellow",
      Policy: "purple",
      General: "gray"
    };
    return colors[category] || "gray";
  };

  const getStatusBadge = (isActive) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    if (isActive) {
      return `${baseClasses} bg-green-100 text-green-800`;
    } else {
      return `${baseClasses} bg-gray-100 text-gray-800`;
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

  const clearFilters = () => {
    setFilters({
      category: "",
      isActive: "",
      page: 1,
      limit: 10,
    });
    setCurrentPage(1);
  };

  // Frontend pagination calculation
  const totalItems = announcements.length;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'all' ? totalItems : startIndex + itemsPerPage;
  const paginatedAnnouncements = announcements.slice(startIndex, endIndex);

  const handleExportAnnouncements = () => {
    const headers = ['Title', 'Category', 'Audience', 'Status', 'Created By', 'Created At', 'Message'];
    const csvData = announcements.map(announcement => [
      announcement.title,
      announcement.category || 'General',
      getAudienceText(announcement.audience),
      announcement.isActive ? 'Active' : 'Inactive',
      `${announcement.createdBy?.name?.first} ${announcement.createdBy?.name?.last}`,
      formatDate(announcement.createdAt),
      announcement.message
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `announcements-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && announcements.length === 0) {
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
          <h1 className="text-2xl font-bold">
            {user?.role === 'HR_Manager' ? 'Announcement Management' : 'Company Announcements'}
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            {user?.role === 'HR_Manager' 
              ? 'Create and manage company announcements' 
              : 'View announcements from your HR department'
            }
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={handleExportAnnouncements}
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
          {user?.role === 'HR_Manager' && (
            <button
              onClick={() => handleOpenDialog()}
              className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 flex items-center gap-2 text-white"
              style={{ backgroundColor: themeColors.primary }}
            >
              <Plus size={16} />
              New Announcement
            </button>
          )}
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{stats.total || 0}</div>
          <div className="text-sm">{user?.role === 'HR_Manager' ? 'My Total Announcements' : 'Total Announcements'}</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{stats.active || 0}</div>
          <div className="text-sm">{user?.role === 'HR_Manager' ? 'My Active' : 'Active'}</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.textSecondary }}>{stats.inactive || 0}</div>
          <div className="text-sm">{user?.role === 'HR_Manager' ? 'My Inactive' : 'Inactive'}</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>{stats.categories?.length || 0}</div>
          <div className="text-sm">{user?.role === 'HR_Manager' ? 'My Categories' : 'Categories'}</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter size={18} />
          Filters & Search
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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

      {/* Announcements Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {user?.role === 'HR_Manager' ? 'My Announcements' : 'Company Announcements'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAnnouncements}
              className="p-2 rounded border transition-colors hover:opacity-90"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border 
              }}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <div className="text-sm" style={{ color: themeColors.textSecondary }}>
              Showing {announcements.length} of {pagination.totalCount} announcements
            </div>
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-12" style={{ color: themeColors.textSecondary }}>
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No announcements found</p>
            <p className="text-sm">You haven't created any announcements yet.</p>
          </div>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: themeColors.background }}>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                    Title
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                    Message
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                    Category
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                    Audience
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                    Status
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                    Created By
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                    Created At
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedAnnouncements.map((announcement) => (
                  <tr 
                    key={announcement._id} 
                    className="border-b transition-colors hover:opacity-90"
                    style={{ borderColor: themeColors.border }}
                  >
                    <td className="p-3 text-sm">
                      <div className="font-medium">{announcement.title}</div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="text-xs mt-1 line-clamp-2" style={{ color: themeColors.textSecondary }}>
                        {announcement.message}
                      </div>
                    </td>
                    <td className="p-3">
                      <span 
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: `${themeColors[getCategoryColor(announcement.category)]}20`,
                          color: themeColors[getCategoryColor(announcement.category)]
                        }}
                      >
                        {announcement.category || "General"}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {getAudienceText(announcement.audience)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {user?.role === 'HR_Manager' ? (
                          <button
                            onClick={() => handleToggleStatus(announcement._id, announcement.isActive)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              announcement.isActive ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                announcement.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        ) : (
                          <div className={`h-6 w-11 rounded-full ${
                            announcement.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            <div className={`h-4 w-4 mt-1 transform rounded-full bg-white ${
                              announcement.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                        )}
                        <span className={getStatusBadge(announcement.isActive)}>
                          {announcement.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        {announcement.createdBy?.name?.first} {announcement.createdBy?.name?.last}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(announcement.createdAt)}
                      </div>
                    </td>
                    <td className="p-3">
                      {user?.role === 'HR_Manager' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenDialog(announcement)}
                            className="p-2 rounded text-white transition-colors hover:opacity-90"
                            style={{ backgroundColor: themeColors.warning }}
                            title="Edit Announcement"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(announcement._id)}
                            className="p-2 rounded text-white transition-colors hover:opacity-90"
                            style={{ backgroundColor: themeColors.danger }}
                            title="Delete Announcement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                          View Only
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    const value = e.target.value;
                    setItemsPerPage(value === 'all' ? 'all' : parseInt(value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 rounded-md border text-sm"
                  style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="all">All</option>
                </select>
                <span className="text-sm">entries</span>
              </div>

              <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
              </div>

              {itemsPerPage !== 'all' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm px-3">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: themeColors.surface }}
          >
            <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-semibold">
                {editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.audience.allEmployees}
                  onChange={(e) => handleAudienceChange("allEmployees", e.target.checked)}
                  className="rounded"
                />
                <label className="text-sm font-medium">Send to all employees</label>
              </div>

              {!formData.audience.allEmployees && (
                <div className="space-y-4 p-4 rounded border" style={{ borderColor: themeColors.border }}>
                  <h3 className="text-sm font-medium">Target Audience</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Departments</label>
                    <select
                      multiple
                      value={formData.audience.departments}
                      onChange={(e) => handleAudienceChange("departments", Array.from(e.target.selectedOptions, option => option.value))}
                      className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ 
                        backgroundColor: themeColors.background, 
                        borderColor: themeColors.border, 
                        color: themeColors.text
                      }}
                    >
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Designations</label>
                    <select
                      multiple
                      value={formData.audience.designations}
                      onChange={(e) => handleAudienceChange("designations", Array.from(e.target.selectedOptions, option => option.value))}
                      className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ 
                        backgroundColor: themeColors.background, 
                        borderColor: themeColors.border, 
                        color: themeColors.text
                      }}
                    >
                      {designations.map(desig => (
                        <option key={desig._id} value={desig._id}>
                          {desig.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Roles</label>
                    <select
                      multiple
                      value={formData.audience.roles}
                      onChange={(e) => handleAudienceChange("roles", Array.from(e.target.selectedOptions, option => option.value))}
                      className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ 
                        backgroundColor: themeColors.background, 
                        borderColor: themeColors.border, 
                        color: themeColors.text
                      }}
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>
                          {role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </form>

            <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: themeColors.border }}>
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90"
                style={{
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 text-white"
                style={{ backgroundColor: themeColors.primary }}
              >
                {editingAnnouncement ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAnnouncements;