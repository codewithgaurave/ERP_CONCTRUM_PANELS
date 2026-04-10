// src/components/tasks/CreateSubTasks.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import taskAPI from '../../apis/taskAPI';
import { 
  X, Users, Target, Plus, Trash2, AlertCircle, 
  User, Hash, CheckCircle, Divide
} from 'lucide-react';

const CreateSubTasks = ({ task, open, onClose, onSubTasksCreated }) => {
  const { themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [assignees, setAssignees] = useState([]);

  useEffect(() => {
    if (open) {
      fetchAssignableEmployees();
    }
  }, [open]);

  const fetchAssignableEmployees = async () => {
    try {
      const response = await taskAPI.getAssignableEmployees();
      setEmployees(response.data.employees.filter(emp => emp.role === 'Employee'));
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const addAssignee = () => {
    setAssignees(prev => [...prev, { 
      employeeId: '', 
      target: Math.ceil(task.targetCount / (assignees.length + 1)) 
    }]);
  };

  const removeAssignee = (index) => {
    setAssignees(prev => prev.filter((_, i) => i !== index));
  };

  const updateAssignee = (index, field, value) => {
    setAssignees(prev => prev.map((assignee, i) => 
      i === index ? { ...assignee, [field]: value } : assignee
    ));
  };

  const autoDistribute = () => {
    if (assignees.length === 0) return;
    
    const baseTarget = Math.floor(task.targetCount / assignees.length);
    const remainder = task.targetCount % assignees.length;
    
    setAssignees(prev => prev.map((assignee, index) => ({
      ...assignee,
      target: baseTarget + (index < remainder ? 1 : 0)
    })));
  };

  const getTotalTarget = () => {
    return assignees.reduce((sum, assignee) => sum + (parseInt(assignee.target) || 0), 0);
  };

  const validateForm = () => {
    if (assignees.length === 0) {
      return 'At least one assignee is required';
    }

    for (let i = 0; i < assignees.length; i++) {
      const assignee = assignees[i];
      if (!assignee.employeeId) {
        return `Please select an employee for assignee ${i + 1}`;
      }
      if (!assignee.target || assignee.target <= 0) {
        return `Please set a valid target for assignee ${i + 1}`;
      }
    }

    const totalTarget = getTotalTarget();
    if (totalTarget !== task.targetCount) {
      return `Total targets (${totalTarget}) must equal task target (${task.targetCount})`;
    }

    // Check for duplicate employees
    const employeeIds = assignees.map(a => a.employeeId);
    const uniqueIds = new Set(employeeIds);
    if (uniqueIds.size !== employeeIds.length) {
      return 'Cannot assign the same employee multiple times';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      await taskAPI.createSubTasks(task._id, {
        assignees: assignees.map(a => a.employeeId),
        individualTargets: assignees.map(a => parseInt(a.target))
      });
      onSubTasksCreated();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create sub-tasks');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !task) return null;

  const totalTarget = getTotalTarget();
  const isTargetValid = totalTarget === task.targetCount;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: themeColors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>
                Distribute Task to Team
              </h2>
              <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
                {task.title}
              </p>
            </div>
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

          {/* Task Summary */}
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: themeColors.background }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Target size={16} style={{ color: themeColors.primary }} />
                <span style={{ color: themeColors.textSecondary }}>Total Target:</span>
                <span className="font-semibold" style={{ color: themeColors.text }}>
                  {task.targetCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} style={{ color: themeColors.success }} />
                <span style={{ color: themeColors.textSecondary }}>Current Progress:</span>
                <span className="font-semibold" style={{ color: themeColors.text }}>
                  {task.currentCount}/{task.targetCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} style={{ color: themeColors.accent }} />
                <span style={{ color: themeColors.textSecondary }}>Task Type:</span>
                <span className="font-semibold" style={{ color: themeColors.text }}>
                  {task.taskType}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div 
              className="p-3 rounded-lg border flex items-center gap-3 mb-4"
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

          {/* Target Distribution Summary */}
          <div className="mb-6 p-4 rounded-lg border" style={{ 
            backgroundColor: isTargetValid ? themeColors.success + '10' : themeColors.warning + '10',
            borderColor: isTargetValid ? themeColors.success : themeColors.warning
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Divide size={16} style={{ color: isTargetValid ? themeColors.success : themeColors.warning }} />
                <span className="font-medium" style={{ color: themeColors.text }}>
                  Target Distribution
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm" style={{ color: themeColors.textSecondary }}>
                  Assigned: {totalTarget} / Required: {task.targetCount}
                </span>
                <button
                  type="button"
                  onClick={autoDistribute}
                  disabled={assignees.length === 0}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: themeColors.primary,
                    color: 'white'
                  }}
                >
                  Auto Distribute
                </button>
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: themeColors.text }}>
                Team Assignments
              </h3>
              <button
                type="button"
                onClick={addAssignee}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: themeColors.primary + '20',
                  color: themeColors.primary
                }}
              >
                <Plus size={16} />
                Add Team Member
              </button>
            </div>

            {assignees.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg" style={{ borderColor: themeColors.border }}>
                <Users size={48} className="mx-auto mb-4 opacity-50" style={{ color: themeColors.textSecondary }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: themeColors.text }}>
                  No team members assigned
                </h3>
                <p className="text-sm mb-4" style={{ color: themeColors.textSecondary }}>
                  Add team members to distribute this task
                </p>
                <button
                  type="button"
                  onClick={addAssignee}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ 
                    backgroundColor: themeColors.primary,
                    color: 'white'
                  }}
                >
                  <Plus size={16} />
                  Add First Member
                </button>
              </div>
            ) : (
              assignees.map((assignee, index) => (
                <div key={index} className="p-4 rounded-lg border" style={{ 
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border
                }}>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ 
                      backgroundColor: themeColors.primary + '20',
                      color: themeColors.primary
                    }}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Employee Selection */}
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                          Team Member
                        </label>
                        <div className="relative">
                          <User 
                            size={16} 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            style={{ color: themeColors.textSecondary }}
                          />
                          <select
                            value={assignee.employeeId}
                            onChange={(e) => updateAssignee(index, 'employeeId', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                            style={{ 
                              backgroundColor: themeColors.surface, 
                              borderColor: themeColors.border, 
                              color: themeColors.text
                            }}
                            required
                          >
                            <option value="">Select Employee</option>
                            {employees.filter(emp => 
                              !assignees.some((a, i) => i !== index && a.employeeId === emp._id)
                            ).map((employee) => (
                              <option key={employee._id} value={employee._id}>
                                {employee.name.first} {employee.name.last} ({employee.employeeId})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Target Count */}
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: themeColors.text }}>
                          Target Count
                        </label>
                        <div className="relative">
                          <Hash 
                            size={16} 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2"
                            style={{ color: themeColors.textSecondary }}
                          />
                          <input
                            type="number"
                            min="1"
                            value={assignee.target}
                            onChange={(e) => updateAssignee(index, 'target', parseInt(e.target.value) || 0)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                            style={{ 
                              backgroundColor: themeColors.surface, 
                              borderColor: themeColors.border, 
                              color: themeColors.text
                            }}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAssignee(index)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove assignee"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Task Details Preview */}
          {task.formFields && task.formFields.length > 0 && (
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: themeColors.background }}>
              <h4 className="text-sm font-semibold mb-2" style={{ color: themeColors.text }}>
                Form Fields ({task.formFields.length})
              </h4>
              <div className="text-xs space-y-1" style={{ color: themeColors.textSecondary }}>
                {task.formFields.slice(0, 3).map((field, i) => (
                  <div key={i}>• {field.label} ({field.fieldType})</div>
                ))}
                {task.formFields.length > 3 && (
                  <div>... and {task.formFields.length - 3} more fields</div>
                )}
              </div>
            </div>
          )}
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
            disabled={loading || !isTargetValid || assignees.length === 0}
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: themeColors.primary,
              color: 'white'
            }}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            )}
            <Users size={16} />
            Create Sub-Tasks ({assignees.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSubTasks;