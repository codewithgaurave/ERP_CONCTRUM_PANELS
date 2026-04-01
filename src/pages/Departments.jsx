// src/components/Departments.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import departmentAPI from "../apis/departmentAPI";
import CreateDepartmentModal from "./modals/CreateDepartmentModal";
import UpdateDepartmentModal from "./modals/UpdateDepartmentModal";
import { Eye, EyeOff, Edit, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { calculatePageNumbers } from "../utils/paginationHelpers";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Constants
const DEPARTMENT_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive"
};

const Departments = () => {
  const { themeColors } = useTheme();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Filter and pagination states
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10
  });

  // Debounced search
  const debouncedSearch = useDebounce(filters.search, 500);
  const [isSearching, setIsSearching] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch departments with filters
  const fetchDepartments = useCallback(async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        search: debouncedSearch
      };
      
      const { data } = await departmentAPI.getAll(queryParams);
      setDepartments(data.departments || []);
      setPagination(data.pagination || {});

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching departments");
      console.error("Fetch departments error:", err);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedSearch, filters.status, filters.sortBy, filters.sortOrder, filters.page, filters.limit]);

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

  // Toggle department status
  const handleToggleStatus = async (id) => {
    try {
      const department = departments.find(dept => dept._id === id);
      if (!department) return;

      const newStatus = department.status === DEPARTMENT_STATUS.ACTIVE ? DEPARTMENT_STATUS.INACTIVE : DEPARTMENT_STATUS.ACTIVE;
      
      const { data } = await departmentAPI.update(id, { 
        ...department, 
        status: newStatus 
      });
      
      setDepartments(departments.map(dept =>
        dept._id === id ? { ...dept, status: newStatus } : dept
      ));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error updating department status");
    }
  };

  // Delete department
  const handleDelete = async (id) => {
    const department = departments.find(dept => dept._id === id);
    if (!department) return;

    if (!window.confirm(`Are you sure you want to delete the "${department.name}" department? This action cannot be undone.`)) {
      return;
    }

    try {
      await departmentAPI.delete(id);
      // Refresh the list to maintain pagination
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error deleting department");
    }
  };

  // Handle department creation
  const handleDepartmentCreated = () => {
    setShowCreateModal(false);
    fetchDepartments(); // Refresh the list
  };

  // Handle department update
  const handleDepartmentUpdated = () => {
    setShowUpdateModal(false);
    setSelectedDepartment(null);
    fetchDepartments(); // Refresh the list
  };

  // Start editing a department
  const startEditing = (department) => {
    setSelectedDepartment(department);
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

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
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

  // Memoized stats calculation
  const departmentStats = useMemo(() => ({
    active: departments.filter(dept => dept.status === DEPARTMENT_STATUS.ACTIVE).length,
    inactive: departments.filter(dept => dept.status === DEPARTMENT_STATUS.INACTIVE).length,
    uniqueCreators: new Set(departments.map(dept => dept.createdBy?._id)).size
  }), [departments]);

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        const { data } = await departmentAPI.getAll({ page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc" });
        setDepartments(data.departments || []);
        setPagination(data.pagination || {});
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Error fetching departments");
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, []);

  // Filter changes
  useEffect(() => {
    if (!loading) {
      fetchDepartments();
    }
  }, [fetchDepartments, loading]);

  if (loading && departments.length === 0) {
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
          <h1 className="text-2xl font-bold">Departments Management</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Manage and organize company departments
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
            + Add Department
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
          <div className="text-sm">Total Departments</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>
            {departmentStats.active}
          </div>
          <div className="text-sm">Active Departments</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>
            {departmentStats.inactive}
          </div>
          <div className="text-sm">Inactive Departments</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>
            {departmentStats.uniqueCreators}
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
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 pr-8"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text
                }}
              />
              {isSearching && (
                <div className="absolute right-2 top-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: themeColors.primary }}></div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 rounded-md border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All Status</option>
              <option value={DEPARTMENT_STATUS.ACTIVE}>Active</option>
              <option value={DEPARTMENT_STATUS.INACTIVE}>Inactive</option>
            </select>
          </div>
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
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Updated Date</option>
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

      {/* Departments Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Departments List</h2>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Showing {departments.length} of {pagination.totalCount} departments
          </div>
        </div>

        {departments.length === 0 ? (
          <div className="text-center py-12" style={{ color: themeColors.textSecondary }}>
            <p className="text-lg mb-2">No departments found</p>
            <p className="text-sm mb-4">Get started by creating your first department.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: themeColors.primary }}
            >
              Create Department
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
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Department Name
                      <span className="text-xs">{getSortIcon('name')}</span>
                    </div>
                  </th>
                  <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Description</th>
                  <th 
                    className="p-3 text-left border-b text-sm font-medium cursor-pointer"
                    style={{ borderColor: themeColors.border }}
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      <span className="text-xs">{getSortIcon('status')}</span>
                    </div>
                  </th>
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
                {departments.map((department) => (
                  <tr 
                    key={department._id} 
                    className="border-b transition-colors hover:opacity-90"
                    style={{ borderColor: themeColors.border }}
                  >
                    <td className="p-3 text-sm font-medium">{department.name}</td>
                    <td className="p-3 text-sm">
                      <div className="max-w-xs truncate" title={department.description}>
                        {department.description || 'No description'}
                      </div>
                    </td>
                    <td className="p-3">
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          department.status === DEPARTMENT_STATUS.ACTIVE 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {department.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <div>
                        <div className="font-medium">{formatCreatedByName(department.createdBy)}</div>
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                          {department.createdBy?.employeeId || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{formatDate(department.createdAt)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(department)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{ backgroundColor: themeColors.primary }}
                          title="Edit Department"
                        >
                          <Edit size={14} />
                          <span className="text-xs">Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(department._id)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{
                            backgroundColor: department.status === DEPARTMENT_STATUS.ACTIVE ? themeColors.warning : themeColors.success,
                          }}
                          title={department.status === DEPARTMENT_STATUS.ACTIVE ? "Deactivate Department" : "Activate Department"}
                        >
                          {department.status === DEPARTMENT_STATUS.ACTIVE ? <EyeOff size={14} /> : <Eye size={14} />}
                          <span className="text-xs">
                            {department.status === DEPARTMENT_STATUS.ACTIVE ? "Deactivate" : "Activate"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(department._id)}
                          className="p-2 rounded text-white transition-colors hover:opacity-90 cursor-pointer flex items-center gap-1"
                          style={{
                            backgroundColor: themeColors.danger
                          }}
                          title="Delete Department"
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
                  {calculatePageNumbers(pagination.currentPage, pagination.totalPages).map(pageNum => (
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
                  ))}

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
      <CreateDepartmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onDepartmentCreated={handleDepartmentCreated}
      />

      <UpdateDepartmentModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedDepartment(null);
        }}
        department={selectedDepartment}
        onDepartmentUpdated={handleDepartmentUpdated}
      />
    </div>
  );
};

export default Departments;