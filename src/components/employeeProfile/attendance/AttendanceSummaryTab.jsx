// src/components/employeeProfile/attendance/AttendanceSummaryTab.jsx
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import AttendanceCharts from './AttendanceCharts';

const AttendanceSummaryTab = ({ data, filters, onFilterChange, onRefresh }) => {
  const { themeColors } = useTheme();

  // Handle period change with immediate API call
  const handlePeriodChange = (period) => {
    onFilterChange({ period });
  };

  if (!data) {
    return (
      <div className="text-center py-8" style={{ color: themeColors.textSecondary }}>
        No summary data available
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <label className="text-sm sm:text-base" style={{ color: themeColors.text }}>Period:</label>
        <select
          value={filters.period}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm sm:text-base flex-1 sm:flex-none"
          style={{
            borderColor: themeColors.border,
            backgroundColor: themeColors.background,
            color: themeColors.text
          }}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-lg font-medium text-sm sm:text-base w-full sm:w-auto"
          style={{
            backgroundColor: themeColors.primary,
            color: '#ffffff'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          className="p-4 sm:p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Attendance Rate</p>
              <p className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2" style={{ color: themeColors.text }}>
                {summary?.overview?.attendanceRate || 0}%
              </p>
            </div>
            <div className="text-xl sm:text-3xl">📊</div>
          </div>
        </div>

        <div 
          className="p-4 sm:p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Working Days</p>
              <p className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2" style={{ color: themeColors.text }}>
                {summary?.overview?.presentDays || 0}/{summary?.overview?.totalDays || 0}
              </p>
            </div>
            <div className="text-xl sm:text-3xl">✅</div>
          </div>
        </div>

        <div 
          className="p-4 sm:p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Total Hours</p>
              <p className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2" style={{ color: themeColors.text }}>
                {summary?.overview?.totalHours || 0}
              </p>
            </div>
            <div className="text-xl sm:text-3xl">⏱️</div>
          </div>
        </div>

        <div 
          className="p-4 sm:p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Overtime</p>
              <p className="text-lg sm:text-2xl font-bold mt-1 sm:mt-2" style={{ color: themeColors.text }}>
                {summary?.overview?.totalOvertime || 0}h
              </p>
            </div>
            <div className="text-xl sm:text-3xl">⚡</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <AttendanceCharts data={summary} themeColors={themeColors} />

      {/* Status Breakdown */}
      {summary?.analytics?.statusBreakdown && (
        <div 
          className="p-4 sm:p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}
        >
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: themeColors.text }}>Status Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {Object.entries(summary.analytics.statusBreakdown).map(([status, data]) => (
              <div key={status} className="text-center p-3 sm:p-4 rounded-lg bg-opacity-20" 
                style={{ backgroundColor: getStatusColor(status, themeColors) + '20' }}
              >
                <div className="text-lg sm:text-2xl font-bold" style={{ color: getStatusColor(status, themeColors) }}>
                  {data.count}
                </div>
                <div className="text-xs sm:text-sm mt-1 capitalize" style={{ color: themeColors.textSecondary }}>
                  {status.toLowerCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div 
          className="p-4 sm:p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}
        >
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: themeColors.text }}>Performance</h3>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <div className="flex justify-between">
              <span style={{ color: themeColors.textSecondary }}>Consistency:</span>
              <span className="font-semibold" style={{ color: themeColors.text }}>
                {summary?.performance?.consistency || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: themeColors.textSecondary }}>Improvement:</span>
              <span className="font-semibold" style={{ color: themeColors.text }}>
                {summary?.performance?.improvement || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: themeColors.textSecondary }}>Late Days:</span>
              <span className="font-semibold" style={{ color: themeColors.text }}>
                {summary?.overview?.lateDays || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: themeColors.textSecondary }}>Half Days:</span>
              <span className="font-semibold" style={{ color: themeColors.text }}>
                {summary?.overview?.halfDays || 0}
              </span>
            </div>
          </div>
        </div>

        <div 
          className="p-4 sm:p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}
        >
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: themeColors.text }}>Overtime Analysis</h3>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <div className="flex justify-between">
              <span style={{ color: themeColors.textSecondary }}>Total Overtime:</span>
              <span className="font-semibold" style={{ color: themeColors.text }}>
                {summary?.analytics?.overtimeAnalysis?.totalOvertime || 0}h
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: themeColors.textSecondary }}>Average per Day:</span>
              <span className="font-semibold" style={{ color: themeColors.text }}>
                {summary?.analytics?.overtimeAnalysis?.averageOvertime || 0}h
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: themeColors.textSecondary }}>Max Overtime:</span>
              <span className="font-semibold" style={{ color: themeColors.text }}>
                {summary?.analytics?.overtimeAnalysis?.maxOvertime || 0}h
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: themeColors.textSecondary }}>Overtime Days:</span>
              <span className="font-semibold" style={{ color: themeColors.text }}>
                {summary?.analytics?.overtimeAnalysis?.overtimeDays || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get status colors
const getStatusColor = (status, themeColors) => {
  const colors = {
    'Present': themeColors.success,
    'Absent': themeColors.danger,
    'Late': themeColors.warning,
    'Half Day': themeColors.primary,
    'On Leave': themeColors.accent,
    'Holiday': themeColors.purple || '#8B5CF6',
    'Week Off': themeColors.blue || '#3B82F6',
    'Early Departure': themeColors.orange || '#F50f77',
    'Not Recorded': themeColors.textSecondary
  };
  return colors[status] || themeColors.textSecondary;
};

export default AttendanceSummaryTab;