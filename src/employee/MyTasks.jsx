// src/employee/MyTasks.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import taskAPI from '../apis/taskAPI';
import TaskHistory from '../components/tasks/TaskHistory';
import { toast } from 'sonner';
import { 
  Search, 
  Eye,
  Calendar,
  User,
  RefreshCw,
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckSquare,
  CheckCircle,
  PlayCircle,
  X,
  MessageCircle,
  Send,
  AlertCircle,
  Grid,
  Table,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Download,
  Printer,
  Filter
} from 'lucide-react';

// Custom Action Modal Component
const ActionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  task, 
  actionType,
  themeColors 
}) => {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRemarks('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getActionConfig = () => {
    const configs = {
      start: {
        title: 'Start Task',
        icon: PlayCircle,
        message: `Are you ready to start working on "${task.title}"?`,
        placeholder: 'Enter starting remarks...',
        buttonText: 'Start Task',
        buttonColor: themeColors.warning
      },
      complete: {
        title: 'Complete Task',
        icon: CheckCircle,
        message: `Are you sure you want to mark "${task.title}" as completed?`,
        placeholder: 'Enter completion remarks...',
        buttonText: 'Complete Task',
        buttonColor: themeColors.success
      }
    };
    return configs[actionType] || configs.complete;
  };

  const config = getActionConfig();
  const IconComponent = config.icon;

  const handleSubmit = async () => {
    if (!remarks.trim()) {
      toast.error('Please enter remarks before proceeding');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(remarks.trim());
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="rounded-xl shadow-lg max-w-md w-full mx-auto transform transition-all duration-300 scale-100"
        style={{ 
          backgroundColor: themeColors.surface,
          border: `1px solid ${themeColors.border}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: config.buttonColor + '20' }}
            >
              <IconComponent size={24} style={{ color: config.buttonColor }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>
                {config.title}
              </h3>
              <p className="text-sm mt-1" style={{ color: themeColors.text }}>
                Update task status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:opacity-70"
            style={{ 
              backgroundColor: themeColors.background,
              color: themeColors.text
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm mb-3" style={{ color: themeColors.text }}>
              {config.message}
            </p>
            
            {/* Task Info */}
            <div 
              className="p-4 rounded-lg mb-4"
              style={{ 
                backgroundColor: themeColors.background + '50',
                border: `1px solid ${themeColors.border}`
              }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg mt-1"
                  style={{ 
                    backgroundColor: themeColors.primary + '20',
                    color: themeColors.primary
                  }}
                >
                  <MessageCircle size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm" style={{ color: themeColors.text }}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: themeColors.text }}>
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span 
                      className="px-2 py-1 rounded-full"
                      style={{ 
                        backgroundColor: 
                          task.priority === 'High' ? themeColors.warning + '20' :
                          task.priority === 'Urgent' ? themeColors.danger + '20' :
                          task.priority === 'Medium' ? themeColors.accent + '20' :
                          themeColors.success + '20',
                        color: 
                          task.priority === 'High' ? themeColors.warning :
                          task.priority === 'Urgent' ? themeColors.danger :
                          task.priority === 'Medium' ? themeColors.accent :
                          themeColors.success
                      }}
                    >
                      {task.priority}
                    </span>
                    {task.deadline && (
                      <span className="flex items-center gap-1" style={{ color: themeColors.text }}>
                        <Clock size={12} />
                        {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
              Remarks <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={config.placeholder}
                rows={4}
                className="w-full p-3 pr-10 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text
                }}
                autoFocus
              />
              <div 
                className="absolute right-3 top-3 p-1 rounded"
                style={{ 
                  backgroundColor: themeColors.background,
                  color: themeColors.text
                }}
              >
                <Send size={14} />
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: themeColors.text }}>
              Press Enter to submit, Shift+Enter for new line
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: themeColors.border }}>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !remarks.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: config.buttonColor,
              color: 'white'
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                {actionType === 'start' ? <PlayCircle size={16} /> : <CheckCircle size={16} />}
                {config.buttonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MyTasks = ({ refresh }) => {
  const { themeColors } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [sortConfig, setSortConfig] = useState({
    key: 'deadline',
    direction: 'asc'
  });
  const [expandedRows, setExpandedRows] = useState(new Set());
  
  // Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    task: null,
    actionType: null,
    onSubmit: null
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    deadlineStatus: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalTasks: 0
  });

  useEffect(() => {
    fetchMyTasks();
  }, [filters, refresh]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getMyTasks({
        ...filters,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      });

      setTasks(response.data.tasks || []);
      const p = response.data.pagination || {};
      setPagination({
        page: p.currentPage || p.page || 1,
        totalPages: p.totalPages || 1,
        totalTasks: p.totalTasks || 0
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tasks';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleStatusUpdate = async (taskId, newStatus, remarks = '') => {
    try {
      await taskAPI.updateStatus(taskId, { status: newStatus, remarks });
      
      const statusMessages = {
        'In Progress': 'Task started successfully! 🚀',
        'Completed': 'Task completed successfully! ✅',
        'Pending': 'Task marked as pending! ⏸️'
      };
      
      toast.success(statusMessages[newStatus] || 'Status updated successfully!');
      fetchMyTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update task status';
      toast.error(errorMessage);
    }
  };

  // Modal handlers
  const openActionModal = (task, actionType) => {
    setModalConfig({
      isOpen: true,
      task,
      actionType,
      onSubmit: (remarks) => {
        const statusMap = {
          start: 'In Progress',
          complete: 'Completed'
        };
        return handleStatusUpdate(task._id, statusMap[actionType], remarks);
      }
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': themeColors.text,
      'Assigned': themeColors.primary,
      'In Progress': themeColors.warning,
      'Pending': themeColors.accent,
      'Completed': themeColors.success,
      'Approved': themeColors.success,
      'Rejected': themeColors.danger
    };
    return colors[status] || themeColors.text;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': themeColors.success,
      'Medium': themeColors.accent,
      'High': themeColors.warning,
      'Urgent': themeColors.danger
    };
    return colors[priority] || themeColors.text;
  };

  const getDeadlineStatus = (task) => {
    if (task.status === 'Completed' || task.status === 'Approved') {
      return { status: 'completed', color: themeColors.success, label: 'Completed' };
    }
    
    if (!task.deadline) {
      return { status: 'normal', color: themeColors.text, label: 'No Deadline' };
    }

    const deadline = new Date(task.deadline);
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { status: 'overdue', color: themeColors.danger, label: 'Overdue' };
    } else if (daysDiff === 0) {
      return { status: 'urgent', color: themeColors.warning, label: 'Due Today' };
    } else if (daysDiff <= 1) {
      return { status: 'urgent', color: themeColors.warning, label: 'Due Tomorrow' };
    } else if (daysDiff <= 3) {
      return { status: 'approaching', color: themeColors.accent, label: 'Due Soon' };
    } else {
      return { status: 'normal', color: themeColors.success, label: 'On Track' };
    }
  };

  const StatusBadge = ({ status }) => (
    <span 
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ 
        backgroundColor: getStatusColor(status) + '20',
        color: getStatusColor(status)
      }}
    >
      {status}
    </span>
  );

  const PriorityBadge = ({ priority }) => (
    <span 
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ 
        backgroundColor: getPriorityColor(priority) + '20',
        color: getPriorityColor(priority)
      }}
    >
      {priority}
    </span>
  );

  const DeadlineBadge = ({ task }) => {
    const deadlineInfo = getDeadlineStatus(task);
    
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap"
        style={{ 
          backgroundColor: deadlineInfo.color + '20',
          color: deadlineInfo.color
        }}
      >
        {deadlineInfo.status === 'overdue' && <AlertTriangle size={12} />}
        {deadlineInfo.status === 'urgent' && <Clock size={12} />}
        {deadlineInfo.status === 'completed' && <CheckSquare size={12} />}
        {deadlineInfo.label}
      </span>
    );
  };

  // Table view functions
  const toggleRowExpand = (taskId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ['Title', 'Status', 'Priority', 'Deadline', 'Assigned By', 'Description'];
    const csvContent = [
      headers.join(','),
      ...tasks.map(task => [
        `"${task.title}"`,
        task.status,
        task.priority,
        task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A',
        `"${task.assignedBy?.name?.first} ${task.assignedBy?.name?.last}"`,
        `"${task.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-tasks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Tasks exported to CSV');
  };

  // Grid View Component
  const TaskCard = ({ task }) => {
    const deadlineInfo = getDeadlineStatus(task);
    
    return (
      <div
        className={`p-6 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
          deadlineInfo.status === 'overdue' ? 'border-l-4' : ''
        }`}
        style={{ 
          backgroundColor: themeColors.surface,
          borderColor: deadlineInfo.status === 'overdue' ? themeColors.danger : themeColors.border,
          borderLeftColor: deadlineInfo.status === 'overdue' ? themeColors.danger : 'transparent',
          color: themeColors.text
        }}
        onClick={() => {
          setSelectedTask(task);
          setShowHistory(true);
        }}
      >
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold mb-3 line-clamp-2">{task.title}</h3>

          <div className="flex flex-wrap gap-2 mb-4">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <DeadlineBadge task={task} />
          </div>

          <p className="text-sm opacity-80 mb-4 line-clamp-3 flex-1">
            {task.description || 'No description provided'}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User size={14} style={{ color: themeColors.text }} />
              <span style={{ color: themeColors.text }}>
                Assigned by: {task.assignedBy?.name?.first} {task.assignedBy?.name?.last}
              </span>
            </div>

            {task.deadline && (
              <div className="flex items-center gap-2">
                <Clock size={14} style={{ color: themeColors.text }} />
                <span style={{ color: themeColors.text }}>
                  Deadline: {new Date(task.deadline).toLocaleDateString()} {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            )}

            {task.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar size={14} style={{ color: themeColors.text }} />
                <span style={{ color: themeColors.text }}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Employee Actions */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t" style={{ borderColor: themeColors.border }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTask(task);
                setShowHistory(true);
              }}
              className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors hover:opacity-90"
              style={{ 
                backgroundColor: themeColors.background,
                color: themeColors.text,
                border: `1px solid ${themeColors.border}`
              }}
            >
              <Eye size={12} />
              History
            </button>

            {task.status !== 'Completed' && task.status !== 'Approved' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openActionModal(task, 'complete');
                  }}
                  className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors hover:opacity-90"
                  style={{ 
                    backgroundColor: themeColors.success + '20',
                    color: themeColors.success
                  }}
                >
                  <CheckCircle size={12} />
                  Complete
                </button>

                {task.status !== 'In Progress' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openActionModal(task, 'start');
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: themeColors.warning + '20',
                      color: themeColors.warning
                    }}
                  >
                    <PlayCircle size={12} />
                    Start
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Table Row Component
  const TableRow = ({ task }) => {
    const isExpanded = expandedRows.has(task._id);
    const deadlineInfo = getDeadlineStatus(task);
    
    return (
      <>
        <tr 
          className={`transition-colors hover:opacity-90 cursor-pointer ${isExpanded ? 'border-b-0' : ''}`}
          style={{ 
            backgroundColor: isExpanded ? themeColors.background : 'transparent',
            borderColor: themeColors.border
          }}
          onClick={() => toggleRowExpand(task._id)}
        >
          <td className="p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRowExpand(task._id);
                }}
                className="p-1 rounded hover:opacity-70"
                style={{ color: themeColors.text }}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate" style={{ color: themeColors.text }}>
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-xs opacity-70 truncate">
                    {task.description}
                  </div>
                )}
              </div>
            </div>
          </td>
          <td className="p-4">
            <StatusBadge status={task.status} />
          </td>
          <td className="p-4">
            <PriorityBadge priority={task.priority} />
          </td>
          <td className="p-4">
            <DeadlineBadge task={task} />
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2">
              <User size={14} style={{ color: themeColors.text }} />
              <span style={{ color: themeColors.text }}>
                {task.assignedBy?.name?.first} {task.assignedBy?.name?.last}
              </span>
            </div>
          </td>
          <td className="p-4">
            {task.deadline ? (
              <div className="flex items-center gap-1 whitespace-nowrap" style={{ color: themeColors.text }}>
                <Calendar size={14} />
                {new Date(task.deadline).toLocaleDateString()}
              </div>
            ) : (
              <span className="opacity-70">No deadline</span>
            )}
          </td>
          <td className="p-4">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTask(task);
                  setShowHistory(true);
                }}
                className="p-1 rounded hover:opacity-70"
                style={{ color: themeColors.text }}
                title="View History"
              >
                <Eye size={16} />
              </button>
              
              {task.status !== 'Completed' && task.status !== 'Approved' && (
                <>
                  {task.status !== 'In Progress' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openActionModal(task, 'start');
                      }}
                      className="p-1 rounded hover:opacity-70"
                      style={{ color: themeColors.warning }}
                      title="Start Task"
                    >
                      <PlayCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openActionModal(task, 'complete');
                    }}
                    className="p-1 rounded hover:opacity-70"
                    style={{ color: themeColors.success }}
                    title="Complete Task"
                  >
                    <CheckCircle size={16} />
                  </button>
                </>
              )}
            </div>
          </td>
        </tr>
        
        {/* Expanded Row Details */}
        {isExpanded && (
          <tr style={{ backgroundColor: themeColors.background }}>
            <td colSpan="7" className="p-4">
              <div className="pl-10 pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: themeColors.text }}>Description</h4>
                    <p className="text-sm" style={{ color: themeColors.text }}>
                      {task.description || 'No description provided'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2" style={{ color: themeColors.text }}>Task Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} style={{ color: themeColors.text }} />
                        <span style={{ color: themeColors.text }}>
                          Created: {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {task.updatedAt && (
                        <div className="flex items-center gap-2">
                          <Clock size={14} style={{ color: themeColors.text }} />
                          <span style={{ color: themeColors.text }}>
                            Last Updated: {new Date(task.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} style={{ color: themeColors.text }} />
                          <span style={{ color: themeColors.text }}>
                            Due Date: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Modal */}
      <ActionModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onSubmit={modalConfig.onSubmit}
        task={modalConfig.task}
        actionType={modalConfig.actionType}
        themeColors={themeColors}
      />

      {/* Error Display */}
      {error && (
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
          <button 
            onClick={() => setError('')}
            className="ml-auto text-sm font-medium hover:opacity-70 transition-opacity"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>
            My Tasks
          </h2>
          <p className="text-sm mt-1" style={{ color: themeColors.text }}>
            Manage your assigned tasks and track progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div 
            className="flex rounded-lg border overflow-hidden"
            style={{ borderColor: themeColors.border }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'text-white' : ''
              }`}
              style={{
                backgroundColor: viewMode === 'grid' ? themeColors.primary : themeColors.background,
                color: viewMode === 'grid' ? 'white' : themeColors.text
              }}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${
                viewMode === 'table' ? 'text-white' : ''
              }`}
              style={{
                backgroundColor: viewMode === 'table' ? themeColors.primary : themeColors.background,
                color: viewMode === 'table' ? 'white' : themeColors.text
              }}
              title="Table View"
            >
              <Table size={18} />
            </button>
          </div>

          {/* Export Buttons */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border font-medium transition-all hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border,
              color: themeColors.text
            }}
            title="Export to CSV"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={fetchMyTasks}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-all hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div 
        className="p-6 rounded-xl border"
        style={{ 
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Filter size={18} style={{ color: themeColors.text }} />
          <h3 className="font-medium" style={{ color: themeColors.text }}>Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
              Search
            </label>
            <div className="relative">
              <Search 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: themeColors.text }}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text
                }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Deadline Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
              Deadline Status
            </label>
            <select
              value={filters.deadlineStatus}
              onChange={(e) => handleFilterChange('deadlineStatus', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All Deadlines</option>
              <option value="overdue">Overdue</option>
              <option value="urgent">Urgent (Today/Tomorrow)</option>
              <option value="approaching">Approaching (Within 3 days)</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Count */}
      {!loading && tasks.length > 0 && (
        <div className="text-sm" style={{ color: themeColors.text }}>
          Showing {tasks.length} of {pagination.totalTasks} tasks
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div 
          className="rounded-xl border overflow-hidden"
          style={{ 
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: themeColors.background }}>
                  <th 
                    className="p-4 text-left cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: themeColors.text }}>Task</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    className="p-4 text-left cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: themeColors.text }}>Status</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    className="p-4 text-left cursor-pointer"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: themeColors.text }}>Priority</span>
                      {getSortIcon('priority')}
                    </div>
                  </th>
                  <th className="p-4 text-left" style={{ color: themeColors.text }}>
                    Deadline Status
                  </th>
                  <th className="p-4 text-left" style={{ color: themeColors.text }}>
                    Assigned By
                  </th>
                  <th 
                    className="p-4 text-left cursor-pointer"
                    onClick={() => handleSort('deadline')}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: themeColors.text }}>Deadline</span>
                      {getSortIcon('deadline')}
                    </div>
                  </th>
                  <th className="p-4 text-left" style={{ color: themeColors.text }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <TableRow key={task._id} task={task} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && tasks.length === 0 && (
        <div 
          className="text-center py-12 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
            color: themeColors.text
          }}
        >
          <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No tasks assigned to you</p>
          <p className="text-sm">You're all caught up! No tasks match your current filters.</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2"
            style={{ borderColor: themeColors.primary }}
          />
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handleFilterChange('page', pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border 
            }}
          >
            ←
          </button>
          
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNum;
            if (pagination.totalPages <= 5) {
              pageNum = i + 1;
            } else if (pagination.page <= 3) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination.totalPages - 2) {
              pageNum = pagination.totalPages - 4 + i;
            } else {
              pageNum = pagination.page - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => handleFilterChange('page', pageNum)}
                className={`px-3 py-1 rounded text-sm transition-colors hover:opacity-90 ${
                  pagination.page === pageNum ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: pagination.page === pageNum ? themeColors.primary : themeColors.background,
                  border: `1px solid ${themeColors.border}`,
                  color: pagination.page === pageNum ? 'white' : themeColors.text
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handleFilterChange('page', pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border 
            }}
          >
            →
          </button>
        </div>
      )}

      {/* Task History Modal */}
      {showHistory && selectedTask && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowHistory(false)}
        >
          <div 
            className="rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: themeColors.surface }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
              <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>
                Task History - {selectedTask.title}
              </h2>
              {selectedTask.deadline && (
                <p className="text-sm mt-1" style={{ color: themeColors.text }}>
                  Deadline: {new Date(selectedTask.deadline).toLocaleString()}
                </p>
              )}
            </div>
            <div className="p-6">
              <TaskHistory task={selectedTask} />
            </div>
            <div className="p-6 border-t flex justify-end" style={{ borderColor: themeColors.border }}>
              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                style={{ 
                  backgroundColor: themeColors.primary,
                  color: 'white'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;