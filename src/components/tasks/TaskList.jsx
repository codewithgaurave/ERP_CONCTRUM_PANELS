// src/components/tasks/TaskList.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import taskAPI from '../../apis/taskAPI';
import TaskHistory from './TaskHistory';
import { 
  Search, 
  Eye,
  Calendar,
  User,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckSquare,
  Grid,
  Table,
  SortAsc,
  SortDesc,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  PlayCircle,
  Trash2,
  Archive,
  ArchiveRestore
} from 'lucide-react';

const TaskList = ({ isManager = false, refresh }) => {
  const { themeColors } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortConfig, setSortConfig] = useState({ key: 'deadline', direction: 'asc' });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    deadlineStatus: '',
    isActive: "true",
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalTasks: 0
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        ...filters,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction
      };
      const response = isManager
        ? await taskAPI.getAll(params)
        : await taskAPI.getMyTasks(params);

      setTasks(response.data.tasks || []);
      const p = response.data.pagination || {};
      setPagination({
        page: p.currentPage || p.page || 1,
        totalPages: p.totalPages || 1,
        totalTasks: p.totalTasks || 0
      });
    } catch (error) {
      setError('Failed to fetch tasks: ' + (error.response?.data?.message || error.message));
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters, refresh, sortConfig, isManager]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };


  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatusUpdate = async (taskId, newStatus, remarks = '') => {
    try {
      await taskAPI.updateStatus(taskId, { status: newStatus, remarks });
      fetchTasks();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleReview = async (taskId, status, remarks = '') => {
    try {
      await taskAPI.reviewTask(taskId, { status, remarks });
      fetchTasks();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to review task');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.delete(taskId);
        fetchTasks();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete task');
      }
    }
  };

  const handleRestore = async (taskId) => {
    try {
      await taskAPI.restoreTask(taskId);
      fetchTasks();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to restore task');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': themeColors.textSecondary,
      'Assigned': themeColors.primary,
      'In Progress': themeColors.warning,
      'Pending': themeColors.accent,
      'Completed': themeColors.success,
      'Approved': themeColors.success,
      'Rejected': themeColors.danger
    };
    return colors[status] || themeColors.textSecondary;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': themeColors.success,
      'Medium': themeColors.accent,
      'High': themeColors.warning,
      'Urgent': themeColors.danger
    };
    return colors[priority] || themeColors.textSecondary;
  };

  const getDeadlineStatus = (task) => {
    if (task.status === 'Completed' || task.status === 'Approved') {
      return { status: 'completed', color: themeColors.success, label: 'Completed' };
    }
    
    if (!task.deadline) {
      return { status: 'normal', color: themeColors.textSecondary, label: 'No Deadline' };
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
        className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
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

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {tasks.map((task) => {
        const deadlineInfo = getDeadlineStatus(task);
        const isTaskActive = task.isActive;
        
        return (
          <div
            key={task._id}
            className={`p-6 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
              deadlineInfo.status === 'overdue' ? 'border-l-4' : ''
            } ${!isTaskActive ? 'opacity-60 bg-gray-50 dark:bg-gray-800' : ''}`}
            style={{ 
              backgroundColor: !isTaskActive ? themeColors.background + '80' : themeColors.surface,
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
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold flex-1 pr-2 line-clamp-2">{task.title}</h3>
                {!isTaskActive && (
                  <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full flex items-center gap-1">
                    <Archive size={12} />
                    Deleted
                  </span>
                )}
              </div>

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
                  <User size={14} style={{ color: themeColors.textSecondary }} />
                  <span style={{ color: themeColors.textSecondary }}>
                    By: {task.assignedBy?.name?.first} {task.assignedBy?.name?.last}
                  </span>
                </div>
                
                {!isManager && (
                  <div className="flex items-center gap-2">
                    <User size={14} style={{ color: themeColors.textSecondary }} />
                    <span style={{ color: themeColors.textSecondary }}>Assigned to you</span>
                  </div>
                )}
                
                {isManager && (
                  <div className="flex items-center gap-2">
                    <User size={14} style={{ color: themeColors.textSecondary }} />
                    <span style={{ color: themeColors.textSecondary }}>
                      To: {task.assignedTo?.name?.first} {task.assignedTo?.name?.last}
                    </span>
                  </div>
                )}

                {task.deadline && (
                  <div className="flex items-center gap-2">
                    <Clock size={14} style={{ color: themeColors.textSecondary }} />
                    <span style={{ color: themeColors.textSecondary }}>
                      Deadline: {new Date(task.deadline).toLocaleDateString()} {new Date(task.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                )}

                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={14} style={{ color: themeColors.textSecondary }} />
                    <span style={{ color: themeColors.textSecondary }}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

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

                {/* Active Task Actions */}
                {isTaskActive && (
                  <>
                    {/* Employee Actions */}
                    {!isManager && task.status !== 'Completed' && task.status !== 'Approved' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const remarks = prompt('Enter remarks for completing this task:');
                            if (remarks) {
                              handleStatusUpdate(task._id, 'Completed', remarks);
                            }
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
                              const remarks = prompt('Enter remarks for starting this task:');
                              if (remarks) {
                                handleStatusUpdate(task._id, 'In Progress', remarks);
                              }
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

                    {/* Manager Actions */}
                    {isManager && (
                      <>
                        {task.status === 'Completed' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const remarks = prompt('Enter approval remarks:');
                                if (remarks) {
                                  handleReview(task._id, 'Approved', remarks);
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors hover:opacity-90"
                              style={{ 
                                backgroundColor: themeColors.success + '20',
                                color: themeColors.success
                              }}
                            >
                              <ThumbsUp size={12} />
                              Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const remarks = prompt('Enter rejection reason:');
                                if (remarks) {
                                  handleReview(task._id, 'Rejected', remarks);
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors hover:opacity-90"
                              style={{ 
                                backgroundColor: themeColors.danger + '20',
                                color: themeColors.danger
                              }}
                            >
                              <ThumbsDown size={12} />
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(task._id);
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors hover:opacity-90"
                          style={{ 
                            backgroundColor: themeColors.danger + '20',
                            color: themeColors.danger
                          }}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </>
                    )}
                  </>
                )}

                {/* Deleted Task Actions (Manager Only) */}
                {!isTaskActive && isManager && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestore(task._id);
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors hover:opacity-90"
                    style={{ 
                      backgroundColor: themeColors.success + '20',
                      color: themeColors.success
                    }}
                  >
                    <ArchiveRestore size={12} />
                    Restore
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr style={{ backgroundColor: themeColors.background }}>
            <th 
              className="p-3 text-left border-b text-sm font-medium cursor-pointer"
              style={{ borderColor: themeColors.border }}
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-1">
                Title
                {sortConfig.key === 'title' && (
                  sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                )}
              </div>
            </th>
            <th 
              className="p-3 text-left border-b text-sm font-medium cursor-pointer"
              style={{ borderColor: themeColors.border }}
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1">
                Status
                {sortConfig.key === 'status' && (
                  sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                )}
              </div>
            </th>
            <th 
              className="p-3 text-left border-b text-sm font-medium cursor-pointer"
              style={{ borderColor: themeColors.border }}
              onClick={() => handleSort('priority')}
            >
              <div className="flex items-center gap-1">
                Priority
                {sortConfig.key === 'priority' && (
                  sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                )}
              </div>
            </th>
            <th 
              className="p-3 text-left border-b text-sm font-medium cursor-pointer"
              style={{ borderColor: themeColors.border }}
              onClick={() => handleSort('deadline')}
            >
              <div className="flex items-center gap-1">
                Deadline
                {sortConfig.key === 'deadline' && (
                  sortConfig.direction === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
                )}
              </div>
            </th>
            <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
              Assigned To
            </th>
            <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
              Status
            </th>
            <th className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const deadlineInfo = getDeadlineStatus(task);
            const isTaskActive = task.isActive;
            
            return (
              <tr 
                key={task._id}
                className={`border-b transition-colors hover:opacity-90 cursor-pointer ${
                  deadlineInfo.status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20' : 
                  !isTaskActive ? 'bg-gray-50 dark:bg-gray-800 opacity-70' : ''
                }`}
                style={{ borderColor: themeColors.border }}
                onClick={() => {
                  setSelectedTask(task);
                  setShowHistory(true);
                }}
              >
                <td className="p-3 text-sm">
                  <div>
                    <div className="font-medium">{task.title}</div>
                    {!isTaskActive && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Archive size={12} />
                        Deleted
                      </span>
                    )}
                    <div className="text-xs mt-1 line-clamp-2" style={{ color: themeColors.textSecondary }}>
                      {task.description || 'No description'}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <StatusBadge status={task.status} />
                </td>
                <td className="p-3">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="p-3 text-sm">
                  <div className="flex flex-col gap-1">
                    {task.deadline ? (
                      <>
                        <span style={{ color: themeColors.text }}>
                          {new Date(task.deadline).toLocaleDateString()}
                        </span>
                        <DeadlineBadge task={task} />
                      </>
                    ) : (
                      <span style={{ color: themeColors.textSecondary }}>No deadline</span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={14} style={{ color: themeColors.textSecondary }} />
                    <span style={{ color: themeColors.textSecondary }}>
                      {isManager 
                        ? `${task.assignedTo?.name?.first} ${task.assignedTo?.name?.last}`
                        : 'You'
                      }
                    </span>
                  </div>
                </td>
                <td className="p-3 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    isTaskActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {isTaskActive ? 'Active' : 'Deleted'}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        setShowHistory(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:opacity-90"
                      style={{ 
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                        border: `1px solid ${themeColors.border}`
                      }}
                    >
                      <Eye size={12} />
                    </button>

                    {/* Active Task Actions */}
                    {isTaskActive && (
                      <>
                        {/* Employee Actions */}
                        {!isManager && task.status !== 'Completed' && task.status !== 'Approved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const remarks = prompt('Enter remarks for completing this task:');
                              if (remarks) {
                                handleStatusUpdate(task._id, 'Completed', remarks);
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:opacity-90"
                            style={{ 
                              backgroundColor: themeColors.success + '20',
                              color: themeColors.success
                            }}
                          >
                            <CheckCircle size={12} />
                          </button>
                        )}

                        {/* Manager Actions */}
                        {isManager && (
                          <>
                            {task.status === 'Completed' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const remarks = prompt('Enter approval remarks:');
                                    if (remarks) {
                                      handleReview(task._id, 'Approved', remarks);
                                    }
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:opacity-90"
                                  style={{ 
                                    backgroundColor: themeColors.success + '20',
                                    color: themeColors.success
                                  }}
                                >
                                  <ThumbsUp size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const remarks = prompt('Enter rejection reason:');
                                    if (remarks) {
                                      handleReview(task._id, 'Rejected', remarks);
                                    }
                                  }}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:opacity-90"
                                  style={{ 
                                    backgroundColor: themeColors.danger + '20',
                                    color: themeColors.danger
                                  }}
                                >
                                  <ThumbsDown size={12} />
                                </button>
                              </>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(task._id);
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:opacity-90"
                              style={{ 
                                backgroundColor: themeColors.danger + '20',
                                color: themeColors.danger
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {/* Deleted Task Actions (Manager Only) */}
                    {!isTaskActive && isManager && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(task._id);
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:opacity-90"
                        style={{ 
                          backgroundColor: themeColors.success + '20',
                          color: themeColors.success
                        }}
                      >
                        <ArchiveRestore size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
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
            className="ml-auto text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header with Task Status Info */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>
          {filters.isActive === 'false' ? 'Deleted Tasks' : 'Active Tasks'}
        </h2>
        {filters.isActive === 'false' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 text-sm">
            <Archive size={16} />
            <span>Viewing deleted tasks</span>
          </div>
        )}
      </div>

      <div 
        className="p-6 rounded-xl border"
        style={{ 
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border
        }}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
            {/* Search */}
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search 
                  size={18} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: themeColors.textSecondary }}
                />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                />
              </div>
            </div>

            {/* Task Status Filter */}
            {isManager && (
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive',e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text
                }}
              >
                <option value="true">Active Tasks</option>
                <option value="false">Deleted Tasks</option>
              </select>
            )}

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
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

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
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

            {/* Deadline Status Filter */}
            <select
              value={filters.deadlineStatus}
              onChange={(e) => handleFilterChange('deadlineStatus', e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            >
              <option value="">All Deadlines</option>
              <option value="overdue">Overdue</option>
              <option value="urgent">Urgent</option>
              <option value="approaching">Approaching</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* View Mode Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: viewMode === 'grid' ? themeColors.primary : themeColors.background,
                  color: viewMode === 'grid' ? 'white' : themeColors.text
                }}
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
              >
                <Table size={18} />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchTasks}
              className="p-2 rounded-lg border transition-colors hover:opacity-90"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border 
              }}
              title="Refresh"
            >
              <RefreshCw size={18} style={{ color: themeColors.text }} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm" style={{ color: themeColors.textSecondary }}>
          Showing {tasks.length} of {pagination.totalTasks} tasks
        </div>
        {viewMode === 'table' && (
          <div className="text-sm" style={{ color: themeColors.textSecondary }}>
            Sorted by: {sortConfig.key} ({sortConfig.direction})
          </div>
        )}
      </div>

      <div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div 
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: themeColors.primary }}
            />
          </div>
        ) : tasks.length === 0 ? (
          <div 
            className="text-center py-12 rounded-xl border"
            style={{ 
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.textSecondary
            }}
          >
            <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">
              {filters.isActive === 'false' ? 'No deleted tasks found' : 'No tasks found'}
            </p>
            <p className="text-sm">
              {filters.isActive === 'false' 
                ? 'No deleted tasks match your current filters.' 
                : 'No tasks match your current filters.'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <GridView />
        ) : (
          <TableView />
        )}
      </div>

      {/* Rest of the component remains the same */}
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
                <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                  Deadline: {new Date(selectedTask.deadline).toLocaleString()}
                </p>
              )}
              {!selectedTask.isActive && (
                <p className="text-sm mt-1 text-yellow-600">
                  <Archive size={14} className="inline mr-1" />
                  This task is currently deleted
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

export default TaskList;
