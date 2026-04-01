// src/components/EmployeeProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import employeeAPI from '../apis/employeeAPI';
import departmentAPI from '../apis/departmentAPI';
import designationAPI from '../apis/designationAPI';
import employmentStatusAPI from '../apis/employmentStatusAPI';
import officeLocationAPI from '../apis/officeLocationAPI';
import workShiftAPI from '../apis/workShiftAPI';

// Section Components
import BasicInfoSection from './employeeProfile/BasicInfoSection';
import AddressSection from './employeeProfile/AddressSection';
import EmploymentDetailsSection from './employeeProfile/EmploymentDetailsSection';
import BankDetailsSection from './employeeProfile/BankDetailsSection';
import DocumentsSection from './employeeProfile/DocumentsSection';
import EmergencyContactSection from './employeeProfile/EmergencyContactSection';
import PersonalInfoSection from './employeeProfile/PersonalInfoSection';
import EmployeeAttendanceDetails from './employeeProfile/EmployeeAttendanceDetails';

const EmployeeProfile = () => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic-info');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use URL id if available, otherwise use logged-in user's id
  const id = urlId || user?._id;

  // Master data states
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employmentStatuses, setEmploymentStatuses] = useState([]);
  const [officeLocations, setOfficeLocations] = useState([]);
  const [workShifts, setWorkShifts] = useState([]);
  const [managers, setManagers] = useState([]);

  // Fetch employee data
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching employee with ID:', id);
      console.log('👤 Current user:', user);
      const response = await employeeAPI.getById(id);
      console.log('✅ Employee data fetched:', response.data.employee);
      setEmployee(response.data.employee);
    } catch (err) {
      console.error('❌ Error fetching employee:', err);
      console.error('❌ Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all master data
  const fetchMasterData = async () => {
    try {
      // Fetch basic data that all roles can access
      const basicPromises = [
        departmentAPI.getAll({ limit: 100 }).catch(() => ({ data: { departments: [] } })),
        designationAPI.getAll({ limit: 100 }).catch(() => ({ data: { designations: [] } })),
        employmentStatusAPI.getAll({ limit: 100 }).catch(() => ({ data: { employmentStatuses: [] } })),
        officeLocationAPI.getAll().catch(() => ({ data: { officeLocations: [] } })),
        employeeAPI.getManagers().catch(() => ({ data: { managers: [] } }))
      ];
      
      const [
        deptResponse,
        desigResponse,
        statusResponse,
        locationResponse,
        managersResponse
      ] = await Promise.all(basicPromises);
      
      setDepartments(deptResponse.data.departments || []);
      setDesignations(desigResponse.data.designations || []);
      setEmploymentStatuses(statusResponse.data.employmentStatuses || []);
      setOfficeLocations(locationResponse.data.officeLocations || []);
      setManagers(managersResponse.data.managers || []);
      
      // Try to fetch workshift data separately (only for HR Manager)
      if (user?.role === 'HR_Manager') {
        try {
          const shiftResponse = await workShiftAPI.getAllWithoutFilters();
          setWorkShifts(shiftResponse.data || []);
        } catch (workshiftError) {
          console.error('Workshift API error:', workshiftError);
          setWorkShifts([]);
        }
      } else {
        // For Team Leaders and Employees, use empty array
        console.log('Skipping workshift API for role:', user?.role);
        setWorkShifts([]);
      }
      
    } catch (err) {
      console.error('Error fetching master data:', err);
      // Don't show error toast for permission issues
      if (!err.response || err.response.status !== 403) {
        toast.error('Failed to load some reference data');
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
      fetchMasterData();
    }
  }, [id]);

  // Handle section updates with role-based permissions
  const handleSectionUpdate = async (section, data) => {
    try {
      console.log('🔧 Updating section:', section);
      console.log('📝 Data:', data);
      console.log('🆔 Employee ID being used:', id);
      console.log('🆔 Employee._id:', employee?._id);
      console.log('👤 User role:', user?.role);
      console.log('🔐 Is own profile:', employee?._id === user?._id);
      
      // Check if current user can edit this section
      const canEdit = canEditSection(section, user?.role, employee?._id, user?._id);
      if (!canEdit) {
        toast.error('You do not have permission to edit this section');
        return;
      }

      let response;
      
      // If employee is updating their own profile, use my-profile endpoint
      if (user?.role === 'Employee' && employee?._id === user?._id) {
        console.log('✅ Using my-profile endpoint for Employee');
        response = await employeeAPI.updateMyProfile(section, data);
      } else {
        // HR Manager or Team Leader updating someone else's profile
        const employeeId = employee?._id;
        console.log('✅ Using employee ID:', employeeId);
        
        switch (section) {
          case 'basic-info':
            response = await employeeAPI.updateBasicInfo(employeeId, data);
            break;
          case 'address':
            response = await employeeAPI.updateAddress(employeeId, data);
            break;
          case 'employment-details':
            response = await employeeAPI.updateEmploymentDetails(employeeId, data);
            break;
          case 'bank-details':
            response = await employeeAPI.updateBankDetails(employeeId, data);
            break;
          case 'documents':
            response = await employeeAPI.updateDocuments(employeeId, data);
            break;
          case 'emergency-contact':
            response = await employeeAPI.updateEmergencyContact(employeeId, data);
            break;
          case 'personal-info':
            response = await employeeAPI.updatePersonalInfo(employeeId, data);
            break;
          default:
            throw new Error('Invalid section');
        }
      }

      setEmployee(response.data.employee);
      toast.success(`${section.replace('-', ' ')} updated successfully!`);
    } catch (err) {
      console.error('❌ Update error:', err);
      console.error('❌ Error response:', err.response?.data);
      toast.error(err.response?.data?.message || `Failed to update ${section}`);
    }
  };

  // Check if user can edit a specific section
  const canEditSection = (section, userRole, employeeId, currentUserId) => {
    // Employee CANNOT edit anything
    if (userRole === 'Employee') {
      return false;
    }
    
    // Team Leader CANNOT edit anything (including their own profile)
    if (userRole === 'Team_Leader') {
      return false;
    }
    
    // HR Manager can edit everything
    if (userRole === 'HR_Manager') {
      return true;
    }
    
    return false;
  };

  // Navigation tabs
  const tabs = [
    { id: 'attendance', name: 'Attendance', icon: '📊' }, // Add this line
    { id: 'basic-info', name: 'Basic Information', icon: '👤' },
    { id: 'address', name: 'Address', icon: '🏠' },
    { id: 'employment-details', name: 'Employment', icon: '💼' },
    { id: 'bank-details', name: 'Bank Details', icon: '🏦' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'emergency-contact', name: 'Emergency Contact', icon: '🚨' },
    { id: 'personal-info', name: 'Personal Info', icon: '🔒' },
  ];

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: themeColors.background, color: themeColors.text }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: themeColors.primary }}
          ></div>
          <p className="mt-4" style={{ color: themeColors.textSecondary }}>
            Loading employee data...
          </p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: themeColors.background, color: themeColors.text }}
      >
        <div className="text-center">
          <div className="text-xl mb-4" style={{ color: themeColors.danger }}>
            Employee Not Found
          </div>
          <p className="mb-4" style={{ color: themeColors.textSecondary }}>
            The requested employee could not be found.
          </p>
          <button
            onClick={() => navigate('/employees')}
            className="px-6 py-2 rounded-lg font-medium text-white"
            style={{ backgroundColor: themeColors.primary }}
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8"
      style={{ backgroundColor: themeColors.background, color: themeColors.text }}
    >
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {employee?.name?.first} {employee?.name?.last}
              </h1>
              <p className="mt-2" style={{ color: themeColors.textSecondary }}>
                Employee ID: {employee?.employeeId} • {employee?.designation?.title}
                {employee?.isActive ? (
                  <span
                    className="ml-2 text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: themeColors.success + '20', color: themeColors.success }}
                  >
                    Active
                  </span>
                ) : (
                  <span
                    className="ml-2 text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: themeColors.danger + '20', color: themeColors.danger }}
                  >
                    Inactive
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => navigate('/employees')}
              className="px-6 py-2 rounded-lg font-medium border transition-colors"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text
              }}
            >
              Back
            </button>
          </div>
        </div>

        <div
          className="rounded-xl shadow-sm border overflow-hidden"
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border
          }}
        >
          {/* Navigation Tabs */}
          <div style={{ borderColor: themeColors.border }}>
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? themeColors.primary : 'transparent',
                    color: activeTab === tab.id ? themeColors.primary : themeColors.textSecondary,
                    backgroundColor: activeTab === tab.id ? themeColors.primary + '10' : 'transparent'
                  }}
                >
                  <span className="mr-2 text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          
          <div className="p-6">

            {/* // In the tab content section, add: */}
            {activeTab === 'attendance' && (
              <EmployeeAttendanceDetails employee={employee} />
            )}

            {activeTab === 'basic-info' && (
              <BasicInfoSection
                employee={employee}
                onUpdate={(data) => handleSectionUpdate('basic-info', data)}
                canEdit={user?.role !== 'Employee' && canEditSection('basic-info', user?.role, employee?._id, user?._id)}
              />
            )}

            {activeTab === 'address' && (
              <AddressSection
                employee={employee}
                onUpdate={(data) => handleSectionUpdate('address', data)}
                canEdit={user?.role !== 'Employee' && canEditSection('address', user?.role, employee?._id, user?._id)}
              />
            )}

            {activeTab === 'employment-details' && (
              <EmploymentDetailsSection
                employee={employee}
                departments={departments}
                designations={designations}
                employmentStatuses={employmentStatuses}
                officeLocations={officeLocations}
                workShifts={workShifts}
                managers={managers}
                onUpdate={(data) => handleSectionUpdate('employment-details', data)}
                canEdit={user?.role !== 'Employee' && canEditSection('employment-details', user?.role, employee?._id, user?._id)}
              />
            )}

            {activeTab === 'bank-details' && (
              <BankDetailsSection
                employee={employee}
                onUpdate={(data) => handleSectionUpdate('bank-details', data)}
                canEdit={user?.role !== 'Employee' && canEditSection('bank-details', user?.role, employee?._id, user?._id)}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsSection
                employee={employee}
                onUpdate={(data) => handleSectionUpdate('documents', data)}
                canEdit={user?.role !== 'Employee' && canEditSection('documents', user?.role, employee?._id, user?._id)}
              />
            )}

            {activeTab === 'emergency-contact' && (
              <EmergencyContactSection
                employee={employee}
                onUpdate={(data) => handleSectionUpdate('emergency-contact', data)}
                canEdit={user?.role !== 'Employee' && canEditSection('emergency-contact', user?.role, employee?._id, user?._id)}
              />
            )}

            {activeTab === 'personal-info' && (
              <PersonalInfoSection
                employee={employee}
                onUpdate={(data) => handleSectionUpdate('personal-info', data)}
                canEdit={user?.role !== 'Employee' && canEditSection('personal-info', user?.role, employee?._id, user?._id)}
              />
            )}


          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;