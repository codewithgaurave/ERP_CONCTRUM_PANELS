// src/components/tasks/TaskDashboard.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import taskAPI from '../../apis/taskAPI';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  AlertTriangle,
  Calendar
} from 'lucide-react';

const TaskDashboard = () => {
  const { themeColors } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTaskStats();
  }, []);

  const fetchTaskStats = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      setError('Failed to fetch task statistics');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div 
      className="p-6 rounded-xl border transition-all hover:scale-105 cursor-pointer"
      style={{ 
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
        color: themeColors.text
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-70">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-xs mt-2 ${
              trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              <TrendingUp size={12} />
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <div 
          className="p-3 rounded-full"
          style={{ backgroundColor: color + '20' }}
        >
          {React.cloneElement(icon, { 
            size: 24, 
            style: { color } 
          })}
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, max, color }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: themeColors.text }}>{label}</span>
        <span style={{ color: themeColors.textSecondary }}>{value}/{max}</span>
      </div>
      <div 
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: themeColors.border + '40' }}
      >
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            backgroundColor: color,
            width: `${(value / max) * 100}%`
          }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: themeColors.primary }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="p-4 rounded-lg border flex items-center gap-3"
        style={{ 
          backgroundColor: themeColors.danger + '20',
          borderColor: themeColors.danger,
          color: themeColors.danger
        }}
      >
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  const statusData = stats?.statusStats || [];
  const priorityData = stats?.priorityStats || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          subtitle="All active tasks"
          icon={<ClipboardList />}
          color={themeColors.primary}
        />
        <StatCard
          title="My Tasks"
          value={stats?.myTasks || 0}
          subtitle="Assigned to you"
          icon={<Users />}
          color={themeColors.accent}
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueTasks || 0}
          subtitle="Past deadline"
          icon={<AlertTriangle />}
          color={themeColors.danger}
        />
        <StatCard
          title="Urgent"
          value={stats?.urgentTasks || 0}
          subtitle="Due within 24h"
          icon={<Clock />}
          color={themeColors.warning}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div 
          className="p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.text }}>
            Status Distribution
          </h3>
          <div className="space-y-4">
            {statusData.map((stat) => (
              <ProgressBar
                key={stat._id}
                label={stat._id}
                value={stat.count}
                max={stats?.totalTasks || 1}
                color={
                  stat._id === 'Completed' ? themeColors.success :
                  stat._id === 'Verified' ? themeColors.primary :
                  stat._id === 'In Progress' ? themeColors.warning :
                  stat._id === 'Pending' ? themeColors.accent :
                  themeColors.textSecondary
                }
              />
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div 
          className="p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.text }}>
            Priority Distribution
          </h3>
          <div className="space-y-4">
            {priorityData.map((stat) => (
              <ProgressBar
                key={stat._id}
                label={stat._id}
                value={stat.count}
                max={stats?.totalTasks || 1}
                color={
                  stat._id === 'Urgent' ? themeColors.danger :
                  stat._id === 'High' ? themeColors.warning :
                  stat._id === 'Medium' ? themeColors.accent :
                  themeColors.success
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* Deadline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          className="p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} style={{ color: themeColors.danger }} />
            <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>
              Overdue Tasks
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.danger }}>
            {stats?.overdueTasks || 0}
          </div>
          <p className="text-sm opacity-70">Tasks past their deadline</p>
        </div>

        <div 
          className="p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Clock size={24} style={{ color: themeColors.warning }} />
            <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>
              Urgent Tasks
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>
            {stats?.urgentTasks || 0}
          </div>
          <p className="text-sm opacity-70">Due within 24 hours</p>
        </div>

        <div 
          className="p-6 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={24} style={{ color: themeColors.accent }} />
            <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>
              Approaching
            </h3>
          </div>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.accent }}>
            {stats?.approachingTasks || 0}
          </div>
          <p className="text-sm opacity-70">Due within 3 days</p>
        </div>
      </div>

      {/* Quick Overview */}
      <div 
        className="p-6 rounded-xl border"
        style={{ 
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: themeColors.text }}>
          Task Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {statusData.map((stat) => (
            <div key={stat._id} className="p-4 rounded-lg" style={{ backgroundColor: themeColors.background }}>
              <div 
                className="text-2xl font-bold mb-1" 
                style={{ 
                  color: stat._id === 'Completed' ? themeColors.success :
                         stat._id === 'In Progress' ? themeColors.warning :
                         stat._id === 'Pending' ? themeColors.accent :
                         themeColors.primary
                }}
              >
                {stat.count}
              </div>
              <div className="text-sm opacity-70">{stat._id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;