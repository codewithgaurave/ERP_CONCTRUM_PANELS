// src/components/SimpleEmployeeModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Briefcase, CreditCard, FileText, Phone, Lock, Calendar } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import employeeAPI from '../apis/employeeAPI';

const SimpleEmployeeModal = ({ isOpen, onClose, employeeId }) => {
  const { themeColors } = useTheme();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchEmployee();
      setActiveTab('basic'); // Reset to first tab
    }
  }, [isOpen, employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getById(employeeId);
      setEmployee(response.data.employee);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: User },
    { id: 'address', name: 'Address', icon: MapPin },
    { id: 'employment', name: 'Employment', icon: Briefcase },
    { id: 'bank', name: 'Bank Details', icon: CreditCard },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'emergency', name: 'Emergency', icon: Phone },
    { id: 'personal', name: 'Personal', icon: Lock },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div 
        className="relative rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: themeColors.surface }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b" 
          style={{ borderColor: themeColors.border }}
        >
          <div>
            <h2 className="text-2xl font-bold" style={{ color: themeColors.text }}>
              {loading ? 'Loading...' : `${employee?.name?.first} ${employee?.name?.last}`}
            </h2>
            {employee && (
              <p className="mt-1" style={{ color: themeColors.textSecondary }}>
                {employee.employeeId} • {employee.designation?.title}
                <span 
                  className={`ml-2 px-2 py-1 rounded-full text-xs`}
                  style={{
                    backgroundColor: employee.isActive ? themeColors.success + '20' : themeColors.danger + '20',
                    color: employee.isActive ? themeColors.success : themeColors.danger
                  }}
                >
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ color: themeColors.textSecondary }}
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2" 
              style={{ borderColor: themeColors.primary }}
            ></div>
          </div>
        ) : employee ? (
          <>
            {/* Tabs */}
            <div className="border-b" style={{ borderColor: themeColors.border }}>
              <nav className="flex overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
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
                      <Icon size={16} className="mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto" style={{ color: themeColors.text }}>
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>First Name</label>
                      <p className="mt-1">{employee.name?.first || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Last Name</label>
                      <p className="mt-1">{employee.name?.last || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Email</label>
                      <p className="mt-1">{employee.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Mobile</label>
                      <p className="mt-1">{employee.mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Alternate Mobile</label>
                      <p className="mt-1">{employee.alternateMobile || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>WhatsApp</label>
                      <p className="mt-1">{employee.whatsappNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'address' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Street</label>
                      <p className="mt-1">{employee.address?.street || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>City</label>
                      <p className="mt-1">{employee.address?.city || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>State</label>
                      <p className="mt-1">{employee.address?.state || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Country</label>
                      <p className="mt-1">{employee.address?.country || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Pincode</label>
                      <p className="mt-1">{employee.address?.pincode || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'employment' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Department</label>
                      <p className="mt-1">{employee.department?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Designation</label>
                      <p className="mt-1">{employee.designation?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Employment Status</label>
                      <p className="mt-1">{employee.employmentStatus?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Salary</label>
                      <p className="mt-1">₹{employee.salary?.toLocaleString() || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Date of Joining</label>
                      <p className="mt-1">{employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Office Location</label>
                      <p className="mt-1">{employee.officeLocation?.officeName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bank' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Account Number</label>
                      <p className="mt-1">{employee.bankDetails?.accountNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Bank Name</label>
                      <p className="mt-1">{employee.bankDetails?.bankName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>IFSC Code</label>
                      <p className="mt-1">{employee.bankDetails?.ifscCode || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Branch Name</label>
                      <p className="mt-1">{employee.bankDetails?.branchName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Aadhar Number</label>
                      <p className="mt-1">{employee.aadharNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>PAN Number</label>
                      <p className="mt-1">{employee.panNumber || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'emergency' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Contact Name</label>
                      <p className="mt-1">{employee.emergencyContact?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Relationship</label>
                      <p className="mt-1">{employee.emergencyContact?.relationship || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Phone</label>
                      <p className="mt-1">{employee.emergencyContact?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Address</label>
                      <p className="mt-1">{employee.emergencyContact?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Gender</label>
                      <p className="mt-1">{employee.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Date of Birth</label>
                      <p className="mt-1">{employee.dob ? new Date(employee.dob).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Blood Group</label>
                      <p className="mt-1">{employee.bloodGroup || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Marital Status</label>
                      <p className="mt-1">{employee.maritalStatus || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Personal Email</label>
                      <p className="mt-1">{employee.personalEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p style={{ color: themeColors.danger }}>Employee not found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleEmployeeModal;