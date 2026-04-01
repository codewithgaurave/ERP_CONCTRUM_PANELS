// src/components/employeeProfile/EmploymentDetailsSection.jsx
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const EmploymentDetailsSection = ({
  employee,
  departments,
  designations,
  employmentStatuses,
  officeLocations,
  workShifts,
  managers,
  onUpdate,
  canEdit = false
}) => {
  const { themeColors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    department: employee?.department?._id || '',
    designation: employee?.designation?._id || '',
    employmentStatus: employee?.employmentStatus?._id || '',
    officeLocation: employee?.officeLocation?._id || '',
    workShift: employee?.workShift?._id || '',
    manager: employee?.manager?._id || '',
    role: employee?.role || '',
    salary: employee?.salary || '',
    dateOfJoining: employee?.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : '',
    dateOfLeaving: employee?.dateOfLeaving ? new Date(employee.dateOfLeaving).toISOString().split('T')[0] : '',
    leavingReason: employee?.leavingReason || ''
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
      console.error('Error updating employment details:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      department: employee?.department?._id || '',
      designation: employee?.designation?._id || '',
      employmentStatus: employee?.employmentStatus?._id || '',
      officeLocation: employee?.officeLocation?._id || '',
      workShift: employee?.workShift?._id || '',
      manager: employee?.manager?._id || '',
      role: employee?.role || '',
      salary: employee?.salary || '',
      dateOfJoining: employee?.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : '',
      dateOfLeaving: employee?.dateOfLeaving ? new Date(employee.dateOfLeaving).toISOString().split('T')[0] : '',
      leavingReason: employee?.leavingReason || ''
    });
    setIsEditing(false);
  };

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
          Employment Details
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
          {/* Department */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
              required
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Designation *
            </label>
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
              required
            >
              <option value="">Select Designation</option>
              {designations.map(designation => (
                <option key={designation._id} value={designation._id}>
                  {designation.title}
                </option>
              ))}
            </select>
          </div>

          {/* Employment Status */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Employment Status *
            </label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
              required
            >
              <option value="">Select Status</option>
              {employmentStatuses.map(status => (
                <option key={status._id} value={status._id}>
                  {status.title}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
              required
            >
              <option value="">Select Role</option>
              <option value="Employee">Employee</option>
              <option value="Team_Leader">Team Leader</option>
              <option value="HR_Manager">HR Manager</option>
            </select>
          </div>

          {/* Office Location */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Office Location *
            </label>
            <select
              name="officeLocation"
              value={formData.officeLocation}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
              required
            >
              <option value="">Select Office Location</option>
              {officeLocations.map(location => (
                <option key={location._id} value={location._id}>
                  {location.officeName}
                </option>
              ))}
            </select>
          </div>

          {/* Work Shift */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Work Shift *
            </label>
            <select
              name="workShift"
              value={formData.workShift}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
              required
            >
              <option value="">Select Work Shift</option>
              {workShifts.map(shift => (
                <option key={shift._id} value={shift._id}>
                  {shift.name} ({shift.startTime} - {shift.endTime})
                </option>
              ))}
            </select>
          </div>

          {/* Manager */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Manager
            </label>
            <select
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
            >
              <option value="">Select Manager</option>
              {managers.map(manager => (
                <option key={manager._id} value={manager._id}>
                  {manager.name.first} {manager.name.last} ({manager.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Salary */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Salary *
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
              required
            />
          </div>

          {/* Date of Joining */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Date of Joining *
            </label>
            <input
              type="date"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
              required
            />
          </div>

          {/* Date of Leaving */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Date of Leaving
            </label>
            <input
              type="date"
              name="dateOfLeaving"
              value={formData.dateOfLeaving}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
              style={inputStyles}
            />
          </div>

          {/* Leaving Reason */}
          {formData.dateOfLeaving && (
            <div className="md:col-span-2">
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: themeColors.text }}
              >
                Leaving Reason
              </label>
              <textarea
                name="leavingReason"
                value={formData.leavingReason}
                onChange={handleChange}
                disabled={!isEditing}
                rows="3"
                className="w-full px-3 py-2 rounded-lg focus:outline-none transition-colors"
                style={inputStyles}
              />
            </div>
          )}
        </div>

        {isEditing && canEdit && (
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

export default EmploymentDetailsSection;