// src/components/employeeProfile/DocumentsSection.jsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const DocumentsSection = ({ employee, onUpdate, canEdit = false }) => {
  const { themeColors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    profilePicture: employee?.profilePicture || '',
    aadharNumber: employee?.aadharNumber || '',
    panNumber: employee?.panNumber || ''
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
      console.error('Error updating documents:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      profilePicture: employee?.profilePicture || '',
      aadharNumber: employee?.aadharNumber || '',
      panNumber: employee?.panNumber || ''
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
          Documents
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
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Profile Picture URL
            </label>
            <input
              type="url"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                border: `1px solid ${themeColors.border}`,
                color: themeColors.text,
                opacity: isEditing ? 1 : 0.7
              }}
              placeholder="https://example.com/profile.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text }}
              >
                Aadhar Number
              </label>
              <input
                type="text"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
                style={{
                  backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                  border: `1px solid ${themeColors.border}`,
                  color: themeColors.text,
                  opacity: isEditing ? 1 : 0.7
                }}
                placeholder="1234 5678 9012"
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text }}
              >
                PAN Number
              </label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
                style={{
                  backgroundColor: isEditing ? themeColors.surface : themeColors.background,
                  border: `1px solid ${themeColors.border}`,
                  color: themeColors.text,
                  opacity: isEditing ? 1 : 0.7
                }}
                placeholder="ABCDE1234F"
              />
            </div>
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

export default DocumentsSection;