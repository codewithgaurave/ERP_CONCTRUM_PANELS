// src/employee/EmployeeDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import dashboardAPI from "../apis/dashboardAPI";
import attendanceAPI from "../apis/attendanceAPI";
import { getCurrentLocation } from "../utils/locationUtils";
import { toast } from "sonner";
import {
    Calendar,
    Clock,
    TrendingUp,
    User,
    Building,
    Briefcase,
    LogIn,
    LogOut,
    MapPin,
    Navigation,
    BarChart3,
    Award,
    Coffee,
    History
} from "lucide-react";

// Chart components
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const EmployeeDashboard = () => {
    const { themeColors } = useTheme();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [time, setTime] = useState(new Date());

    // Punch in/out states
    const [punchLoading, setPunchLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [showPunchConfirmation, setShowPunchConfirmation] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchDashboardData();
        fetchTodayAttendance();
        fetchCurrentLocation();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await dashboardAPI.getDashboardStats();
            setStats(response.data.stats);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch dashboard data");
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayAttendance = async () => {
        try {
            const { data } = await attendanceAPI.getTodayAttendance();
            setTodayAttendance(data.attendance);
        } catch (err) {
            console.error("Error fetching today's attendance:", err);
        }
    };

    const fetchCurrentLocation = async () => {
        try {
            setLocationLoading(true);
            const location = await getCurrentLocation();
            setCurrentLocation(location);
            return location;
        } catch (err) {
            toast.error(`Location Error: ${err.message}`);
            return null;
        } finally {
            setLocationLoading(false);
        }
    };

    const handlePunchAction = async (action) => {
        try {
            setPunchLoading(true);

            const location = await fetchCurrentLocation();
            if (!location) {
                toast.error("Unable to get your location. Please enable location services.");
                return;
            }

            const punchData = {
                coordinates: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            };

            let response;
            if (action === 'in') {
                response = await attendanceAPI.punchIn(punchData);
                toast.success("Punch in successful! Have a productive day.");
            } else {
                response = await attendanceAPI.punchOut(punchData);
                toast.success("Punch out successful! Have a great evening.");
            }

            setTodayAttendance(response.data.attendance);
            setShowPunchConfirmation(null);

            // Refresh dashboard data
            fetchDashboardData();

        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || `${action === 'in' ? 'Punch in' : 'Punch out'} failed`;
            toast.error(errorMessage);
        } finally {
            setPunchLoading(false);
        }
    };

    const confirmPunchAction = (action) => {
        setShowPunchConfirmation(action);
    };

    const cancelPunchAction = () => {
        setShowPunchConfirmation(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 rounded-lg border" style={{
                backgroundColor: themeColors.danger + '20',
                borderColor: themeColors.danger,
                color: themeColors.danger
            }}>
                {error}
            </div>
        );
    }

    if (!stats) return null;

    // Format time for display
    const formatTime = (dateString) => {
        if (!dateString) return '--:--';
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Prepare chart data for employee attendance trend
    const attendanceTrendData = stats.recentActivities?.attendanceTrend || [];

    return (
        <div className="space-y-6 p-4">
            {/* Header with Date/Time */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: themeColors.text }}>
                        My Dashboard
                    </h1>
                    <p className="text-sm mt-1" style={{ color: themeColors.text }}>
                        Welcome back! {time.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <div className="text-lg font-medium mt-2 md:mt-0" style={{ color: themeColors.primary }}>
                    {time.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })}
                </div>
            </div>

            {/* Employee Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <EmployeeInfoCard
                    icon={<User size={20} />}
                    title="Employee ID"
                    value={stats.overview?.employeeId || "N/A"}
                    subtitle="Your unique ID"
                    color="blue"
                />
                <EmployeeInfoCard
                    icon={<Building size={20} />}
                    title="Department"
                    value={stats.overview?.department || "N/A"}
                    subtitle="Your department"
                    color="green"
                />
                <EmployeeInfoCard
                    icon={<Briefcase size={20} />}
                    title="Designation"
                    value={stats.overview?.designation || "N/A"}
                    subtitle="Your role"
                    color="purple"
                />
                <EmployeeInfoCard
                    icon={<Award size={20} />}
                    title="Manager"
                    value={stats.overview?.manager || "N/A"}
                    subtitle="Reporting to"
                    color="orange"
                />
            </div>

            {/* Punch In/Out Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Attendance Status */}
                <div className="p-6 rounded-lg border" style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Calendar size={24} style={{ color: themeColors.primary }} />
                        <div>
                            <h3 className="font-semibold" style={{ color: themeColors.text }}>Today's Status</h3>
                            <p className="text-sm" style={{ color: themeColors.text }}>
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {todayAttendance ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm" style={{ color: themeColors.text }}>Punch In:</span>
                                <span className="font-medium" style={{ color: themeColors.text }}>
                                    {formatTime(todayAttendance.punchIn?.timestamp)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm" style={{ color: themeColors.text }}>Punch Out:</span>
                                <span className="font-medium" style={{ color: themeColors.text }}>
                                    {todayAttendance.punchOut?.timestamp
                                        ? formatTime(todayAttendance.punchOut.timestamp)
                                        : '--:--'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm" style={{ color: themeColors.text }}>Status:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${todayAttendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                                        todayAttendance.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                            todayAttendance.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {todayAttendance.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm" style={{ color: themeColors.text }}>Work Hours:</span>
                                <span className="font-medium" style={{ color: themeColors.text }}>
                                    {todayAttendance.totalWorkHours?.toFixed(2) || '0'}h
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4" style={{ color: themeColors.text }}>
                            <p>No attendance recorded for today</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="p-6 rounded-lg border" style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Clock size={24} style={{ color: themeColors.primary }} />
                        <div>
                            <h3 className="font-semibold" style={{ color: themeColors.text }}>Quick Actions</h3>
                            <p className="text-sm" style={{ color: themeColors.text }}>Mark your attendance</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => confirmPunchAction('in')}
                            disabled={punchLoading || locationLoading || (todayAttendance && todayAttendance.punchIn)}
                            className="w-full py-3 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            style={{ backgroundColor: themeColors.success }}
                        >
                            <LogIn size={18} />
                            {todayAttendance?.punchIn ? 'Already Punched In' : 'Punch In'}
                        </button>

                        <button
                            onClick={() => confirmPunchAction('out')}
                            disabled={punchLoading || locationLoading || !todayAttendance?.punchIn || todayAttendance?.punchOut}
                            className="w-full py-3 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            style={{ backgroundColor: themeColors.danger }}
                        >
                            <LogOut size={18} />
                            {todayAttendance?.punchOut ? 'Already Punched Out' : 'Punch Out'}
                        </button>
                    </div>

                    {/* Location Status */}
                    {currentLocation && (
                        <div className="mt-4 p-3 rounded-lg flex items-center gap-2 text-sm" style={{
                            backgroundColor: themeColors.info + '10',
                            color: themeColors.info
                        }}>
                            <MapPin size={16} />
                            <span>Location: {currentLocation.address}</span>
                        </div>
                    )}
                </div>

                {/* Location Actions */}
                <div className="p-6 rounded-lg border" style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border
                }}>
                    <div className="flex items-center gap-3 mb-4">
                        <Navigation size={24} style={{ color: themeColors.primary }} />
                        <div>
                            <h3 className="font-semibold" style={{ color: themeColors.text }}>Location Services</h3>
                            <p className="text-sm" style={{ color: themeColors.text }}>Manage your location</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={fetchCurrentLocation}
                            disabled={locationLoading}
                            className="w-full py-3 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 border"
                            style={{
                                backgroundColor: themeColors.background,
                                borderColor: themeColors.border,
                                color: themeColors.text
                            }}
                        >
                            <Navigation size={18} className={locationLoading ? "animate-spin" : ""} />
                            {locationLoading ? 'Getting Location...' : 'Refresh Location'}
                        </button>

                        {/* Current Location Info */}
                        {currentLocation && (
                            <div className="p-3 rounded-lg text-xs space-y-1" style={{
                                backgroundColor: themeColors.background,
                                color: themeColors.text
                            }}>
                                <div className="flex justify-between">
                                    <span>Latitude:</span>
                                    <span>{currentLocation.latitude?.toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Longitude:</span>
                                    <span>{currentLocation.longitude?.toFixed(6)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Accuracy:</span>
                                    <span>±{currentLocation.accuracy?.toFixed(1)}m</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Punch Confirmation Modal */}
            {showPunchConfirmation && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full" style={{
                        backgroundColor: themeColors.surface,
                        color: themeColors.text
                    }}>
                        <h3 className="text-lg font-semibold mb-4">
                            Confirm {showPunchConfirmation === 'in' ? 'Punch In' : 'Punch Out'}
                        </h3>

                        <div className="space-y-3 mb-6">
                            <p>Are you sure you want to {showPunchConfirmation === 'in' ? 'punch in' : 'punch out'}?</p>

                            {currentLocation && (
                                <div className="p-3 rounded-lg text-sm" style={{
                                    backgroundColor: themeColors.background
                                }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin size={14} />
                                        <span className="font-medium">Location:</span>
                                    </div>
                                    <p className="text-xs">{currentLocation.address}</p>
                                    <p className="text-xs opacity-75 mt-1">
                                        Coordinates: {currentLocation.latitude?.toFixed(4)}, {currentLocation.longitude?.toFixed(4)}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm" style={{ color: themeColors.text }}>
                                <Clock size={14} />
                                <span>Time: {new Date().toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelPunchAction}
                                disabled={punchLoading}
                                className="flex-1 py-2 rounded-lg border font-medium transition-colors disabled:opacity-50"
                                style={{
                                    backgroundColor: themeColors.background,
                                    borderColor: themeColors.border,
                                    color: themeColors.text
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handlePunchAction(showPunchConfirmation)}
                                disabled={punchLoading}
                                className="flex-1 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{
                                    backgroundColor: showPunchConfirmation === 'in' ? themeColors.success : themeColors.danger
                                }}
                            >
                                {punchLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {showPunchConfirmation === 'in' ? <LogIn size={16} /> : <LogOut size={16} />}
                                        Confirm {showPunchConfirmation === 'in' ? 'Punch In' : 'Punch Out'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon={<TrendingUp size={20} />}
                    title="Monthly Attendance"
                    value={`${stats.attendance?.month?.attendanceRate || 0}%`}
                    subtitle={`${stats.attendance?.month?.present || 0} days present`}
                    color="green"
                />
                <StatCard
                    icon={<Clock size={20} />}
                    title="Total Hours"
                    value={`${(stats.attendance?.month?.totalHours || 0).toFixed(3)}h`}
                    subtitle={`${(stats.attendance?.month?.overtimeHours || 0).toFixed(3)}h overtime`}
                    color="blue"
                />
                <div 
                    onClick={() => navigate('/transfer-history')}
                    className="cursor-pointer"
                >
                    <StatCard
                        icon={<History size={20} />}
                        title="Transfer History"
                        value="View"
                        subtitle="Click to see asset transfers"
                        color="purple"
                    />
                </div>
            </div>

            {/* Charts Section */}
            {attendanceTrendData.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                    <ChartCard
                        title="My Attendance Trend (This Month)"
                        style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={attendanceTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
                                <XAxis
                                    dataKey="date"
                                    stroke={themeColors.textSecondary}
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke={themeColors.textSecondary}
                                    fontSize={12}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: themeColors.surface,
                                        borderColor: themeColors.border,
                                        color: themeColors.text
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="workHours"
                                    stroke={themeColors.success}
                                    strokeWidth={2}
                                    name="Work Hours"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            )}

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivities
                    title="Upcoming Events"
                    activities={stats.recentActivities?.upcomingEvents || []}
                    type="events"
                    maxItems={5}
                />
                <RecentActivities
                    title="Recent Announcements"
                    activities={stats.recentActivities?.recentAnnouncements || []}
                    type="announcements"
                    maxItems={5}
                />
            </div>
        </div>
    );
};

// Helper Components
const EmployeeInfoCard = ({ icon, title, value, subtitle, color }) => {
    const { themeColors } = useTheme();

    const colorMap = {
        blue: themeColors.info,
        green: themeColors.success,
        orange: themeColors.warning,
        purple: themeColors.primary,
        red: themeColors.danger
    };

    const renderValue = (val) => {
        if (val === null || val === undefined) {
            return "N/A";
        }

        if (typeof val === 'object' && val.first !== undefined && val.last !== undefined) {
            return `${val.first} ${val.last}`.trim();
        }

        if (typeof val === 'object') {
            return JSON.stringify(val);
        }

        if (Array.isArray(val)) {
            return val.join(', ');
        }

        return String(val);
    };

    return (
        <div className="p-6 rounded-lg border transition-all hover:shadow-lg" style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
        }}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: themeColors.text }}>{title}</p>
                    <p className="text-lg font-bold" style={{ color: themeColors.text }}>
                        {renderValue(value)}
                    </p>
                    <p className="text-xs mt-2" style={{ color: themeColors.text }}>{subtitle}</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: colorMap[color] + '20' }}>
                    <div style={{ color: colorMap[color] }}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, subtitle, color }) => {
    const { themeColors } = useTheme();

    const colorMap = {
        blue: themeColors.info,
        green: themeColors.success,
        orange: themeColors.warning,
        purple: themeColors.primary,
        red: themeColors.danger
    };

    const renderValue = (val) => {
        if (val === null || val === undefined) {
            return "N/A";
        }

        if (typeof val === 'object') {
            return JSON.stringify(val);
        }

        if (Array.isArray(val)) {
            return val.join(', ');
        }

        return String(val);
    };

    return (
        <div className="p-6 rounded-lg border transition-all hover:shadow-lg" style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
        }}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium mb-1" style={{ color: themeColors.text }}>{title}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold" style={{ color: themeColors.text }}>
                            {renderValue(value)}
                        </p>
                    </div>
                    <p className="text-xs mt-2" style={{ color: themeColors.text }}>{subtitle}</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: colorMap[color] + '20' }}>
                    <div style={{ color: colorMap[color] }}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChartCard = ({ title, children, style }) => {
    const { themeColors } = useTheme();

    return (
        <div className="p-6 rounded-lg border" style={style}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.text }}>{title}</h3>
            {children}
        </div>
    );
};

