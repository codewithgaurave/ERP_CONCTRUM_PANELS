// src/components/EmployeeProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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

const EmployeeProfileModal = ({ isOpen, onClose, employeeId }) => {
  const { themeColors } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('basic-info');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const response = await employeeAPI.getById(employeeId);
      setEmployee(response.data.employee);
    } catch (err) {
      console.error('Error fetching employee:', err);
      toast.error('Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all master data
  const fetchMasterData = async () => {
    try {
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
      
      if (user?.role === 'HR_Manager') {
        try {
          const shiftResponse = await workShiftAPI.getAllWithoutFilters();
          setWorkShifts(shiftResponse.data || []);
        } catch (workshiftError) {
          console.error('Workshift API error:', workshiftError);
          setWorkShifts([]);
        }
      } else {
        setWorkShifts([]);
      }
      
    } catch (err) {
      console.error('Error fetching master data:', err);
      if (!err.response || err.response.status !== 403) {
        toast.error('Failed to load some reference data');
      }
    }
  };

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchEmployeeData();
      fetchMasterData();
      setActiveTab('basic-info'); // Reset to first tab when opening
    }
  }, [isOpen, employeeId]);

  // Handle section updates
  const handleSectionUpdate = async (section, data) => {
    try {
      const canEdit = canEditSection(section, user?.role, employee?._id, user?._id);
      if (!canEdit) {
        toast.error('You do not have permission to edit this section');
        return;
      }

      let response;
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

      setEmployee(response.data.employee);
      toast.success(`${section.replace('-', ' ')} updated successfully!`);
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || `Failed to update ${section}`);
    }
  };

  // Check if user can edit a specific section
  const canEditSection = (section, userRole, employeeId, currentUserId) => {
    if (userRole === 'HR_Manager') {
      return true;
    }
    
    if (userRole === 'Team_Leader' && employeeId === currentUserId) {
      const restrictedSections = ['attendance', 'employment-details'];
      return !restrictedSections.includes(section);
    }
    
    if (userRole === 'Employee' && employeeId === currentUserId) {
      const restrictedSections = ['attendance', 'employment-details'];
      return !restrictedSections.includes(section);
    }
    
    return false;
  };

  // Navigation tabs
  const tabs = [
    { id: 'attendance', name: 'Attendance', icon: '📊' },
    { id: 'basic-info', name: 'Basic Information', icon: '👤' },
    { id: 'address', name: 'Address', icon: '🏠' },
    { id: 'employment-details', name: 'Employment', icon: '💼' },
    { id: 'bank-details', name: 'Bank Details', icon: '🏦' },
    { id: 'documents', name: 'Documents', icon: '📄' },
    { id: 'emergency-contact', name: 'Emergency Contact', icon: '🚨' },
    { id: 'personal-info', name: 'Personal Info', icon: '🔒' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg" style={{ backgroundColor: themeColors.surface }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: themeColors.border }}>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>
                {loading ? 'Loading...' : `${employee?.name?.first} ${employee?.name?.last}`}
              </h2>
              {employee && (
                <p className="mt-1" style={{ color: themeColors.textSecondary }}>
                  Employee ID: {employee?.employeeId} • {employee?.designation?.title}
                  {employee?.isActive ? (
                    <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: themeColors.success + '20', color: themeColors.success }}>
                      Active
                    </span>
                  ) : (
                    <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: themeColors.danger + '20', color: themeColors.danger }}>
                      Inactive
                    </span>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: themeColors.textSecondary }}
            >
              <X size={24} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
            </div>
          ) : employee ? (
            <>
              {/* Navigation Tabs */}
              <div className="border-b" style={{ borderColor: themeColors.border }}>
                <nav className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap"
                      style={{
                        borderBottomColor: activeTab === tab.id ? themeColors.primary : 'transparent',
                        color: activeTab === tab.id ? themeColors.primary : themeColors.textSecondary,
                        backgroundColor: activeTab === tab.id ? themeColors.primary + '10' : 'transparent'
                      }}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {activeTab === 'attendance' && (
                  <EmployeeAttendanceDetails employee={employee} />
                )}

                {activeTab === 'basic-info' && (
                  <BasicInfoSection
                    employee={employee}
                    onUpdate={(data) => handleSectionUpdate('basic-info', data)}
                    canEdit={canEditSection('basic-info', user?.role, employee?._id, user?._id)}
                  />
                )}

                {activeTab === 'address' && (
                  <AddressSection
                    employee={employee}
                    onUpdate={(data) => handleSectionUpdate('address', data)}
                    canEdit={canEditSection('address', user?.role, employee?._id, user?._id)}
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
                    canEdit={canEditSection('employment-details', user?.role, employee?._id, user?._id)}
                  />
                )}

                {activeTab === 'bank-details' && (
                  <BankDetailsSection
                    employee={employee}
                    onUpdate={(data) => handleSectionUpdate('bank-details', data)}
                    canEdit={canEditSection('bank-details', user?.role, employee?._id, user?._id)}
                  />
                )}

                {activeTab === 'documents' && (
                  <DocumentsSection
                    employee={employee}
                    onUpdate={(data) => handleSectionUpdate('documents', data)}
                    canEdit={canEditSection('documents', user?.role, employee?._id, user?._id)}
                  />
                )}

                {activeTab === 'emergency-contact' && (
                  <EmergencyContactSection
                    employee={employee}
                    onUpdate={(data) => handleSectionUpdate('emergency-contact', data)}
                    canEdit={canEditSection('emergency-contact', user?.role, employee?._id, user?._id)}
                  />
                )}

                {activeTab === 'personal-info' && (
                  <PersonalInfoSection
                    employee={employee}
                    onUpdate={(data) => handleSectionUpdate('personal-info', data)}
                    canEdit={canEditSection('personal-info', user?.role, employee?._id, user?._id)}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p style={{ color: themeColors.danger }}>Employee Not Found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;