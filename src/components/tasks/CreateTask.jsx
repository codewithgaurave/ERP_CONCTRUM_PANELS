// src/components/tasks/CreateTask.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import taskAPI from '../../apis/taskAPI';
import { 
  X, 
  Calendar as CalendarIcon,
  User,
  AlertCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const CreateTask = ({ open, onClose, onTaskCreated }) => {
  const { themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    deadline: ''
  });

  useEffect(() => {
    if (open) {
      fetchAssignableEmployees();
      // Set default deadline to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        deadline: tomorrow.toISOString().slice(0, 16)
      }));
    }
  }, [open]);

  const fetchAssignableEmployees = async () => {
    try {
      const response = await taskAPI.getAssignableEmployees();
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const getDeadlineWarning = () => {
    if (!formData.deadline) return null;
    
    const deadline = new Date(formData.deadline);
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return { type: 'error', message: 'Deadline cannot be in the past' };
    } else if (daysDiff === 0) {
      return { type: 'warning', message: 'Deadline is today' };
    } else if (daysDiff <= 1) {
      return { type: 'warning', message: 'Deadline is within 24 hours' };
    } else if (daysDiff <= 3) {
      return { type: 'info', message: 'Deadline is approaching' };
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const deadlineWarning = getDeadlineWarning();
    if (deadlineWarning?.type === 'error') {
      setError(deadlineWarning.message);
      setLoading(false);
      return;
    }

    try {
      await taskAPI.create({
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        deadline: new Date(formData.deadline)
      });
      onTaskCreated();
      onClose();
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'Medium',
        dueDate: '',
        deadline: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const deadlineWarning = getDeadlineWarning();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: themeColors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: themeColors.border }}>
          <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>
            Create New Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:opacity-90"
            style={{ 
              backgroundColor: themeColors.background,
              color: themeColors.text
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div 
              className="p-3 rounded-lg border flex items-center gap-3"
              style={{ 
                backgroundColor: themeColors.danger + '20',
                borderColor: themeColors.danger,
                color: themeColors.danger
              }}
            >
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={handleChange('title')}
              className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
              required
              placeholder="Enter task title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={handleChange('description')}
              rows={3}
              className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
              placeholder="Enter task description..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assign To */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                Assign To *
              </label>
              <div className="relative">
                <User 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: themeColors.textSecondary }}
                />
                <select
                  value={formData.assignedTo}
                  onChange={handleChange('assignedTo')}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name.first} {employee.name.last} ({employee.employeeId})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={handleChange('priority')}
                className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Due Date (Optional) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
              Due Date (Optional)
            </label>
            <div className="relative">
              <CalendarIcon 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: themeColors.textSecondary }}
              />
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={handleChange('dueDate')}
                className="w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text
                }}
              />
            </div>
          </div>

          {/* Deadline (Required) */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
              Deadline *
            </label>
            <div className="relative">
              <Clock 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: themeColors.textSecondary }}
              />
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={handleChange('deadline')}
                className="w-full pl-10 pr-4 py-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: themeColors.background, 
                  borderColor: themeColors.border, 
                  color: themeColors.text
                }}
                required
              />
            </div>
            {deadlineWarning && (
              <div 
                className={`mt-2 p-2 rounded-lg text-sm flex items-center gap-2 ${
                  deadlineWarning.type === 'error' ? 'bg-red-100 text-red-800' :
                  deadlineWarning.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}
              >
                <AlertTriangle size={14} />
                {deadlineWarning.message}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: themeColors.border }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border font-medium transition-colors hover:opacity-90"
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
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: themeColors.primary,
              color: 'white'
            }}
          >
            {loading && (
              <div 
                className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"
              />
            )}
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;