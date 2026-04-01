// src/components/employeeProfile/attendance/AttendanceCharts.jsx
import React from 'react';

const AttendanceCharts = ({ data, themeColors }) => {
  if (!data?.analytics) return null;

  const { dailyTrend, weeklyTrend, monthlyTrend, statusBreakdown } = data.analytics;

  // Simple bar chart for daily trend (last 7 days)
  const recentDays = dailyTrend.slice(-7);
  
  // Status distribution for pie chart
  const statusData = Object.entries(statusBreakdown).map(([status, info]) => ({
    status,
    count: info.count,
    color: getStatusColor(status, themeColors)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Daily Trend Chart */}
      <div 
        className="p-4 sm:p-6 rounded-xl border"
        style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}
      >
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: themeColors.text }}>
          Daily Trend (Last 7 Days)
        </h3>
        <div className="space-y-2">
          {recentDays.map((day, index) => {
            const total = day.present + day.absent + day.late + day.halfDay + day.earlyDeparture;
            const presentPercentage = total > 0 ? (day.present / total) * 100 : 0;
            const latePercentage = total > 0 ? (day.late / total) * 100 : 0;
            
            return (
              <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                <span className="w-12 sm:w-20" style={{ color: themeColors.textSecondary }}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <div className="flex-1 mx-2 sm:mx-4 h-3 sm:h-4 rounded-full overflow-hidden" style={{ backgroundColor: themeColors.border }}>
                  <div className="flex h-full">
                    {day.present > 0 && (
                      <div 
                        className="h-full"
                        style={{ 
                          width: `${presentPercentage}%`,
                          backgroundColor: getStatusColor('Present', themeColors)
                        }}
                        title={`Present: ${day.present}`}
                      />
                    )}
                    {day.late > 0 && (
                      <div 
                        className="h-full"
                        style={{ 
                          width: `${latePercentage}%`,
                          backgroundColor: getStatusColor('Late', themeColors)
                        }}
                        title={`Late: ${day.late}`}
                      />
                    )}
                  </div>
                </div>
                <span className="w-8 sm:w-12 text-right font-medium" style={{ color: themeColors.text }}>
                  {day.present + (day.late || 0)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Distribution */}
      <div 
        className="p-4 sm:p-6 rounded-xl border"
        style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}
      >
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: themeColors.text }}>
          Status Distribution
        </h3>
        <div className="space-y-2 sm:space-y-3">
          {statusData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 sm:gap-3">
                <div 
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="capitalize" style={{ color: themeColors.textSecondary }}>
                  {item.status.toLowerCase()}
                </span>
              </div>
              <span className="font-semibold" style={{ color: themeColors.text }}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Performance */}
      {weeklyTrend && weeklyTrend.length > 0 && (
        <div 
          className="p-4 sm:p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}
        >
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: themeColors.text }}>
            Weekly Performance
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {weeklyTrend.slice(-4).map((week, index) => (
              <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                <span style={{ color: themeColors.textSecondary }}>
                  Week {week.week}
                </span>
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="hidden sm:inline" style={{ color: themeColors.textSecondary }}>
                    {week.present}/{week.total}
                  </span>
                  <div 
                    className="w-16 sm:w-20 h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: themeColors.border }}
                    title={`${week.attendanceRate}%`}
                  >
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${Math.min(week.attendanceRate, 100)}%`,
                        backgroundColor: getPerformanceColor(week.attendanceRate, themeColors)
                      }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium" style={{ color: themeColors.text }}>
                    {Math.round(week.attendanceRate)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Overview */}
      {monthlyTrend && monthlyTrend.length > 0 && (
        <div 
          className="p-4 sm:p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}
        >
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: themeColors.text }}>
            Monthly Overview
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {monthlyTrend.slice(-6).map((month, index) => {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return (
                <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                  <span style={{ color: themeColors.textSecondary }}>
                    {monthNames[month.month - 1]} {month.year}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="hidden sm:inline" style={{ color: themeColors.textSecondary }}>
                      {month.present}/{month.total}
                    </span>
                    <span className="font-semibold" style={{ color: themeColors.text }}>
                      {Math.round(month.attendanceRate)}%
                    </span>
                    <span className="hidden sm:inline" style={{ color: themeColors.success }}>
                      {Math.round(month.totalHours)}h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getStatusColor = (status, themeColors) => {
  const colors = {
    'Present': themeColors.success,
    'Absent': themeColors.danger,
    'Late': themeColors.warning,
    'Half Day': themeColors.primary,
    'On Leave': themeColors.accent,
    'Holiday': themeColors.purple || '#8B5CF6',
    'Week Off': themeColors.blue || '#3B82F6',
    'Early Departure': themeColors.orange || '#F50f77'
  };
  return colors[status] || themeColors.textSecondary;
};

const getPerformanceColor = (percentage, themeColors) => {
  if (percentage >= 90) return themeColors.success;
  if (percentage >= 80) return themeColors.warning;
  return themeColors.danger;
};

export default AttendanceCharts;