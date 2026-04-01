import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/ThemeContext";
import attendanceAPI from "../apis/attendanceAPI";
import { getCurrentLocation } from "../utils/locationUtils";
import { 
  Clock, 
  MapPin, 
  Calendar, 
  Users, 
  User, 
  Grid, 
  List, 
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Navigation,
  Search
} from "lucide-react";

const Attendance = () => {
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState("myAttendance");
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data states
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [myAttendance, setMyAttendance] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  // Frontend filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [designationFilter, setDesignationFilter] = useState("All");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [currentLocation, setCurrentLocation] = useState(null);

  // Fetch current location
  const fetchCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setError(null);
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      return location;
    } catch (err) {
      setError(`Location Error: ${err.message}`);
      return null;
    } finally {
      setLocationLoading(false);
    }
  };

  // Punch In handler
  const handlePunchIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const location = await fetchCurrentLocation();
      if (!location) {
        setError("Unable to get your location. Please enable location services.");
        return;
      }

      const punchInData = {
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      };

      const { data } = await attendanceAPI.punchIn(punchInData);
      setTodayAttendance(data.attendance);
      setSuccess("Punch in successful!");
      
      fetchTodayAttendance();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Punch in failed");
    } finally {
      setLoading(false);
    }
  };

  // Punch Out handler
  const handlePunchOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const location = await fetchCurrentLocation();
      if (!location) {
        setError("Unable to get your location. Please enable location services.");
        return;
      }

      const punchOutData = {
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      };

      const { data } = await attendanceAPI.punchOut(punchOutData);
      setTodayAttendance(data.attendance);
      setSuccess("Punch out successful!");
      
      fetchTodayAttendance();
      fetchAttendanceSummary();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Punch out failed");
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's attendance
  const fetchTodayAttendance = async () => {
    try {
      const { data } = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(data.attendance);
    } catch (err) {
      console.error("Error fetching today's attendance:", err);
    }
  };

  // Fetch my attendance records
  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await attendanceAPI.getMyAttendance();
      setMyAttendance(data.attendances || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching attendance records");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all attendance (for managers/HR)
  const fetchAllAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await attendanceAPI.getAttendance();
      setAllAttendance(data.attendance || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching all attendance");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance summary
  const fetchAttendanceSummary = async () => {
    try {
      const { data } = await attendanceAPI.getAttendanceSummary();
      setAttendanceSummary(data.summary);
    } catch (err) {
      console.error("Error fetching attendance summary:", err);
    }
  };

  const handlePageRefresh = async () => {
    setLoading(true);
    await Promise.all([
      fetchAllAttendance(),
      fetchAttendanceSummary(),
      fetchMyAttendance(),
      fetchTodayAttendance()
    ]);
    clearFilters();
    setLoading(false);
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format employee name
  const formatEmployeeName = (employee) => {
    if (!employee) return 'N/A';
    
    if (typeof employee.name === 'string') {
      return employee.name;
    }
    
    if (employee.name && typeof employee.name === 'object') {
      const { first, last } = employee.name;
      return `${first || ''} ${last || ''}`.trim() || 'N/A';
    }
    
    return 'N/A';
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    
    switch (status) {
      case "Present":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Late":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Early Departure":
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case "Half Day":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "Absent":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "On Leave":
        return `${baseClasses} bg-purple-100 text-purple-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Present":
        return <CheckCircle size={16} className="text-green-500" />;
      case "Late":
      case "Early Departure":
        return <AlertCircle size={16} className="text-yellow-500" />;
      case "Absent":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  // Get unique departments from all attendance data
  const departments = useMemo(() => {
    const depts = allAttendance
      .map(record => record.employee?.department?.name)
      .filter(dept => dept)
      .filter((dept, index, arr) => arr.indexOf(dept) === index);
    return depts;
  }, [allAttendance]);

  // Get unique designations from all attendance data
  const designations = useMemo(() => {
    const desigs = allAttendance
      .map(record => record.employee?.designation?.title)
      .filter(desig => desig)
      .filter((desig, index, arr) => arr.indexOf(desig) === index);
    return desigs;
  }, [allAttendance]);

  // Get unique statuses from data
  const statuses = useMemo(() => {
    const currentRecords = activeTab === "myAttendance" ? myAttendance : allAttendance;
    const statusList = currentRecords
      .map(record => record.status)
      .filter(status => status)
      .filter((status, index, arr) => arr.indexOf(status) === index);
    return statusList;
  }, [myAttendance, allAttendance, activeTab]);

  // Frontend filtering
  const filteredRecords = useMemo(() => {
    const currentRecords = activeTab === "myAttendance" ? myAttendance : allAttendance;
    
    return currentRecords.filter(record => {
      // Search filter
      if (searchTerm && activeTab === "allAttendance") {
        const employeeName = formatEmployeeName(record.employee).toLowerCase();
        const employeeId = record.employee?.employeeId?.toLowerCase() || "";
        const searchLower = searchTerm.toLowerCase();
        
        if (!employeeName.includes(searchLower) && !employeeId.includes(searchLower)) {
          return false;
        }
      }
      
      // Status filter
      if (statusFilter !== "All" && record.status !== statusFilter) {
        return false;
      }
      
      // Department filter (only for all attendance)
      if (activeTab === "allAttendance" && departmentFilter !== "All" && 
          record.employee?.department?.name !== departmentFilter) {
        return false;
      }
      
      // Designation filter (only for all attendance)
      if (activeTab === "allAttendance" && designationFilter !== "All" && 
          record.employee?.designation?.title !== designationFilter) {
        return false;
      }
      
      return true;
    });
  }, [myAttendance, allAttendance, activeTab, searchTerm, statusFilter, departmentFilter, designationFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDepartmentFilter("All");
    setDesignationFilter("All");
    setCurrentPage(1);
  };

  // Calculate pagination
  const totalItems = filteredRecords.length;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalItems / itemsPerPage);
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'all' ? totalItems : startIndex + itemsPerPage;

  // Paginated records
  const paginatedRecords = useMemo(() => {
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, startIndex, endIndex]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, departmentFilter, designationFilter, activeTab, itemsPerPage]);

  // Initialize component
  useEffect(() => {
    fetchCurrentLocation();
    fetchTodayAttendance();
    fetchAttendanceSummary();
  }, []);

  // Fetch data when active tab changes
  useEffect(() => {
    if (activeTab === "myAttendance") {
      fetchMyAttendance();
    } else if (activeTab === "allAttendance") {
      fetchAllAttendance();
    }
  }, [activeTab]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const currentAttendance = paginatedRecords;

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Track and manage employee attendance
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={handlePageRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh 
          </button>
          <button
            onClick={fetchCurrentLocation}
            disabled={locationLoading}
            className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90 flex items-center gap-2"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            <Navigation size={16} className={locationLoading ? "animate-spin" : ""} />
            Location
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: themeColors.danger + '20', 
          borderColor: themeColors.danger,
          color: themeColors.danger
        }}>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: themeColors.success + '20', 
          borderColor: themeColors.success,
          color: themeColors.success
        }}>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Location Display */}
      {currentLocation && (
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: themeColors.info + '10', 
          borderColor: themeColors.info,
          color: themeColors.info
        }}>
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>Current Location: {currentLocation.address}</span>
          </div>
          <div className="text-xs mt-1 opacity-75">
            Accuracy: ±{currentLocation.accuracy?.toFixed(1)} meters
          </div>
        </div>
      )}

      {/* Punch In/Out Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Status Card */}
        <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold">Today's Status</h3>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          {todayAttendance ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Punch In:</span>
                <span className="font-medium">{formatTime(todayAttendance.punchIn?.timestamp)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Punch Out:</span>
                <span className="font-medium">
                  {todayAttendance.punchOut?.timestamp 
                    ? formatTime(todayAttendance.punchOut.timestamp)
                    : '--:--'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <span className={getStatusBadge(todayAttendance.status)}>
                  {todayAttendance.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Work Hours:</span>
                <span className="font-medium">{todayAttendance.totalWorkHours?.toFixed(2)}h</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4" style={{ color: themeColors.textSecondary }}>
              <p>No attendance recorded for today</p>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="flex items-center gap-3 mb-4">
            <Clock size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold">Quick Actions</h3>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                Mark your attendance
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handlePunchIn}
              disabled={loading || locationLoading || (todayAttendance && todayAttendance.punchIn)}
              className="w-full py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: themeColors.success }}
            >
              <Clock size={18} />
              {todayAttendance?.punchIn ? 'Already Punched In' : 'Punch In'}
            </button>
            
            <button
              onClick={handlePunchOut}
              disabled={loading || locationLoading || !todayAttendance?.punchIn || todayAttendance?.punchOut}
              className="w-full py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: themeColors.danger }}
            >
              <Clock size={18} />
              {todayAttendance?.punchOut ? 'Already Punched Out' : 'Punch Out'}
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold">This Month</h3>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                Attendance Summary
              </p>
            </div>
          </div>
          
          {attendanceSummary ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Present:</span>
                <span className="font-medium text-green-600">{attendanceSummary.stats.present}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Late:</span>
                <span className="font-medium text-yellow-600">{attendanceSummary.stats.late}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Absent:</span>
                <span className="font-medium text-red-600">{attendanceSummary.stats.absent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Percentage:</span>
                <span className="font-medium">{attendanceSummary.performance.attendancePercentage}%</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4" style={{ color: themeColors.textSecondary }}>
              <p>Loading summary...</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        
        {/* Tabs Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border-b" style={{ borderColor: themeColors.border }}>
          <div className="flex space-x-1 mb-4 md:mb-0">
            <button
              onClick={() => setActiveTab("myAttendance")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "myAttendance" 
                  ? "text-white" 
                  : "hover:opacity-90"
              }`}
              style={{
                backgroundColor: activeTab === "myAttendance" ? themeColors.primary : themeColors.background,
                color: activeTab === "myAttendance" ? 'white' : themeColors.text
              }}
            >
              <User size={16} className="inline mr-2" />
              My Attendance
            </button>
            <button
              onClick={() => setActiveTab("allAttendance")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "allAttendance" 
                  ? "text-white" 
                  : "hover:opacity-90"
              }`}
              style={{
                backgroundColor: activeTab === "allAttendance" ? themeColors.primary : themeColors.background,
                color: activeTab === "allAttendance" ? 'white' : themeColors.text
              }}
            >
              <Users size={16} className="inline mr-2" />
              All Attendance
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: themeColors.textSecondary }}>View:</span>
            <div className="flex border rounded-lg" style={{ borderColor: themeColors.border }}>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "text-white" : ""}`}
                style={{
                  backgroundColor: viewMode === "list" ? themeColors.primary : themeColors.background,
                  color: viewMode === "list" ? 'white' : themeColors.text
                }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "text-white" : ""}`}
                style={{
                  backgroundColor: viewMode === "grid" ? themeColors.primary : themeColors.background,
                  color: viewMode === "grid" ? 'white' : themeColors.text
                }}
              >
                <Grid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-4 border-b" style={{ borderColor: themeColors.border }}>
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            {activeTab === "allAttendance" && (
              <div>
                <label className="block text-sm font-medium mb-2">Search Employee</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: themeColors.textSecondary }} />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-md border text-sm"
                    style={{ 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border, 
                      color: themeColors.text 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 rounded-md border text-sm"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text 
                }}
              >
                <option value="All">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            {activeTab === "allAttendance" && departments.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full p-2 rounded-md border text-sm"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }}
                >
                  <option value="All">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Designation Filter */}
            {activeTab === "allAttendance" && designations.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Designation</label>
                <select
                  value={designationFilter}
                  onChange={(e) => setDesignationFilter(e.target.value)}
                  className="w-full p-2 rounded-md border text-sm"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text 
                  }}
                >
                  <option value="All">All Designations</option>
                  {designations.map(desig => (
                    <option key={desig} value={desig}>{desig}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90 text-sm"
                style={{
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.primary }}></div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8" style={{ color: themeColors.textSecondary }}>
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              {searchTerm ? (
                <div>
                  <p>No results found for "{searchTerm}"</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="mt-3 px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90 text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div>
                  <p>No attendance records found</p>
                  <p className="text-sm mt-1">No attendance records available</p>
                </div>
              )}
            </div>
          ) : viewMode === "list" ? (
            /* List View */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                      Date
                    </th>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                      Employee
                    </th>
                    {activeTab === "allAttendance" && (
                      <>
                        <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                          Department
                        </th>
                        <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                          Designation
                        </th>
                      </>
                    )}
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                      Punch In
                    </th>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                      Punch Out
                    </th>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                      Work Hours
                    </th>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                      Status
                    </th>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentAttendance.map((attendance) => (
                    <tr key={attendance._id} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 text-sm">
                        {formatDate(attendance.date)}
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-medium">
                          {formatEmployeeName(attendance.employee)}
                        </div>
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                          {attendance.employee?.employeeId || ''}
                        </div>
                      </td>
                      {activeTab === "allAttendance" && (
                        <>
                          <td className="p-3 text-sm">
                            {attendance.employee?.department?.name || 'N/A'}
                          </td>
                          <td className="p-3 text-sm">
                            {attendance.employee?.designation?.title || 'N/A'}
                          </td>
                        </>
                      )}
                      <td className="p-3 text-sm">
                        <div className="font-medium">{formatTime(attendance.punchIn?.timestamp)}</div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-medium">
                          {attendance.punchOut?.timestamp 
                            ? formatTime(attendance.punchOut.timestamp)
                            : '--:--'
                          }
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="font-medium">{attendance.totalWorkHours?.toFixed(2)}h</div>
                        {attendance.overtimeHours > 0 && (
                          <div className="text-xs text-green-600">
                            OT: {attendance.overtimeHours.toFixed(2)}h
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(attendance.status)}
                          <span className={getStatusBadge(attendance.status)}>
                            {attendance.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className={attendance.isWithinOfficeLocation ? "text-green-500" : "text-red-500"} />
                          <span className={attendance.isWithinOfficeLocation ? "text-green-600" : "text-red-600"}>
                            {attendance.isWithinOfficeLocation ? "Within Office" : "Outside Office"}
                          </span>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length} entries
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
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentAttendance.map((attendance) => (
                <div 
                  key={attendance._id} 
                  className="p-4 rounded-lg border transition-colors hover:shadow-md"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border 
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{formatDate(attendance.date)}</h4>
                      {activeTab === "allAttendance" && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{formatEmployeeName(attendance.employee)}</p>
                          <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                            {attendance.employee?.employeeId} • {attendance.employee?.department?.name}
                          </p>
                          <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                            {attendance.employee?.designation?.title}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(attendance.status)}
                      <span className={getStatusBadge(attendance.status)}>
                        {attendance.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: themeColors.textSecondary }}>Punch In:</span>
                      <span className="font-medium">{formatTime(attendance.punchIn?.timestamp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: themeColors.textSecondary }}>Punch Out:</span>
                      <span className="font-medium">
                        {attendance.punchOut?.timestamp 
                          ? formatTime(attendance.punchOut.timestamp)
                          : '--:--'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: themeColors.textSecondary }}>Work Hours:</span>
                      <span className="font-medium">{attendance.totalWorkHours?.toFixed(2)}h</span>
                    </div>
                    {attendance.overtimeHours > 0 && (
                      <div className="flex justify-between">
                        <span style={{ color: themeColors.textSecondary }}>Overtime:</span>
                        <span className="font-medium text-green-600">{attendance.overtimeHours.toFixed(2)}h</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span style={{ color: themeColors.textSecondary }}>Location:</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className={attendance.isWithinOfficeLocation ? "text-green-500" : "text-red-500"} />
                        <span className={`text-xs ${attendance.isWithinOfficeLocation ? "text-green-600" : "text-red-600"}`}>
                          {attendance.isWithinOfficeLocation ? "In Office" : "Outside"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;