const RecentActivities = ({ title, activities, type, maxItems = 3 }) => {
    const { themeColors } = useTheme();

    const getActivityIcon = (type) => {
        switch (type) {
            case 'events':
                return <Calendar size={16} style={{ color: themeColors.info }} />;
            case 'announcements':
                return <BarChart3 size={16} style={{ color: themeColors.warning }} />;
            default:
                return <Calendar size={16} style={{ color: themeColors.info }} />;
        }
    };

    const formatActivity = (activity, type) => {
        switch (type) {
            case 'events':
                return `${activity.title} - ${activity.officeLocation?.officeName || 'Office'}`;
            case 'announcements':
                let createdByName = 'System';
                if (activity.createdBy?.name) {
                    if (typeof activity.createdBy.name === 'object') {
                        createdByName = `${activity.createdBy.name.first || ''} ${activity.createdBy.name.last || ''}`.trim();
                    } else {
                        createdByName = activity.createdBy.name;
                    }
                }
                return `${activity.title} - By ${createdByName}`;
            default:
                return activity.title || activity.description || 'Unknown activity';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    return (
        <div className="p-6 rounded-lg border" style={{ backgroundColor: themeColors.surface, borderColor: themeColors.border }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.text }}>{title}</h3>
            <div className="space-y-3">
                {activities.slice(0, maxItems).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded" style={{ backgroundColor: themeColors.background }}>
                        {getActivityIcon(type)}
                        <div className="flex-1">
                            <p className="text-sm" style={{ color: themeColors.text }}>
                                {formatActivity(activity, type)}
                            </p>
                            <p className="text-xs mt-1" style={{ color: themeColors.text }}>
                                {formatDate(activity.startDate || activity.createdAt)}
                            </p>
                        </div>
                    </div>
                ))}
                {activities.length === 0 && (
                    <p className="text-sm text-center py-4" style={{ color: themeColors.text }}>
                        No {title.toLowerCase()} found
                    </p>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;