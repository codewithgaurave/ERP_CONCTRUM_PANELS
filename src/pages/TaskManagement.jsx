// src/pages/TaskManagement.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TaskDashboard from '../components/tasks/TaskDashboard';
import TaskList from '../components/tasks/TaskList';
import CreateDynamicTask from '../components/tasks/CreateDynamicTask';
import { 
  LayoutDashboard, 
  ListTodo, 
  User, 
  Plus,
  Filter,
  Zap
} from 'lucide-react';

const TaskManagement = () => {
  const { user } = useAuth();
  const { themeColors } = useTheme();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const isManager = user?.role === 'HR_Manager' || user?.role === 'Team_Leader';

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isManager ? [{ id: 'all', label: 'All Tasks', icon: ListTodo }] : []),
    { id: 'my', label: 'My Tasks', icon: User },
  ];

  const handleTaskCreated = () => {
    setCreateDialogOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const getTabStyle = (tabId) => {
    const isActive = currentTab === tabId;
    return {
      backgroundColor: isActive ? themeColors.primary : 'transparent',
      color: isActive ? 'white' : themeColors.text,
      borderColor: isActive ? themeColors.primary : themeColors.border,
    };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: themeColors.background }}>
      {/* Enhanced Header */}
      <div className="border-b" style={{ borderColor: themeColors.border, backgroundColor: themeColors.surface }}>
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${themeColors.primary}15` }}>
                <Zap size={24} style={{ color: themeColors.primary }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: themeColors.text }}>
                  Dynamic Task Management
                </h1>
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Create surveys, track installations, collect data with custom forms
                </p>
              </div>
            </div>
            
            {isManager && (
              <button
                onClick={() => setCreateDialogOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{ 
                  backgroundColor: themeColors.primary,
                  color: 'white'
                }}
              >
                <Plus size={18} />
                Create Dynamic Task
              </button>
            )}
          </div>

          {/* Enhanced Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-medium transition-all hover:scale-105 active:scale-95 whitespace-nowrap shadow-sm"
                  style={getTabStyle(tab.id)}
                >
                  <IconComponent size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {currentTab === 'dashboard' && <TaskDashboard />}
        {currentTab === 'all' && (
          <TaskList 
            isManager={isManager} 
            refresh={refreshTrigger}
          />
        )}
        {currentTab === 'my' && (
          <TaskList 
            isManager={false} 
            refresh={refreshTrigger}
          />
        )}
      </div>

      {/* Create Dynamic Task Dialog */}
      {isManager && (
        <CreateDynamicTask
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
};

export default TaskManagement;