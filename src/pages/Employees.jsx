// src/components/Employees.jsx
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import employeeAPI from "../apis/employeeAPI";
import CreateEmployeeModal from "./modals/CreateEmployeeModal";
import UpdateEmployeeModal from "./modals/UpdateEmployeeModal";
import FormLinks from "../components/FormLinks";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const Employees = () => {
  const { themeColors } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Tabs
  const [activeTab, setActiveTab] = useState('employees');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Pre-fill CreateEmployeeModal from a form submission
  const [prefillData, setPrefillData] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    designation: "",
    isActive: "",
    page: 1,
    limit: 1000
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate pagination
  const totalItems = employees.length;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'all' ? totalItems : startIndex + itemsPerPage;
  const paginatedEmployees = employees.slice(startIndex, endIndex);

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value === 'all' ? 'all' : parseInt(value));
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Debounced search to prevent excessive API calls
  const debouncedSearch = useDebounce(filters.search, 500);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch employees with filters
  const fetchEmployees = useCallback(async () => {
    try {
      setIsSearching(true);
      
      const queryParams = {};
      if (debouncedSearch) queryParams.search = debouncedSearch;
      if (filters.role) queryParams.role = filters.role;
      // Remove designation filter as it causes backend error
      // if (filters.designation) queryParams.designation = filters.designation;
      if (filters.isActive !== '') queryParams.isActive = filters.isActive;
      if (filters.page) queryParams.page = filters.page;
      if (filters.limit) queryParams.limit = filters.limit;

      const { data } = await employeeAPI.getEmployeesAddedByMe(queryParams);
      
      // Apply designation filter on frontend if needed
      let filteredEmployees = data.employees || [];
      if (filters.designation) {
        const designationLower = filters.designation.toLowerCase();
        filteredEmployees = filteredEmployees.filter(emp => {
          const empDesignation = typeof emp.designation === 'string' 
            ? emp.designation 
            : emp.designation?.title || '';
          return empDesignation.toLowerCase().includes(designationLower);
        });
      }
      
      setEmployees(filteredEmployees);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching employees");
    } finally {
      setIsSearching(false);
    }
  }, [debouncedSearch, filters.role, filters.designation, filters.isActive, filters.page, filters.limit]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  // Toggle employee status
  const handleToggleStatus = async (id) => {
    try {
      const { data } = await employeeAPI.toggleStatus(id);
      setEmployees(employees.map(emp =>
        emp._id === id ? { ...emp, isActive: !emp.isActive } : emp
      ));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error updating status");
    }
  };

  // Delete employee
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      return;
    }

    try {
      await employeeAPI.deleteHRManager(id);
      setEmployees(employees.filter(emp => emp._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error deleting employee");
    }
  };

  const handleProfileClick = async (id) => {
    navigate(`/employee-profile/${id}`);
  };

  // Handle employee creation
  const handleEmployeeCreated = (newEmployee) => {
    setEmployees(prev => [newEmployee, ...prev]);
    setShowCreateModal(false);
  };

  // Handle employee update
  const handleEmployeeUpdated = (updatedEmployee) => {
    setEmployees(prev => prev.map(emp =>
      emp._id === updatedEmployee._id ? updatedEmployee : emp
    ));
    setShowUpdateModal(false);
    setSelectedEmployee(null);
  };

  // Start editing an employee
  const startEditing = (employee) => {
    setSelectedEmployee(employee);
    setShowUpdateModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: "",
      role: "",
      designation: "",
      isActive: "",
      page: 1,
      limit: 1000
    });
  };

  // Helper function to safely get designation title
  const getDesignationTitle = (designation) => {
    if (!designation) return 'N/A';
    if (typeof designation === 'string') return designation;
    if (typeof designation === 'object' && designation.title) return designation.title;
    return 'N/A';
  };

  // Helper function to safely get manager name
  const getManagerName = (manager) => {
    if (!manager) return 'N/A';
    if (typeof manager === 'string') return manager;
    if (typeof manager === 'object' && manager.name) {
      return `${manager.name.first || ''} ${manager.name.last || ''}`.trim() || 'N/A';
    }
    return 'N/A';
  };

  // Helper function to get department name
  const getDepartmentName = (department) => {
    if (!department) return 'N/A';
    if (typeof department === 'string') return department;
    if (typeof department === 'object' && department.name) return department.name;
    return 'N/A';
  };

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        const { data } = await employeeAPI.getEmployeesAddedByMe({ page: 1, limit: 1000 });
        setEmployees(data.employees || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Error fetching employees");
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, []);

  // Filter changes (excluding search)
  useEffect(() => {
    if (!loading) {
      fetchEmployees();
    }
  }, [fetchEmployees, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: themeColors.text }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border bg-red-50 border-red-200 text-red-700">
        <div className="flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-sm font-medium">Dismiss</button>
        </div>
      </div>
    );
  }

  const handleConvertToEmployee = (submission) => {
    setPrefillData({
      name: { first: submission.firstName, last: submission.lastName },
      email: submission.email,
      mobile: submission.mobile,
      alternateMobile: submission.alternateMobile || '',
      whatsappNumber: submission.whatsappNumber || '',
      gender: submission.gender || '',
      dob: submission.dob ? new Date(submission.dob).toISOString().split('T')[0] : '',
      address: {
        street: submission.street || '',
        city: submission.city || '',
        state: submission.state || '',
        country: submission.country || 'India',
        pincode: submission.pincode || ''
      }
    });
    setActiveTab('employees');
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees Management</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Manage employees added by you
          </p>
        </div>
        {activeTab === 'employees' && (
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg border font-medium"
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
              className="px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: themeColors.primary }}
            >
              + Add Employee
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: themeColors.background }}>
        {[{ key: 'employees', label: '👥 Employees' }, { key: 'formlinks', label: '🔗 Form Links' }].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.key ? themeColors.surface : 'transparent',
              color: activeTab === tab.key ? themeColors.primary : themeColors.textSecondary,
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Links Tab */}
      {activeTab === 'formlinks' && (
        <FormLinks onConvertToEmployee={handleConvertToEmployee} />
      )}

      {activeTab === 'employees' && <>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{employees.length}</div>
          <div className="text-sm">Total Employees</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>{employees.filter(e => e.isActive).length}</div>
          <div className="text-sm">Active Employees</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.danger }}>{employees.filter(e => !e.isActive).length}</div>
          <div className="text-sm">Inactive Employees</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>
            {new Set(employees.map(e => getDesignationTitle(e.designation))).size}
          </div>
          <div className="text-sm">Designations</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, designation..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full p-2 rounded-md border text-sm pr-8"
                style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
              />
              {isSearching && (
                <div className="absolute right-2 top-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: themeColors.primary }}></div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full p-2 rounded-md border text-sm"
              style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
            >
              <option value="">All Roles</option>
              <option value="HR_Manager">HR Manager</option>
              <option value="Team_Leader">Team Leader</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Designation</label>
            <input
              type="text"
              placeholder="Filter by designation..."
              value={filters.designation}
              onChange={(e) => handleFilterChange('designation', e.target.value)}
              className="w-full p-2 rounded-md border text-sm"
              style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.isActive}
              onChange={(e) => handleFilterChange('isActive', e.target.value)}
              className="w-full p-2 rounded-md border text-sm"
              style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="p-6 rounded-lg shadow-sm overflow-x-auto" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Employees List</h2>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Showing {employees.length} employees
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-8" style={{ color: themeColors.textSecondary }}>
            <p>No employees found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-3 px-4 py-2 rounded-lg font-medium text-white"
              style={{ backgroundColor: themeColors.primary }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ backgroundColor: themeColors.background }}>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Employee ID</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Name</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Email</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Mobile</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Role</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Manager</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Designation</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Department</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Salary</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Joined On</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Status</th>
                <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.map((employee) => (
                <tr key={employee._id} className="border-b" style={{ borderColor: themeColors.border }}>
                  <td className="p-3 text-sm">{employee.employeeId}</td>
                  <td className="p-3 text-sm">{employee.name?.first} {employee.name?.last}</td>
                  <td className="p-3 text-sm">{employee.email}</td>
                  <td className="p-3 text-sm">{employee.mobile}</td>
                  <td className="p-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      employee.role === 'HR_Manager' ? 'bg-purple-100 text-purple-800' :
                      employee.role === 'Team_Leader' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.role}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{getManagerName(employee.manager)}</td>
                  <td className="p-3 text-sm">{getDesignationTitle(employee.designation)}</td>
                  <td className="p-3 text-sm">{getDepartmentName(employee.department)}</td>
                  <td className="p-3 text-sm">₹{employee.salary?.toLocaleString()}</td>
                  <td className="p-3 text-sm">{formatDate(employee.dateOfJoining)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${employee.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(employee)}
                        className="px-3 py-1 rounded text-xs text-white cursor-pointer"
                        style={{ backgroundColor: themeColors.primary }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(employee._id)}
                        className="px-3 py-1 rounded text-white text-xs border cursor-pointer flex items-center gap-1"
                        style={{
                          backgroundColor: employee.isActive ? themeColors.danger : themeColors.success,
                          borderColor: themeColors.border
                        }}
                      >
                        {employee.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        {/* <span>{employee.isActive ? 'Deactivate' : 'Activate'}</span> */}
                      </button>
                      <button
                        onClick={() => handleProfileClick(employee._id)}
                        className="px-3 py-1 rounded text-white text-xs border border-green-300 cursor-pointer"
                        style={{
                          backgroundColor: themeColors.success
                        }}
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="px-3 py-1 rounded text-white text-xs border border-red-300 cursor-pointer"
                        style={{
                          backgroundColor: themeColors.danger
                        }}
                      >
                        Delete
                      </button>
                    </div>
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
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
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
                  onClick={() => handlePageChange(currentPage - 1)}
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
                  onClick={() => handlePageChange(currentPage + 1)}
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

      {/* Modals */}
      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setPrefillData(null); }}
        onEmployeeCreated={handleEmployeeCreated}
        prefillData={prefillData}
      />

      <UpdateEmployeeModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onEmployeeUpdated={handleEmployeeUpdated}
      />
      </>}
    </div>
  );
};

export default Employees;