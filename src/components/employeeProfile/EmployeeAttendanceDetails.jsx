// src/components/employeeProfile/EmployeeAttendanceDetails.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import attendanceAPI from '../../apis/attendanceAPI';
import { getCurrentLocation } from '../../utils/locationUtils';

// Sub-components
import AttendanceSummaryTab from './attendance/AttendanceSummaryTab';
import AttendanceRecordsTab from './attendance/AttendanceRecordsTab';
import AttendanceCalendarTab from './attendance/AttendanceCalendarTab';
import PunchInOutTab from './attendance/PunchInOutTab';

const EmployeeAttendanceDetails = ({ employee }) => {
  const { themeColors } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    summary: null,
    records: null,
    calendar: null
  });

  const hrManagerId = user.id;
  const employeeId = employee._id;
  const isSelf = hrManagerId === employeeId;

  // Common state for all tabs
  const [filters, setFilters] = useState({
    // Summary filters
    period: 'month',
    
    // Records filters
    startDate: '',
    endDate: '',
    status: '',
    page: 1,
    limit: 30,
    sortBy: 'date',
    sortOrder: 'desc',
    
    // Calendar filters
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  // Punch In/Out states
  const [punchData, setPunchData] = useState({
    loading: false,
    error: null,
    success: null,
    todayAttendance: null,
    currentLocation: null,
    showConfirmation: null
  });

  // Fetch attendance data based on active tab
  const fetchAttendanceData = async (tabType = activeTab, customFilters = null) => {
    if (!employee?._id) return;

    try {
      setLoading(true);
      
      const currentFilters = customFilters || filters;
      const params = {
        type: tabType,
        ...currentFilters
      };

      // Clean up params based on tab type
      if (tabType !== 'records') {
        delete params.startDate;
        delete params.endDate;
        delete params.status;
        delete params.page;
        delete params.limit;
        delete params.sortBy;
        delete params.sortOrder;
      }
      
      if (tabType !== 'summary') {
        delete params.period;
      }
      
      if (tabType !== 'calendar') {
        delete params.year;
        delete params.month;
      }

      console.log(`Fetching ${tabType} data with params:`, params);
      const response = await attendanceAPI.getEmployeeAttendances(employee._id, params);
      console.log(tabType, response);
      
      setAttendanceData(prev => ({
        ...prev,
        [tabType]: response.data
      }));

    } catch (error) {
      console.error(`Error fetching ${tabType} data:`, error);
      toast.error(`Failed to fetch ${tabType} data`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's attendance for punch in/out tab
  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendanceOfEmployee(employeeId);

      setPunchData(prev => ({
        ...prev,
        todayAttendance: response.data.attendance
      }));
    } catch (error) {
      console.error("Error fetching today's attendance:", error);
    }
  };

  // Fetch current location
  const fetchCurrentLocation = async () => {
    try {
      setPunchData(prev => ({ ...prev, loading: true }));
      const location = await getCurrentLocation();
      setPunchData(prev => ({
        ...prev,
        currentLocation: location
      }));
      return location;
    } catch (error) {
      const errorMsg = `Location Error: ${error.message}`;
      setPunchData(prev => ({
        ...prev,
        error: errorMsg
      }));
      toast.error(errorMsg);
      return null;
    } finally {
      setPunchData(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle punch in/out actions
  const handlePunchAction = async (action, customTime = null) => {
    try {
      setPunchData(prev => ({ 
        ...prev, 
        loading: true, 
        error: null, 
        success: null 
      }));

      let location = null;
      let punchDataPayload = {};

      if (isSelf) {
        // For self - get current location
        location = await fetchCurrentLocation();
        if (!location) {
          setPunchData(prev => ({
            ...prev,
            error: "Unable to get your location. Please enable location services."
          }));
          return;
        }
        punchDataPayload = {
          coordinates: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        };
      } else {
        // For HR manager - use custom time if provided
        punchDataPayload = customTime ? { 
          punchInTime: customTime,
          punchOutTime: customTime
        } : {};
      }

      let response;
      if (isSelf) {
        // Self punch in/out
        if (action === 'in') {
          response = await attendanceAPI.punchIn(punchDataPayload);
        } else {
          response = await attendanceAPI.punchOut(punchDataPayload);
        }
      } else {
        // HR manager punch in/out for employee
        if (action === 'in') {
          response = await attendanceAPI.punchInByHr(employeeId, punchDataPayload);
        } else {
          response = await attendanceAPI.punchOutByHr(employeeId, punchDataPayload);
        }
      }

      setPunchData(prev => ({
        ...prev,
        success: `${action === 'in' ? 'Punch in' : 'Punch out'} successful!`,
        todayAttendance: response.data.attendance,
        showConfirmation: null
      }));

      toast.success(`${action === 'in' ? 'Punch in' : 'Punch out'} successful!`);
      
      // Refresh today's attendance data
      fetchTodayAttendance();

    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || `${action === 'in' ? 'Punch in' : 'Punch out'} failed`;
      setPunchData(prev => ({
        ...prev,
        error: errorMsg
      }));
      toast.error(errorMsg);
    } finally {
      setPunchData(prev => ({ ...prev, loading: false }));
    }
  };

  // Show confirmation dialog
  const confirmPunchAction = (action) => {
    setPunchData(prev => ({
      ...prev,
      showConfirmation: action
    }));
  };

  // Cancel punch action
  const cancelPunchAction = () => {
    setPunchData(prev => ({
      ...prev,
      showConfirmation: null,
      error: null
    }));
  };

  // Handle manual time input for HR manager
  const handleManualPunch = (action, manualTime) => {
    handlePunchAction(action, manualTime);
  };

  // Initial data fetch
  useEffect(() => {
    fetchAttendanceData('summary');
    fetchAttendanceData('records');
    fetchAttendanceData('calendar');
    fetchTodayAttendance();
    if (isSelf) {
      fetchCurrentLocation();
    }
  }, [employee?._id]);

  console.log("attendanceData", attendanceData);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Always refresh data when switching tabs
    if (tab !== 'punch') {
      fetchAttendanceData(tab);
    }
  };

  // Handle filter changes - UPDATED to trigger API call
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Trigger API call with updated filters
    fetchAttendanceData(activeTab, updatedFilters);
  };

  // Refresh current tab data
  const handleRefresh = () => {
    if (activeTab === 'punch') {
      fetchTodayAttendance();
      if (isSelf) {
        fetchCurrentLocation();
      }
    } else {
      fetchAttendanceData(activeTab);
    }
  };

  const tabs = [
    { id: 'summary', name: 'Summary', icon: '📊' },
    { id: 'records', name: 'Records', icon: '📋' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'punch', name: 'Punch In/Out', icon: '⏰' }
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: themeColors.text }}>
            Attendance Details
          </h2>
          <p className="text-sm sm:text-base" style={{ color: themeColors.textSecondary }}>
            View attendance records and analytics for {employee?.name?.first} {employee?.name?.last}
            {!isSelf && " (HR Manager View)"}
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed w-full sm:w-auto"
          style={{
            backgroundColor: themeColors.primary,
            color: '#ffffff',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {/* Navigation Tabs - Responsive */}
      <div 
        className="border-b overflow-x-auto"
        style={{ borderColor: themeColors.border }}
      >
        <nav className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              disabled={loading}
              className={`py-3 px-3 sm:px-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50 flex-1 sm:flex-none min-w-0 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              style={{
                borderBottomColor: activeTab === tab.id ? themeColors.primary : 'transparent',
                color: activeTab === tab.id ? themeColors.primary : themeColors.textSecondary
              }}
            >
              <span className="text-base sm:text-lg">{tab.icon}</span>
              <span className="hidden xs:inline">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {loading && (
          <div className="flex justify-center py-8">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: themeColors.primary }}
            ></div>
          </div>
        )}

        {!loading && activeTab === 'summary' && (
          <AttendanceSummaryTab 
            data={attendanceData.summary}
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={() => fetchAttendanceData('summary')}
          />
        )}

        {!loading && activeTab === 'records' && (
          <AttendanceRecordsTab 
            data={attendanceData.records}
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={() => fetchAttendanceData('records')}
          />
        )}

        {!loading && activeTab === 'calendar' && (
          <AttendanceCalendarTab 
            data={attendanceData.calendar}
            filters={filters}
            onFilterChange={handleFilterChange}
            onRefresh={() => fetchAttendanceData('calendar')}
          />
        )}

        {!loading && activeTab === 'punch' && (
          <PunchInOutTab 
            isSelf={isSelf}
            employee={employee}
            punchData={punchData}
            onPunchAction={handlePunchAction}
            onConfirmPunch={confirmPunchAction}
            onCancelPunch={cancelPunchAction}
            onRefreshLocation={fetchCurrentLocation}
            onManualPunch={handleManualPunch}
            onRefresh={fetchTodayAttendance}
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendanceDetails;