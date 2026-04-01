// src/components/employeeProfile/EmergencyContactSection.jsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const EmergencyContactSection = ({ employee, onUpdate, canEdit = false }) => {
  const { themeColors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: employee?.emergencyContact?.name || '',
    relationship: employee?.emergencyContact?.relationship || '',
    phone: employee?.emergencyContact?.phone || ''
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
      await onUpdate({ emergencyContact: formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating emergency contact:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: employee?.emergencyContact?.name || '',
      relationship: employee?.emergencyContact?.relationship || '',
      phone: employee?.emergencyContact?.phone || ''
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 
          className="text-2xl font-semibold"
          style={{ color: themeColors.text }}
        >
          Emergency Contact
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
              Contact Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text,
                opacity: isEditing ? 1 : 0.7
              }}
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Relationship
            </label>
            <input
              type="text"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text,
                opacity: isEditing ? 1 : 0.7
              }}
              placeholder="Father, Mother, Spouse, etc."
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text,
                opacity: isEditing ? 1 : 0.7
              }}
            />
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

export default EmergencyContactSection;