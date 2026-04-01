// src/components/LeavePolicies.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import leavePolicyAPI from "../apis/leavePolicyAPI";
import CreateLeavePolicyModal from "./modals/CreateLeavePolicyModal";
import UpdateLeavePolicyModal from "./modals/UpdateLeavePolicyModal";
import { Edit, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

const LeavePolicies = () => {
  const { themeColors } = useTheme();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Filter and pagination states
  const [filters, setFilters] = useState({
    search: "",
    leaveType: "",
    genderRestriction: "",
    carryForward: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch policies with filters
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await leavePolicyAPI.getAll(filters);
      console.log("data", data)
      setPolicies(data.policies || []);
      setPagination(data.pagination || {});

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching leave policies");
      console.error("Fetch leave policies error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle sort
  const handleSort = (field) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "desc" ? "asc" : "desc",
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Delete policy
  const handleDelete = async (id) => {
    const policy = policies.find(policy => policy._id === id);
    if (!policy) return;

    if (!window.confirm(`Are you sure you want to delete the "${policy.leaveType}" leave policy? This action cannot be undone.`)) {
      return;
    }

    try {
      await leavePolicyAPI.delete(id);
      // Refresh the list to maintain pagination
      fetchPolicies();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error deleting leave policy");
    }
  };

  // Handle policy creation
  const handlePolicyCreated = () => {
    setShowCreateModal(false);
    fetchPolicies(); // Refresh the list
  };

  // Handle policy update
  const handlePolicyUpdated = () => {
    setShowUpdateModal(false);
    setSelectedPolicy(null);
    fetchPolicies(); // Refresh the list
  };

  // Start editing a policy
  const startEditing = (policy) => {
    setSelectedPolicy(policy);
    setShowUpdateModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format created by name
  const formatCreatedByName = (createdBy) => {
    if (!createdBy) return 'N/A';
    return `${createdBy.name?.first} ${createdBy.name?.last}`;
  };

  // Format carry forward status
  const formatCarryForward = (carryForward) => {
    return carryForward ? "Yes" : "No";
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      leaveType: "",
      genderRestriction: "",
      carryForward: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10
    });
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (filters.sortBy !== field) return <ArrowUpDown size={14} />;
    return filters.sortOrder === "asc" ? "↑" : "↓";
  };

  useEffect(() => {
    fetchPolicies();
  }, [filters]);

  if (loading && policies.length === 0) {
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
          <h1 className="text-2xl font-bold">Leave Policies Management</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Manage and organize company leave policies
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            Clear Filters
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
            style={{
              backgroundColor: themeColors.primary
            }}
          >
            + Add Leave Policy
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{pagination.totalCount}</div>
          <div className="text-sm">Total Policies</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>
            {policies.filter(policy => policy.carryForward).length}
          </div>
          <div className="text-sm">Carry Forward Enabled</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>
            {new Set(policies.map(policy => policy.leaveType)).size}
          </div>
          <div className="text-sm">Leave Types</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>
            {new Set(policies.map(policy => policy.createdBy?._id)).size}
          </div>
          <div className="text-sm">Created By Users</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <h2 className="text-lg font-semibold mb-4">Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by leave type or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Leave Type</label>
            <select
              value={filters.leaveType}
              onChange={(e) => handleFilterChange('leaveType', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All Types</option>
              <option value="Sick">Sick Leave</option>
              <option value="Casual">Casual Leave</option>
              <option value="Earned">Earned Leave</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Paternity">Paternity Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Gender Restriction</label>
            <select
              value={filters.genderRestriction}
              onChange={(e) => handleFilterChange('genderRestriction', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All</option>
              <option value="All">No Restriction</option>
              <option value="Male">Male Only</option>
              <option value="Female">Female Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Carry Forward</label>
            <select
              value={filters.carryForward}
              onChange={(e) => handleFilterChange('carryForward', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="leaveType">Leave Type</option>
              <option value="maxLeavesPerYear">Max Leaves</option>
              <option value="genderRestriction">Gender</option>
              <option value="carryForward">Carry Forward</option>
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sort Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
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

      {/* Policies Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Leave Policies List</h2>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Showing {policies.length} of {pagination.totalCount} policies
          </div>
        </div>

        {policies.length === 0 ? (
          <div className="text-center py-12" style={{ color: themeColors.textSecondary }}>
            <p className="text-lg mb-2">No leave policies found</p>
            <p className="text-sm mb-4">Get started by creating your first leave policy.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: themeColors.primary }}
            >
              Create Leave Policy
            </button>
          </div>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: themeColors.background }}>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('leaveType')}
                  >
                    <div className="flex items-center gap-1">
                      Leave Type
                      <span className="text-xs">{getSortIcon('leaveType')}</span>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('maxLeavesPerYear')}
                  >
                    <div className="flex items-center gap-1">
                      Max Leaves/Year
                      <span className="text-xs">{getSortIcon('maxLeavesPerYear')}</span>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('genderRestriction')}
                  >
                    <div className="flex items-center gap-1">
                      Gender Restriction
                      <span className="text-xs">{getSortIcon('genderRestriction')}</span>
                    </div>
                  </th>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('carryForward')}
                  >
                    <div className="flex items-center gap-1">
                      Carry Forward
                      <span className="text-xs">{getSortIcon('carryForward')}</span>
                    </div>
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Description</th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Created By</th>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      Created Date
                      <span className="text-xs">{getSortIcon('createdAt')}</span>
                    </div>
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr 
                    key={policy._id} 
                    className="border-b transition-colors hover:opacity-90"
                    style={{ borderColor: themeColors.border }}
                  >
                    <td className="p-3 text-sm font-medium">{policy.leaveType}</td>
                    <td className="p-3 text-sm">{policy.maxLeavesPerYear}</td>
                    <td className="p-3 text-sm">
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          policy.genderRestriction === "All" 
                            ? "bg-blue-100 text-blue-800" 
                            : policy.genderRestriction === "Male"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-pink-100 text-pink-800"
                        }`}
                      >
                        {policy.genderRestriction}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          policy.carryForward 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {formatCarryForward(policy.carryForward)}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <div className="max-w-xs truncate" title={policy.description}>
                        {policy.description || 'No description'}
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      <div>
                        <div className="font-medium">{formatCreatedByName(policy.createdBy)}</div>
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                          {policy.createdBy?.employeeId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{formatDate(policy.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(policy)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{ backgroundColor: themeColors.primary }}
                          title="Edit Leave Policy"
                        >
                          <Edit size={14} />
                          <span className="text-xs">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(policy._id)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{
                            backgroundColor: themeColors.danger
                          }}
                          title="Delete Leave Policy"
                        >
                          <Trash2 size={14} />
                          <span className="text-xs">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t" style={{ borderColor: themeColors.border }}>
                <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border 
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded text-sm transition-colors hover:opacity-90 ${
                          pagination.currentPage === pageNum ? 'text-white' : ''
                        }`}
                        style={{
                          backgroundColor: pagination.currentPage === pageNum ? themeColors.primary : themeColors.background,
                          border: `1px solid ${themeColors.border}`,
                          color: pagination.currentPage === pageNum ? 'white' : themeColors.text
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border 
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateLeavePolicyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPolicyCreated={handlePolicyCreated}
      />

      <UpdateLeavePolicyModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedPolicy(null);
        }}
        policy={selectedPolicy}
        onPolicyUpdated={handlePolicyUpdated}
      />
    </div>
  );
};

export default LeavePolicies;