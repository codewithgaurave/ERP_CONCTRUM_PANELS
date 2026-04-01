// src/components/employeeProfile/attendance/AttendanceCalendarTab.jsx
import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

const AttendanceCalendarTab = ({ data, filters, onFilterChange, onRefresh }) => {
  const { themeColors } = useTheme();
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  // Handle month navigation with immediate API call
  const handleMonthChange = (newYear, newMonth) => {
    onFilterChange({ year: newYear, month: newMonth });
  };

  const handlePreviousMonth = () => {
    let newYear = filters.year;
    let newMonth = filters.month - 1;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    handleMonthChange(newYear, newMonth);
  };

  const handleNextMonth = () => {
    let newYear = filters.year;
    let newMonth = filters.month + 1;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    
    handleMonthChange(newYear, newMonth);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    handleMonthChange(now.getFullYear(), now.getMonth() + 1);
  };

  // Handle day click for mobile
  const handleDayClick = (day) => {
    setSelectedDay(day);
    setShowDayModal(true);
  };

  if (!data) {
    return (
      <div className="text-center py-8" style={{ color: themeColors.textSecondary }}>
        No calendar data available
      </div>
    );
  }

  const { calendar } = data;

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Present': themeColors.success,
      'Absent': themeColors.danger,
      'Late': themeColors.warning,
      'Half Day': themeColors.info,
      'On Leave': themeColors.secondary,
      'Holiday': themeColors.purple || '#8B5CF6',
      'Week Off': themeColors.blue || '#3B82F6',
      'Early Departure': themeColors.orange || '#F59E0B',
      'Not Recorded': themeColors.border
    };
    return colors[status] || themeColors.border;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-lg border hover:bg-opacity-10 transition-colors"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.background,
              color: themeColors.text
            }}
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left" style={{ color: themeColors.text }}>
            {calendar.monthName} {calendar.year}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg border hover:bg-opacity-10 transition-colors"
            style={{
              borderColor: themeColors.border,
              backgroundColor: themeColors.background,
              color: themeColors.text
            }}
          >
            <ChevronRight size={20} />
          </button>
          
          <button
            onClick={handleCurrentMonth}
            className="px-3 sm:px-4 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: themeColors.primary,
              color: '#ffffff'
            }}
          >
            Today
          </button>
        </div>
        
        <div className="text-center sm:text-right">
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            {calendar.summary?.workingDays || 0} working days
          </div>
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            {calendar.summary?.attendanceRate || 0}% attendance rate
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div 
        className="rounded-xl border overflow-hidden"
        style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}
      >
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor: themeColors.border }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div 
              key={day}
              className="p-2 sm:p-4 text-center font-medium text-xs sm:text-sm"
              style={{ color: themeColors.textSecondary }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendar.data?.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`min-h-16 sm:min-h-32 border p-1 sm:p-2 transition-colors cursor-pointer hover:bg-opacity-10 ${
                day.isToday ? 'ring-2 ring-blue-500' : ''
              } ${day.status !== 'Not Recorded' ? 'hover:bg-gray-100' : ''}`}
              style={{ 
                borderColor: themeColors.border,
                backgroundColor: day.isToday ? themeColors.primary + '10' : 'transparent'
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <span 
                  className={`text-xs sm:text-sm font-medium ${
                    day.isToday ? 'text-blue-600' : day.isCurrentMonth ? '' : 'text-gray-400'
                  }`}
                  style={{ 
                    color: day.isToday ? themeColors.primary : 
                           day.isCurrentMonth ? themeColors.text : themeColors.textSecondary
                  }}
                >
                  {day.day}
                </span>
              </div>

              {/* Status Indicator */}
              <div 
                className="w-full h-1 sm:h-2 rounded-full mb-1"
                style={{ backgroundColor: getStatusColor(day.status) }}
              />

              {/* Attendance Details - Hidden on mobile, shown on desktop */}
              <div className="hidden sm:block space-y-1 text-xs">
                {day.punchIn && (
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>In:</span>
                    <span style={{ color: themeColors.text }}>{day.punchIn}</span>
                  </div>
                )}
                
                {day.punchOut && (
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Out:</span>
                    <span style={{ color: themeColors.text }}>{day.punchOut}</span>
                  </div>
                )}
                
                {day.workHours > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>Hours:</span>
                    <span style={{ color: themeColors.text }}>{day.workHours.toFixed(1)}h</span>
                  </div>
                )}
                
                {day.overtime > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: themeColors.textSecondary }}>OT:</span>
                    <span style={{ color: themeColors.text }}>{day.overtime.toFixed(1)}h</span>
                  </div>
                )}
              </div>

              {/* Status Badge - Mobile only */}
              <div className="sm:hidden">
                <span 
                  className="inline-block px-1 py-0.5 rounded-full text-[10px] font-medium capitalize"
                  style={{ 
                    backgroundColor: getStatusColor(day.status) + '20',
                    color: getStatusColor(day.status)
                  }}
                >
                  {day.status.charAt(0)}
                </span>
              </div>

              {/* Status Badge - Desktop only */}
              <div className="hidden sm:block mt-1">
                <span 
                  className="inline-block px-2 py-1 rounded-full text-xs font-medium capitalize"
                  style={{ 
                    backgroundColor: getStatusColor(day.status) + '20',
                    color: getStatusColor(day.status)
                  }}
                >
                  {day.status.toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center text-xs sm:text-sm">
        {['Present', 'Absent', 'Late', 'Half Day', 'On Leave', 'Holiday', 'Week Off', 'Early Departure', 'Not Recorded'].map(status => (
          <div key={status} className="flex items-center gap-1 sm:gap-2">
            <div 
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
              style={{ backgroundColor: getStatusColor(status) }}
            />
            <span style={{ color: themeColors.text }}>
              {window.innerWidth < 640 ? status.charAt(0) : status}
            </span>
          </div>
        ))}
      </div>

      {/* Month Summary */}
      {calendar.summary && (
        <div 
          className="p-4 sm:p-6 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}
        >
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold" style={{ color: themeColors.primary }}>
              {calendar.summary.totalDays}
            </div>
            <div className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Total Days</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold" style={{ color: themeColors.success }}>
              {calendar.summary.workingDays}
            </div>
            <div className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Working Days</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold" style={{ color: themeColors.info }}>
              {parseFloat(calendar.summary.totalHours).toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Total Hours</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold" style={{ color: themeColors.warning }}>
              {parseFloat(calendar.summary.totalOvertime).toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Overtime</div>
          </div>
        </div>
      )}

      {/* Day Details Modal for Mobile */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4 sm:p-6">
          <div 
            className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            style={{ 
              backgroundColor: themeColors.surface,
              color: themeColors.text
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Attendance Details</h3>
              <button
                onClick={() => setShowDayModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                style={{ color: themeColors.text }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                  {selectedDay.day} {calendar.monthName}
                </div>
                <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                  {selectedDay.dayOfWeek}
                </div>
              </div>

              <div className="text-center">
                <span 
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium capitalize"
                  style={{ 
                    backgroundColor: getStatusColor(selectedDay.status) + '20',
                    color: getStatusColor(selectedDay.status)
                  }}
                >
                  {selectedDay.status.toLowerCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: themeColors.background }}>
                  <div style={{ color: themeColors.textSecondary }}>Punch In</div>
                  <div className="font-semibold mt-1" style={{ color: themeColors.text }}>
                    {selectedDay.punchIn || '--:--'}
                  </div>
                </div>

                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: themeColors.background }}>
                  <div style={{ color: themeColors.textSecondary }}>Punch Out</div>
                  <div className="font-semibold mt-1" style={{ color: themeColors.text }}>
                    {selectedDay.punchOut || '--:--'}
                  </div>
                </div>

                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: themeColors.background }}>
                  <div style={{ color: themeColors.textSecondary }}>Work Hours</div>
                  <div className="font-semibold mt-1" style={{ color: themeColors.text }}>
                    {selectedDay.workHours > 0 ? selectedDay.workHours.toFixed(1) + 'h' : '--'}
                  </div>
                </div>

                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: themeColors.background }}>
                  <div style={{ color: themeColors.textSecondary }}>Overtime</div>
                  <div className="font-semibold mt-1" style={{ color: themeColors.text }}>
                    {selectedDay.overtime > 0 ? selectedDay.overtime.toFixed(1) + 'h' : '--'}
                  </div>
                </div>
              </div>

              {selectedDay.notes && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: themeColors.background }}>
                  <div className="text-sm font-medium mb-2" style={{ color: themeColors.textSecondary }}>
                    Notes
                  </div>
                  <div className="text-sm" style={{ color: themeColors.text }}>
                    {selectedDay.notes}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowDayModal(false)}
              className="w-full mt-6 py-3 rounded-lg font-medium text-white"
              style={{ backgroundColor: themeColors.primary }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendarTab;