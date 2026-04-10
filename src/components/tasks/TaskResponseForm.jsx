// src/components/tasks/TaskResponseForm.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import taskAPI from '../../apis/taskAPI';
import { 
  X, Send, AlertCircle, CheckCircle, Star, Upload, 
  FileText, Calendar, Clock, User, Target
} from 'lucide-react';

const TaskResponseForm = ({ task, open, onClose, onResponseSubmitted }) => {
  const { themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [responses, setResponses] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    if (open && task) {
      // Initialize responses object
      const initialResponses = {};
      task.formFields?.forEach(field => {
        if (field.fieldType === 'checkbox') {
          initialResponses[field.id] = [];
        } else {
          initialResponses[field.id] = '';
        }
      });
      setResponses(initialResponses);
      setFiles({});
    }
  }, [open, task]);

  const handleResponseChange = (fieldId, value) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFileChange = (fieldId, fileList) => {
    setFiles(prev => ({
      ...prev,
      [fieldId]: fileList[0]
    }));
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    setResponses(prev => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter(item => item !== option) };
      }
    });
  };

  const validateForm = () => {
    for (const field of task.formFields || []) {
      if (field.required) {
        const response = responses[field.id];
        if (!response || 
            (Array.isArray(response) && response.length === 0) || 
            (typeof response === 'string' && response.trim() === '')) {
          return `${field.label} is required`;
        }
      }
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
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('responses', JSON.stringify(responses));
      
      // Add files
      Object.entries(files).forEach(([fieldId, file]) => {
        if (file) {
          formData.append(fieldId, file);
        }
      });

      await taskAPI.submitResponse(task._id, formData);
      onResponseSubmitted();
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit response');
    } finally {
      setLoading(false);
    }
  };

  if (!open || !task) return null;

  const renderField = (field) => {
    const value = responses[field.id] || '';

    switch (field.fieldType) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.fieldType}
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border, 
              color: themeColors.text
            }}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={3}
            className="w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border, 
              color: themeColors.text
            }}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border, 
              color: themeColors.text
            }}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleResponseChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border, 
              color: themeColors.text
            }}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(field.id, e.target.value)}
                  required={field.required}
                  className="w-4 h-4"
                  style={{ accentColor: themeColors.primary }}
                />
                <span className="text-sm" style={{ color: themeColors.text }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option)}
                  onChange={(e) => handleCheckboxChange(field.id, option, e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: themeColors.primary }}
                />
                <span className="text-sm" style={{ color: themeColors.text }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div>
            <input
              type="file"
              onChange={(e) => handleFileChange(field.id, e.target.files)}
              accept={field.allowedFileTypes?.map(type => `.${type}`).join(',')}
              required={field.required}
              className="w-full px-4 py-3 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border, 
                color: themeColors.text
              }}
            />
            <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
              Max size: {field.maxFileSizeMB}MB. Allowed: {field.allowedFileTypes?.join(', ')}
            </p>
          </div>
        );

      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => handleResponseChange(field.id, rating)}
                className="text-3xl transition-colors hover:scale-110"
              >
                {(value || 0) >= rating ? (
                  <Star size={32} fill={themeColors.warning} color={themeColors.warning} />
                ) : (
                  <Star size={32} color={themeColors.border} />
                )}
              </button>
            ))}
          </div>
        );

      case 'linear_scale':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>
                {field.scaleMinLabel || field.scaleMin}
              </span>
              <input
                type="range"
                min={field.scaleMin}
                max={field.scaleMax}
                value={value || field.scaleMin}
                onChange={(e) => handleResponseChange(field.id, parseInt(e.target.value))}
                className="flex-1 h-2 rounded-full"
                style={{ accentColor: themeColors.primary }}
              />
              <span className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>
                {field.scaleMaxLabel || field.scaleMax}
              </span>
            </div>
            <div className="text-center">
              <span className="text-lg font-bold" style={{ color: themeColors.primary }}>
                {value || field.scaleMin}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: themeColors.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>
                Submit Response
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

          {/* Task Info */}
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: themeColors.background }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: themeColors.primary }} />
                <span style={{ color: themeColors.textSecondary }}>Type:</span>
                <span style={{ color: themeColors.text }}>{task.taskType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target size={16} style={{ color: themeColors.accent }} />
                <span style={{ color: themeColors.textSecondary }}>Target:</span>
                <span style={{ color: themeColors.text }}>{task.currentCount}/{task.targetCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} style={{ color: themeColors.warning }} />
                <span style={{ color: themeColors.textSecondary }}>Deadline:</span>
                <span style={{ color: themeColors.text }}>
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} style={{ color: themeColors.success }} />
                <span style={{ color: themeColors.textSecondary }}>Priority:</span>
                <span style={{ color: themeColors.text }}>{task.priority}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {task.description && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: themeColors.background }}>
              <p className="text-sm" style={{ color: themeColors.text }}>{task.description}</p>
            </div>
          )}

          {task.formFields?.map((field, index) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: themeColors.text }}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}

          {(!task.formFields || task.formFields.length === 0) && (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: themeColors.success }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: themeColors.text }}>
                Simple Task Completion
              </h3>
              <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                This task doesn't require any form submission. Click submit to mark as completed.
              </p>
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
            <Send size={16} />
            Submit Response
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskResponseForm;