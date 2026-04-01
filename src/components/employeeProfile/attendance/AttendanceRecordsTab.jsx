// src/components/employeeProfile/attendance/AttendanceRecordsTab.jsx
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

const AttendanceRecordsTab = ({ data, filters, onFilterChange, onRefresh }) => {
    const { themeColors } = useTheme();

    if (!data) {
        return (
            <div className="text-center py-8" style={{ color: themeColors.textSecondary }}>
                No records data available
            </div>
        );
    }

    const { attendances, pagination, summary } = data;

    // Handle filter changes with immediate API call
    const handleFilterUpdate = (newFilters) => {
        onFilterChange({ ...newFilters, page: 1 }); // Reset to page 1 when filters change
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        onFilterChange({ page: newPage });
    };

    // Handle individual filter changes
    const handleStatusChange = (status) => {
        handleFilterUpdate({ status });
    };

    const handleDateChange = (field, value) => {
        handleFilterUpdate({ [field]: value });
    };

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Filters */}
            <div
                className="p-4 rounded-xl border"
                style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                }}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            style={{
                                borderColor: themeColors.border,
                                backgroundColor: themeColors.background,
                                color: themeColors.text
                            }}
                        />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            style={{
                                borderColor: themeColors.border,
                                backgroundColor: themeColors.background,
                                color: themeColors.text
                            }}
                        />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            style={{
                                borderColor: themeColors.border,
                                backgroundColor: themeColors.background,
                                color: themeColors.text
                            }}
                        >
                            <option value="">All Status</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="Half Day">Half Day</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Holiday">Holiday</option>
                            <option value="Week Off">Week Off</option>
                            <option value="Early Departure">Early Departure</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                        <button
                            onClick={onRefresh}
                            className="w-full px-4 py-2 rounded-lg font-medium text-sm sm:text-base"
                            style={{
                                backgroundColor: themeColors.primary,
                                color: '#ffffff'
                            }}
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div
                        className="p-3 sm:p-4 rounded-lg text-center"
                        style={{ backgroundColor: themeColors.success + '20' }}
                    >
                        <div className="text-lg sm:text-xl font-bold" style={{ color: themeColors.success }}>
                            {summary.stats.present}
                        </div>
                        <div className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Present</div>
                    </div>

                    <div
                        className="p-3 sm:p-4 rounded-lg text-center"
                        style={{ backgroundColor: themeColors.danger + '20' }}
                    >
                        <div className="text-lg sm:text-xl font-bold" style={{ color: themeColors.danger }}>
                            {summary.stats.absent}
                        </div>
                        <div className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Absent</div>
                    </div>

                    <div
                        className="p-3 sm:p-4 rounded-lg text-center"
                        style={{ backgroundColor: themeColors.warning + '20' }}
                    >
                        <div className="text-lg sm:text-xl font-bold" style={{ color: themeColors.warning }}>
                            {summary.stats.late}
                        </div>
                        <div className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Late</div>
                    </div>

                    <div
                        className="p-3 sm:p-4 rounded-lg text-center"
                        style={{ backgroundColor: themeColors.info + '20' }}
                    >
                        <div className="text-lg sm:text-xl font-bold" style={{ color: themeColors.info }}>
                            {summary.stats.totalRecords}
                        </div>
                        <div className="text-xs sm:text-sm" style={{ color: themeColors.textSecondary }}>Total</div>
                    </div>
                </div>
            )}

            {/* Records Table */}
            <div
                className="rounded-xl border overflow-hidden"
                style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead>
                            <tr style={{ backgroundColor: themeColors.background }}>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    Date
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    Status
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    Punch In
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    Punch Out
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    Work Hours
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                                    style={{ color: themeColors.textSecondary }}
                                >
                                    Overtime
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: themeColors.border }}>
                            {attendances?.map((attendance) => (
                                <tr 
                                    key={attendance._id} 
                                    className="border-b"
                                    style={{ 
                                        color: themeColors.text,
                                        borderColor: themeColors.border
                                    }}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {new Date(attendance.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span
                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: getStatusColor(attendance.status, themeColors) + '20',
                                                color: getStatusColor(attendance.status, themeColors)
                                            }}
                                        >
                                            {attendance.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {attendance.punchIn ?
                                            new Date(attendance.punchIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                            '--'
                                        }
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {attendance.punchOut ?
                                            new Date(attendance.punchOut.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                            '--'
                                        }
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {attendance.totalWorkHours?.toFixed(2) || '0.00'}h
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {attendance.overtimeHours?.toFixed(2) || '0.00'}h
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div
                        className="px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
                        style={{ borderColor: themeColors.border }}
                    >
                        <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                            {pagination.total} records
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                style={{
                                    borderColor: themeColors.border,
                                    backgroundColor: themeColors.background,
                                    color: themeColors.text
                                }}
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm" style={{ color: themeColors.text }}>
                                Page {pagination.page} of {pagination.pages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                style={{
                                    borderColor: themeColors.border,
                                    backgroundColor: themeColors.background,
                                    color: themeColors.text
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Cards View */}
            <div className="block sm:hidden space-y-3">
                {attendances?.map((attendance) => (
                    <div
                        key={attendance._id}
                        className="p-4 rounded-xl border"
                        style={{
                            backgroundColor: themeColors.surface,
                            borderColor: themeColors.border
                        }}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-medium text-sm" style={{ color: themeColors.text }}>
                                    {new Date(attendance.date).toLocaleDateString()}
                                </div>
                                <span
                                    className="inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium"
                                    style={{
                                        backgroundColor: getStatusColor(attendance.status, themeColors) + '20',
                                        color: getStatusColor(attendance.status, themeColors)
                                    }}
                                >
                                    {attendance.status}
                                </span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div style={{ color: themeColors.textSecondary }}>Punch In</div>
                                <div style={{ color: themeColors.text }}>
                                    {attendance.punchIn ?
                                        new Date(attendance.punchIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                        '--'
                                    }
                                </div>
                            </div>
                            <div>
                                <div style={{ color: themeColors.textSecondary }}>Punch Out</div>
                                <div style={{ color: themeColors.text }}>
                                    {attendance.punchOut ?
                                        new Date(attendance.punchOut.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                        '--'
                                    }
                                </div>
                            </div>
                            <div>
                                <div style={{ color: themeColors.textSecondary }}>Work Hours</div>
                                <div style={{ color: themeColors.text }}>
                                    {attendance.totalWorkHours?.toFixed(2) || '0.00'}h
                                </div>
                            </div>
                            <div>
                                <div style={{ color: themeColors.textSecondary }}>Overtime</div>
                                <div style={{ color: themeColors.text }}>
                                    {attendance.overtimeHours?.toFixed(2) || '0.00'}h
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
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
        'Half Day': themeColors.info,
        'On Leave': themeColors.secondary,
        'Holiday': themeColors.purple || '#8B5CF6',
        'Week Off': themeColors.blue || '#3B82F6',
        'Early Departure': themeColors.orange || '#F59E0B'
    };
    return colors[status] || themeColors.textSecondary;
};

export default AttendanceRecordsTab;