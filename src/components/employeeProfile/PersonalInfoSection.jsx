// src/components/employeeProfile/PersonalInfoSection.jsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const PersonalInfoSection = ({ employee, onUpdate, canEdit = false }) => {
  const { themeColors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    personalEmail: employee?.personalEmail || '',
    bloodGroup: employee?.bloodGroup || '',
    maritalStatus: employee?.maritalStatus || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      personalEmail: employee?.personalEmail || '',
      bloodGroup: employee?.bloodGroup || '',
      maritalStatus: employee?.maritalStatus || ''
    });
    setIsEditing(false);
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];

  const inputStyles = {
    backgroundColor: isEditing ? themeColors.surface : themeColors.background,
    border: `1px solid ${themeColors.border}`,
    color: themeColors.text,
    opacity: isEditing ? 1 : 0.7
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-2xl font-semibold"
          style={{ color: themeColors.text }}
        >
          Personal Information
        </h2>
        {canEdit && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ 
              backgroundColor: isEditing ? themeColors.danger : themeColors.primary,
              color: themeColors.surface
            }}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Personal Email
            </label>
            <input
              type="email"
              name="personalEmail"
              value={formData.personalEmail}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Blood Group
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Marital Status
            </label>
            <select
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
            >
              <option value="">Select Marital Status</option>
              {maritalStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {isEditing && (
          <div 
            className="flex justify-end space-x-4 pt-6 border-t"
            style={{ borderColor: themeColors.border }}
          >
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
              style={{ backgroundColor: themeColors.primary }}
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonalInfoSection;