// src/components/tasks/CreateDynamicTask.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import taskAPI from '../../apis/taskAPI';
import { 
  X, Calendar as CalendarIcon, User, AlertCircle, Clock, AlertTriangle,
  Plus, Trash2, GripVertical, Type, AlignLeft, Hash, Mail, 
  ChevronDown, Circle, CheckSquare, Upload, Star, SlidersHorizontal,
  Layers, Settings
} from 'lucide-react';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: Type, color: '#3B82F6' },
  { value: 'textarea', label: 'Long Text', icon: AlignLeft, color: '#8B5CF6' },
  { value: 'number', label: 'Number', icon: Hash, color: '#10B981' },
  { value: 'email', label: 'Email', icon: Mail, color: '#F59E0B' },
  { value: 'date', label: 'Date', icon: CalendarIcon, color: '#EC4899' },
  { value: 'select', label: 'Dropdown', icon: ChevronDown, color: '#84CC16' },
  { value: 'radio', label: 'Multiple Choice', icon: Circle, color: '#F97316' },
  { value: 'checkbox', label: 'Checkboxes', icon: CheckSquare, color: '#14B8A6' },
  { value: 'file', label: 'File Upload', icon: Upload, color: '#6366F1' },
  { value: 'rating', label: 'Rating', icon: Star, color: '#EAB308' },
  { value: 'linear_scale', label: 'Linear Scale', icon: SlidersHorizontal, color: '#A855F7' }
];

const TASK_TYPES = [
  { value: 'Survey', label: 'Survey', description: 'Collect responses from multiple people' },
  { value: 'Machine Installation', label: 'Machine Installation', description: 'Track machine installation tasks' },
  { value: 'Data Collection', label: 'Data Collection', description: 'Gather specific data points' },
  { value: 'Inspection', label: 'Inspection', description: 'Quality or safety inspections' },
  { value: 'Training', label: 'Training', description: 'Training completion tracking' },
  { value: 'Custom', label: 'Custom', description: 'Custom task type' }
];

const CreateDynamicTask = ({ open, onClose, onTaskCreated }) => {
  const { themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: 'Survey',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    deadline: '',
    targetCount: 1,
    formFields: []
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

  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`,
      label: 'Untitled Question',
      fieldType: type,
      placeholder: '',
      options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1'] : [],
      required: false,
      order: formData.formFields.length,
      scaleMin: 1,
      scaleMax: 5,
      scaleMinLabel: '',
      scaleMaxLabel: '',
      allowedFileTypes: ['pdf', 'jpg', 'png'],
      maxFileSizeMB: 5
    };
    setFormData(prev => ({
      ...prev,
      formFields: [...prev.formFields, newField]
    }));
  };

  const updateField = (index, key, value) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.map((f, i) => i === index ? { ...f, [key]: value } : f)
    }));
  };

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      formFields: prev.formFields.filter((_, i) => i !== index)
    }));
  };

  const handleDragStart = (index) => setDraggedIndex(index);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newFields = [...formData.formFields];
    const [removed] = newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, removed);
    setFormData(prev => ({ ...prev, formFields: newFields }));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => setDraggedIndex(null);

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
        deadline: new Date(formData.deadline),
        targetCount: parseInt(formData.targetCount) || 1
      });
      onTaskCreated();
      onClose();
      setFormData({
        title: '',
        description: '',
        taskType: 'Survey',
        assignedTo: '',
        priority: 'Medium',
        dueDate: '',
        deadline: '',
        targetCount: 1,
        formFields: []
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
        className="rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: themeColors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: themeColors.border }}>
          <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>
            Create Dynamic Task
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

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: themeColors.border }}>
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'basic' ? 'border-b-2' : ''
            }`}
            style={{
              color: activeTab === 'basic' ? themeColors.primary : themeColors.textSecondary,
              borderColor: activeTab === 'basic' ? themeColors.primary : 'transparent'
            }}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'form' ? 'border-b-2' : ''
            }`}
            style={{
              color: activeTab === 'form' ? themeColors.primary : themeColors.textSecondary,
              borderColor: activeTab === 'form' ? themeColors.primary : 'transparent'
            }}
          >
            Form Builder ({formData.formFields.length} fields)
          </button>
        </div>

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

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              {/* Task Type */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  Task Type *
                </label>
                <select
                  value={formData.taskType}
                  onChange={handleChange('taskType')}
                  className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: themeColors.background, 
                    borderColor: themeColors.border, 
                    color: themeColors.text
                  }}
                  required
                >
                  {TASK_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

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
                          {employee.name.first} {employee.name.last} ({employee.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Count */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                    Target Count *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.targetCount}
                    onChange={handleChange('targetCount')}
                    className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border, 
                      color: themeColors.text
                    }}
                    required
                    placeholder="e.g., 5000"
                  />
                  <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                    Number of responses/completions needed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                    Due Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={handleChange('dueDate')}
                    className="w-full p-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border, 
                      color: themeColors.text
                    }}
                  />
                </div>
              </div>

              {/* Deadline */}
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
            </div>
          )}

          {/* Form Builder Tab */}
          {activeTab === 'form' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Field Types Palette */}
              <div className="lg:col-span-4">
                <div className="sticky top-4 rounded-xl border p-4" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: themeColors.text }}>Add Fields</h3>
                  <div className="space-y-2">
                    {FIELD_TYPES.map(type => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => addField(type.value)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:shadow-md"
                          style={{ 
                            color: themeColors.text,
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = `${type.color}10`;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${type.color}15` }}
                          >
                            <IconComponent size={16} style={{ color: type.color }} />
                          </div>
                          <span className="font-medium">{type.label}</span>
                          <Plus size={14} className="ml-auto" style={{ color: type.color }} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="lg:col-span-8 space-y-4">
                {formData.formFields.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl" style={{ borderColor: themeColors.border }}>
                    <Layers size={48} className="mx-auto mb-4 opacity-50" style={{ color: themeColors.textSecondary }} />
                    <h3 className="text-lg font-bold mb-2" style={{ color: themeColors.text }}>No fields yet</h3>
                    <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                      Add fields from the left panel to build your form
                    </p>
                  </div>
                ) : (
                  formData.formFields.map((field, index) => {
                    const fieldType = FIELD_TYPES.find(t => t.value === field.fieldType);
                    const IconComponent = fieldType?.icon || Type;
                    
                    return (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className="p-4 rounded-xl border-2 transition-all duration-300"
                        style={{ 
                          backgroundColor: themeColors.surface, 
                          borderColor: themeColors.border
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-2 pt-1">
                            <GripVertical size={16} className="text-gray-300 cursor-grab" />
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${fieldType?.color || '#6366F1'}15` }}
                            >
                              <IconComponent size={16} style={{ color: fieldType?.color || '#6366F1' }} />
                            </div>
                          </div>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <input
                                value={field.label}
                                onChange={e => updateField(index, 'label', e.target.value)}
                                className="text-lg font-semibold flex-1 border-0 outline-none bg-transparent"
                                placeholder="Question"
                                style={{ color: themeColors.text }}
                              />
                              <label className="flex items-center gap-2 text-sm">
                                <input 
                                  type="checkbox" 
                                  checked={field.required} 
                                  onChange={e => updateField(index, 'required', e.target.checked)}
                                />
                                Required
                              </label>
                            </div>
                            
                            {['text', 'email', 'number'].includes(field.fieldType) && (
                              <input
                                value={field.placeholder}
                                onChange={e => updateField(index, 'placeholder', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                placeholder="Placeholder text..."
                                style={{ 
                                  borderColor: themeColors.border,
                                  backgroundColor: themeColors.background
                                }}
                              />
                            )}

                            {['select', 'radio', 'checkbox'].includes(field.fieldType) && (
                              <div className="space-y-2">
                                {field.options.map((opt, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                    <input
                                      value={opt}
                                      onChange={e => {
                                        const newOpts = [...field.options];
                                        newOpts[i] = e.target.value;
                                        updateField(index, 'options', newOpts);
                                      }}
                                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                      style={{ 
                                        borderColor: themeColors.border,
                                        backgroundColor: themeColors.background
                                      }}
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => updateField(index, 'options', field.options.filter((_, idx) => idx !== i))} 
                                      className="p-2 rounded-lg hover:bg-red-50"
                                    >
                                      <Trash2 size={14} className="text-red-500" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => updateField(index, 'options', [...field.options, `Option ${field.options.length + 1}`])}
                                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors"
                                  style={{ 
                                    color: themeColors.primary,
                                    backgroundColor: `${themeColors.primary}10`
                                  }}
                                >
                                  <Plus size={14} />
                                  Add option
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <button 
                            type="button"
                            onClick={() => removeField(index)} 
                            className="p-2 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    );
                  })
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
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ 
              backgroundColor: themeColors.primary,
              color: 'white'
            }}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            )}
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDynamicTask;