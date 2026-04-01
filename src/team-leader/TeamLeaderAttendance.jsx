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
  CheckCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Navigation,
  List,
  Grid,
  Search
} from "lucide-react";

const TeamLeaderAttendance = () => {
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState("myAttendance");
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data states
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [myAttendanceRecords, setMyAttendanceRecords] = useState([]);
  const [teamAttendanceRecords, setTeamAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  // Frontend filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");

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
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
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
      
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      fetchTodayAttendance();
      fetchSummary();
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
      console.log('📅 Today Attendance Response:', data);
      setTodayAttendance(data.attendance);
    } catch (err) {
      console.error("Error fetching today's attendance:", err);
      // Set empty state if no attendance found
      setTodayAttendance(null);
    }
  };

  // Fetch my attendance records
  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const { data } = await attendanceAPI.getMyAttendance();
      setMyAttendanceRecords(data.attendances || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  // Fetch team attendance records
  const fetchTeamAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      try {
        response = await attendanceAPI.getTeamAttendance();
      } catch (teamErr) {
        response = await attendanceAPI.getAttendance();
      }
      
      setTeamAttendanceRecords(response.data.attendance || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error fetching team records";
      setError(errorMessage);
      
      if (err.response?.status === 403) {
        setError("Access denied. You can only view attendance of your team members.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const { data } = await attendanceAPI.getAttendanceSummary();
      console.log('📊 My Attendance Summary:', data);
      setAttendanceSummary(data.summary);
    } catch (err) {
      console.error("Error fetching summary:", err);
      setAttendanceSummary(null);
    }
  };

  // Fetch team summary
  const fetchTeamSummary = async () => {
    try {
      const { data } = await attendanceAPI.getTeamAttendanceSummary();
      console.log('📊 Team Attendance Summary:', data);
      setAttendanceSummary(data.summary);
    } catch (err) {
      console.error("Error fetching team summary:", err);
      setAttendanceSummary(null);
    }
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

  // Get status badge
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
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  // Get unique departments from team data
  const departments = useMemo(() => {
    const depts = teamAttendanceRecords
      .map(record => record.employee?.department?.name)
      .filter(dept => dept)
      .filter((dept, index, arr) => arr.indexOf(dept) === index);
    return depts;
  }, [teamAttendanceRecords]);

  // Get unique statuses from data
  const statuses = useMemo(() => {
    const currentRecords = activeTab === "myAttendance" ? myAttendanceRecords : teamAttendanceRecords;
    const statusList = currentRecords
      .map(record => record.status)
      .filter(status => status)
      .filter((status, index, arr) => arr.indexOf(status) === index);
    return statusList;
  }, [myAttendanceRecords, teamAttendanceRecords, activeTab]);

  // Frontend filtering
  const filteredRecords = useMemo(() => {
    const currentRecords = activeTab === "myAttendance" ? myAttendanceRecords : teamAttendanceRecords;
    
    return currentRecords.filter(record => {
      // Search filter
      if (searchTerm && activeTab === "teamAttendance") {
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
      
      // Department filter (only for team attendance)
      if (activeTab === "teamAttendance" && departmentFilter !== "All" && 
          record.employee?.department?.name !== departmentFilter) {
        return false;
      }
      
      return true;
    });
  }, [myAttendanceRecords, teamAttendanceRecords, activeTab, searchTerm, statusFilter, departmentFilter]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDepartmentFilter("All");
  };

  // Initialize
  useEffect(() => {
    fetchCurrentLocation();
    fetchTodayAttendance();
    fetchSummary();
  }, []);

  // Fetch summary when tab changes
  useEffect(() => {
    if (activeTab === "teamAttendance") {
      fetchTeamSummary();
    } else {
      fetchSummary();
    }
  }, [activeTab]);

  // Fetch records when tab changes
  useEffect(() => {
    if (activeTab === "myAttendance") {
      fetchMyAttendance();
    } else {
      fetchTeamAttendance();
    }
  }, [activeTab]);

  // Clear messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const currentRecords = filteredRecords;

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Track your attendance and manage team attendance
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
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
          <button
            onClick={() => {
              fetchTodayAttendance();
              if (activeTab === "myAttendance") {
                fetchSummary();
                fetchMyAttendance();
              } else {
                fetchTeamSummary();
                fetchTeamAttendance();
              }
            }}
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

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Status */}
        <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold">Today's Status</h3>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
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
                <span className="font-medium">{todayAttendance.totalWorkHours?.toFixed(2) || '0.00'}h</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4" style={{ color: themeColors.textSecondary }}>
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No attendance recorded for today</p>
              <p className="text-xs mt-1">Punch in to start tracking</p>
            </div>
          )}
        </div>

        {/* Punch In/Out Actions */}
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

        {/* Monthly Summary */}
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
                <span className="font-medium text-green-600">{attendanceSummary.stats?.present || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Late:</span>
                <span className="font-medium text-yellow-600">{attendanceSummary.stats?.late || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Absent:</span>
                <span className="font-medium text-red-600">{attendanceSummary.stats?.absent || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Percentage:</span>
                <span className="font-medium">{attendanceSummary.performance?.attendancePercentage || 0}%</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4" style={{ color: themeColors.textSecondary }}>
              <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Loading summary...</p>
              <p className="text-xs mt-1">Please wait</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        
        {/* Tabs */}
        <div className="p-4 border-b" style={{ borderColor: themeColors.border }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex space-x-1">
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
                onClick={() => setActiveTab("teamAttendance")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "teamAttendance" 
                    ? "text-white" 
                    : "hover:opacity-90"
                }`}
                style={{
                  backgroundColor: activeTab === "teamAttendance" ? themeColors.primary : themeColors.background,
                  color: activeTab === "teamAttendance" ? 'white' : themeColors.text
                }}
              >
                <Users size={16} className="inline mr-2" />
                Team Attendance
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: themeColors.textSecondary }}>View:</span>
              <div className="flex border rounded-lg" style={{ borderColor: themeColors.border }}>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "text-white" : ""}`}
                  style={{
                    backgroundColor: viewMode === "list" ? themeColors.primary : themeColors.background,
                    color: viewMode === "list" ? 'white' : themeColors.text
                  }}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "text-white" : ""}`}
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
        </div>

        {/* Filters */}
        <div className="p-4 border-b" style={{ borderColor: themeColors.border }}>
          <h3 className="text-sm font-semibold mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {activeTab === "teamAttendance" && (
              <div>
                <label className="block text-xs font-medium mb-2">Search Employee</label>
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

            <div>
              <label className="block text-xs font-medium mb-2">Status</label>
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

            {activeTab === "teamAttendance" && departments.length > 0 && (
              <div>
                <label className="block text-xs font-medium mb-2">Department</label>
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

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeColors.primary }}></div>
                <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                  Loading attendance records...
                </p>
              </div>
            </div>
          ) : currentRecords.length === 0 ? (
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
                  {activeTab === "teamAttendance" ? (
                    <p className="text-sm mt-1">Your team members haven't marked attendance yet</p>
                  ) : (
                    <p className="text-sm mt-1">No attendance records available</p>
                  )}
                </div>
              )}
            </div>
          ) : viewMode === "list" ? (
            /* List View */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Date</th>
                    {activeTab === "teamAttendance" && (
                      <>
                        <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Employee</th>
                        <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Department</th>
                      </>
                    )}
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Punch In</th>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Punch Out</th>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Work Hours</th>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Status</th>
                    <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((record) => (
                    <tr key={record._id} className="border-b hover:bg-opacity-50 transition-colors" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 text-sm">{formatDate(record.date)}</td>
                      {activeTab === "teamAttendance" && (
                        <>
                          <td className="p-3 text-sm">
                            <div className="font-medium">{formatEmployeeName(record.employee)}</div>
                            <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                              {record.employee?.employeeId}
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            {record.employee?.department?.name || 'N/A'}
                          </td>
                        </>
                      )}
                      <td className="p-3 text-sm font-medium">{formatTime(record.punchIn?.timestamp)}</td>
                      <td className="p-3 text-sm font-medium">
                        {record.punchOut?.timestamp ? formatTime(record.punchOut.timestamp) : '--:--'}
                      </td>
                      <td className="p-3 text-sm font-medium">{record.totalWorkHours?.toFixed(2)}h</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <span className={getStatusBadge(record.status)}>
                            {record.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className={record.isWithinOfficeLocation ? "text-green-500" : "text-red-500"} />
                          <span className={record.isWithinOfficeLocation ? "text-green-600 text-xs" : "text-red-600 text-xs"}>
                            {record.isWithinOfficeLocation ? "In Office" : "Outside"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRecords.map((record) => (
                <div 
                  key={record._id}
                  className="p-4 rounded-lg border transition-colors hover:shadow-md"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border 
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{formatDate(record.date)}</h4>
                      {activeTab === "teamAttendance" && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-medium">{formatEmployeeName(record.employee)}</p>
                          <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                            {record.employee?.employeeId}
                          </p>
                          <p className="text-xs" style={{ color: themeColors.textSecondary }}>
                            {record.employee?.department?.name}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <span className={getStatusBadge(record.status)}>
                        {record.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: themeColors.textSecondary }}>Punch In:</span>
                      <span className="font-medium">{formatTime(record.punchIn?.timestamp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: themeColors.textSecondary }}>Punch Out:</span>
                      <span className="font-medium">
                        {record.punchOut?.timestamp ? formatTime(record.punchOut.timestamp) : '--:--'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: themeColors.textSecondary }}>Work Hours:</span>
                      <span className="font-medium">{record.totalWorkHours?.toFixed(2)}h</span>
                    </div>
                    {record.overtimeHours > 0 && (
                      <div className="flex justify-between">
                        <span style={{ color: themeColors.textSecondary }}>Overtime:</span>
                        <span className="font-medium text-green-600">{record.overtimeHours.toFixed(2)}h</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: themeColors.border }}>
                      <span style={{ color: themeColors.textSecondary }}>Location:</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className={record.isWithinOfficeLocation ? "text-green-500" : "text-red-500"} />
                        <span className={`text-xs ${record.isWithinOfficeLocation ? "text-green-600" : "text-red-600"}`}>
                          {record.isWithinOfficeLocation ? "In Office" : "Outside"}
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

export default TeamLeaderAttendance;