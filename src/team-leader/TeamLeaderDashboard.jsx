// src/pages/TeamLeaderDashboard.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import dashboardAPI from "../apis/dashboardAPI";
import enhancedDashboardAPI from "../apis/enhancedDashboardAPI";
import hrAnalyticsAPI from "../apis/hrAnalyticsAPI";
import attendanceAPI from "../apis/attendanceAPI";
import { getCurrentLocation } from "../utils/locationUtils";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Building,
  Target,
  BarChart3,
  Award,
  UserCheck,
  UserX,
  Coffee,
  CheckCircle,
  MapPin,
  Navigation,
  LogIn,
  LogOut,
  Package,
  IndianRupee,
  AlertTriangle
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

const TeamLeaderDashboard = () => {
  const { themeColors } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
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
      console.log('Fetching team leader dashboard data...');
      
      // Try enhanced dashboard API first
      try {
        const enhancedResponse = await enhancedDashboardAPI.getEnhancedDashboard();
        console.log('Enhanced dashboard response:', enhancedResponse);
        
        if (enhancedResponse.data && enhancedResponse.data.data) {
          console.log('✅ Enhanced dashboard data received:', enhancedResponse.data.data);
          setStats(enhancedResponse.data);
          setAnalytics(enhancedResponse.data.data.analytics || {});
          return;
        }
      } catch (enhancedError) {
        console.log('Enhanced dashboard failed, trying regular dashboard:', enhancedError);
      }
      
      // Fallback to regular dashboard API
      try {
        const response = await dashboardAPI.getDashboardStats();
        console.log('Regular dashboard response:', response);
        
        if (response.data && response.data.stats) {
          console.log('✅ Regular dashboard data received:', response.data.stats);
          setStats(response.data);
          setAnalytics(response.data.stats.analytics || {});
        }
      } catch (regularError) {
        console.log('Regular dashboard also failed:', regularError);
        throw regularError;
      }
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
      toast.error("Failed to load team dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await attendanceAPI.getTodayAttendance();
      setTodayAttendance(response.data.attendance);
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Failed to get location:', error);
    } finally {
      setLocationLoading(false);
    }
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

  // Prepare chart data
  const teamAttendanceTrend = stats.analytics?.teamAttendanceTrends || [];
  const teamPerformance = stats.analytics?.teamPerformance || [];

  return (
    <div className="space-y-6 p-4">
      {/* Header with Date/Time */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: themeColors.text }}>
            Team Leader Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: themeColors.text }}>
            Team Overview - {time.toLocaleDateString('en-US', { 
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

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TeamStatCard
          icon={<Users size={20} />}
          title="Team Size"
          value={stats.overview?.teamSize || 0}
          change="+2"
          subtitle="Total team members"
          color="blue"
        />
        <TeamStatCard
          icon={<UserCheck size={20} />}
          title="Present Today"
          value={stats.attendance?.today?.present || 0}
          change={`${stats.overview?.todayPresent || 0} present`}
          subtitle="Currently working"
          color="green"
        />
        <TeamStatCard
          icon={<UserX size={20} />}
          title="Absent Today"
          value={stats.attendance?.today?.absent || 0}
          change={`${stats.overview?.todayAbsent || 0} absent`}
          subtitle="On leave/absent"
          color="red"
        />
        <TeamStatCard
          icon={<Target size={20} />}
          title="Team Performance"
          value={`${stats.quickStats?.averageAttendance || 0}%`}
          change="+5.2%"
          subtitle="Monthly average"
          color="purple"
        />
      </div>

      {/* Team Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Attendance Trend */}
        <div className="p-6 rounded-lg border" style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}>
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold" style={{ color: themeColors.text }}>Team Attendance Trend</h3>
              <p className="text-sm" style={{ color: themeColors.text }}>Last 30 days performance</p>
            </div>
          </div>
          
          {teamAttendanceTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={teamAttendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.border} />
                <XAxis 
                  dataKey="period" 
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
                  dataKey="attendanceRate" 
                  stroke={themeColors.success} 
                  strokeWidth={2}
                  name="Attendance Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p style={{ color: themeColors.text }}>No attendance data available</p>
            </div>
          )}
        </div>

        {/* Team Member Performance */}
        <div className="p-6 rounded-lg border" style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}>
          <div className="flex items-center gap-3 mb-4">
            <Award size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold" style={{ color: themeColors.text }}>Team Performance</h3>
              <p className="text-sm" style={{ color: themeColors.text }}>Individual member stats</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {(teamPerformance || []).slice(0, 5).map((member, index) => (
              <TeamMemberPerformance 
                key={index}
                member={member}
                rank={index + 1}
                themeColors={themeColors}
              />
            ))}
            {(!teamPerformance || teamPerformance.length === 0) && (
              <div className="text-center py-8">
                <p style={{ color: themeColors.text }}>No team performance data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="p-6 rounded-lg border" style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold" style={{ color: themeColors.text }}>Quick Stats</h3>
              <p className="text-sm" style={{ color: themeColors.text }}>Team metrics</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <QuickStat 
              title="Avg. Hours Worked" 
              value={`${stats.quickStats?.avgHoursWorked || 0}h`}
              change="+0.3h"
              themeColors={themeColors}
            />
            <QuickStat 
              title="Overtime This Month" 
              value={`${stats.quickStats?.overtimeHours || 0}h`}
              change="+12h"
              themeColors={themeColors}
            />
            <QuickStat 
              title="Pending Tasks" 
              value={stats.quickStats?.pendingTasks || 0}
              change="-5"
              themeColors={themeColors}
            />
            <QuickStat 
              title="Leave Utilization" 
              value={`${stats.quickStats?.leaveUtilization || 0}%`}
              change="-2%"
              themeColors={themeColors}
            />
          </div>
        </div>

        {/* Team Alerts */}
        <div className="p-6 rounded-lg border" style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}>
          <div className="flex items-center gap-3 mb-4">
            <Building size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold" style={{ color: themeColors.text }}>Team Alerts</h3>
              <p className="text-sm" style={{ color: themeColors.text }}>Requires attention</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {(stats.recentActivities?.teamAlerts || []).map((alert, index) => (
              <TeamAlert 
                key={index}
                alert={alert}
                themeColors={themeColors}
              />
            ))}
            {(!stats.recentActivities?.teamAlerts || stats.recentActivities.teamAlerts.length === 0) && (
              <div className="text-center py-4">
                <CheckCircle size={32} style={{ color: themeColors.success }} className="mx-auto mb-2" />
                <p style={{ color: themeColors.text }}>No alerts - All good!</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-6 rounded-lg border" style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}>
          <div className="flex items-center gap-3 mb-4">
            <Clock size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold" style={{ color: themeColors.text }}>Pending Approvals</h3>
              <p className="text-sm" style={{ color: themeColors.text }}>Action required</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {(stats.recentActivities?.pendingLeaves || []).slice(0, 3).map((leave, index) => (
              <PendingApproval 
                key={index}
                leave={leave}
                themeColors={themeColors}
              />
            ))}
            {(!stats.recentActivities?.pendingLeaves || stats.recentActivities.pendingLeaves.length === 0) && (
              <div className="text-center py-4">
                <p style={{ color: themeColors.text }}>No pending approvals</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-lg border" style={{ 
        backgroundColor: themeColors.surface, 
        borderColor: themeColors.border 
      }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Clock size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold" style={{ color: themeColors.text }}>Quick Actions</h3>
              <p className="text-sm" style={{ color: themeColors.text }}>Manage team attendance</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/team-leader/attendance'}
            className="p-4 rounded-lg border transition-all hover:shadow-md flex items-center gap-3"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            <Calendar size={20} style={{ color: themeColors.primary }} />
            <div className="text-left">
              <p className="font-medium">View Attendance</p>
              <p className="text-xs" style={{ color: themeColors.textSecondary }}>Team attendance records</p>
            </div>
          </button>
          
          <button
            onClick={() => window.location.href = '/team-leader/team-members'}
            className="p-4 rounded-lg border transition-all hover:shadow-md flex items-center gap-3"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            <Users size={20} style={{ color: themeColors.primary }} />
            <div className="text-left">
              <p className="font-medium">Team Members</p>
              <p className="text-xs" style={{ color: themeColors.textSecondary }}>Manage your team</p>
            </div>
          </button>
          
          <button
            onClick={() => window.location.href = '/team-leader/reports'}
            className="p-4 rounded-lg border transition-all hover:shadow-md flex items-center gap-3"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            <BarChart3 size={20} style={{ color: themeColors.primary }} />
            <div className="text-left">
              <p className="font-medium">Reports</p>
              <p className="text-xs" style={{ color: themeColors.textSecondary }}>Team performance</p>
            </div>
          </button>
        </div>
      </div>

      {/* Team Members List */}
      {stats.teamMembers && stats.teamMembers.length > 0 && (
        <div className="p-6 rounded-lg border" style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}>
          <div className="flex items-center gap-3 mb-4">
            <Users size={24} style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold" style={{ color: themeColors.text }}>Team Members</h3>
              <p className="text-sm" style={{ color: themeColors.text }}>Your direct reports</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.teamMembers.map((member, index) => (
              <TeamMemberCard 
                key={member._id || index}
                member={member}
                themeColors={themeColors}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components for Team Leader Dashboard
const TeamStatCard = ({ icon, title, value, subtitle, change, color }) => {
  const { themeColors } = useTheme();
  
  const colorMap = {
    blue: themeColors.info,
    green: themeColors.success,
    orange: themeColors.warning,
    purple: themeColors.primary,
    red: themeColors.danger
  };

  const isPositive = change && (change.startsWith('+') || parseInt(change) > 0);

  return (
    <div className="p-6 rounded-lg border transition-all hover:shadow-lg" style={{ 
      backgroundColor: themeColors.surface, 
      borderColor: themeColors.border 
    }}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: themeColors.text }}>{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold" style={{ color: themeColors.text }}>{value}</p>
            {change && (
              <div className="flex items-center text-xs font-medium px-2 py-1 rounded-full" style={{
                backgroundColor: isPositive ? themeColors.success + '20' : themeColors.danger + '20',
                color: isPositive ? themeColors.success : themeColors.danger,
              }}>
                {change}
              </div>
            )}
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

const TeamMemberPerformance = ({ member, rank, themeColors }) => {
  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return themeColors.primary;
    }
  };

  const getEmployeeName = () => {
    if (member.employeeName) {
      if (typeof member.employeeName === 'object') {
        return `${member.employeeName.first || ''} ${member.employeeName.last || ''}`.trim();
      }
      return member.employeeName;
    }
    return 'Unknown Member';
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: themeColors.background }}>
      <div className="flex items-center space-x-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: getRankColor(rank) }}
        >
          {rank}
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: themeColors.text }}>
            {getEmployeeName()}
          </p>
          <p className="text-xs" style={{ color: themeColors.textSecondary }}>
            {member.employeeId || 'No ID'}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold" style={{ color: themeColors.text }}>
          {typeof member.attendanceRate === 'number' ? `${member.attendanceRate.toFixed(1)}%` : 'N/A'}
        </p>
        <p className="text-xs" style={{ color: themeColors.textSecondary }}>
          {member.avgHoursPerDay ? `${member.avgHoursPerDay.toFixed(1)}h/day` : 'No data'}
        </p>
      </div>
    </div>
  );
};

const QuickStat = ({ title, value, change, themeColors }) => {
  const isPositive = change && (change.startsWith('+') || parseInt(change) > 0);

  return (
    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: themeColors.background }}>
      <span className="text-sm font-medium" style={{ color: themeColors.text }}>{title}</span>
      <div className="text-right">
        <div className="text-sm font-semibold" style={{ color: themeColors.text }}>{value}</div>
        {change && (
          <div className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

const TeamAlert = ({ alert, themeColors }) => {
  const getAlertIcon = (severity) => {
    switch(severity) {
      case 'warning': return <Building size={16} style={{ color: themeColors.warning }} />;
      case 'danger': return <Building size={16} style={{ color: themeColors.danger }} />;
      default: return <Building size={16} style={{ color: themeColors.info }} />;
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded" style={{ backgroundColor: themeColors.background }}>
      {getAlertIcon(alert.severity)}
      <div className="flex-1">
        <p className="text-sm" style={{ color: themeColors.text }}>
          {alert.message}
        </p>
        <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
          {new Date(alert.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

const PendingApproval = ({ leave, themeColors }) => {
  const getEmployeeName = () => {
    if (leave.employee?.name) {
      if (typeof leave.employee.name === 'object') {
        return `${leave.employee.name.first || ''} ${leave.employee.name.last || ''}`.trim();
      }
      return leave.employee.name;
    }
    return 'Unknown Employee';
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded" style={{ backgroundColor: themeColors.background }}>
      <Clock size={16} style={{ color: themeColors.warning }} />
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: themeColors.text }}>
          {getEmployeeName()}
        </p>
        <p className="text-xs" style={{ color: themeColors.textSecondary }}>
          {leave.leaveType} - {leave.duration} days
        </p>
      </div>
    </div>
  );
};

const TeamMemberCard = ({ member, themeColors }) => {
  const getMemberName = () => {
    if (member.name) {
      if (typeof member.name === 'object') {
        return `${member.name.first || ''} ${member.name.last || ''}`.trim();
      }
      return member.name;
    }
    return 'Unknown Member';
  };

  return (
    <div className="p-4 rounded-lg border" style={{ 
      backgroundColor: themeColors.background, 
      borderColor: themeColors.border 
    }}>
      <div className="flex items-center space-x-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"
          style={{ backgroundColor: themeColors.primary }}
        >
          {getMemberName().charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: themeColors.text }}>
            {getMemberName()}
          </p>
          <p className="text-xs" style={{ color: themeColors.textSecondary }}>
            {member.designation || 'No designation'}
          </p>
          <p className="text-xs" style={{ color: themeColors.textSecondary }}>
            ID: {member.employeeId || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamLeaderDashboard;