// src/components/PayrollDetailsModal.jsx
import React from 'react';
import { X, User, DollarSign, Calendar, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PayrollDetailsModal = ({ isOpen, onClose, payroll }) => {
  const { themeColors } = useTheme();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen || !payroll) return null;

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
              Payroll Details
            </h2>
            <p className="mt-1" style={{ color: themeColors.textSecondary }}>
              {payroll.employee?.name?.first} {payroll.employee?.name?.last} • {payroll.employee?.employeeId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:opacity-80 transition-opacity"
            style={{ color: themeColors.textSecondary }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto" style={{ color: themeColors.text }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Employee Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} />
                Employee Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Full Name</label>
                    <p className="mt-1">{payroll.employee?.name?.first} {payroll.employee?.name?.last}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Employee ID</label>
                    <p className="mt-1">{payroll.employee?.employeeId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Department</label>
                    <p className="mt-1">{payroll.employee?.department?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Designation</label>
                    <p className="mt-1">{payroll.employee?.designation?.title || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Email</label>
                    <p className="mt-1">{payroll.employee?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Mobile</label>
                    <p className="mt-1">{payroll.employee?.mobile || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payroll Period */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Payroll Period
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Month</label>
                    <p className="mt-1">{payroll.month}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Year</label>
                    <p className="mt-1">{payroll.year}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Status</label>
                    <p className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        payroll.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        payroll.status === 'Generated' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payroll.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Generated On</label>
                    <p className="mt-1">{formatDate(payroll.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Salary Breakdown
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Earnings */}
              <div 
                className="p-4 rounded-lg border"
                style={{ backgroundColor: themeColors.success + '10', borderColor: themeColors.success + '30' }}
              >
                <h4 className="font-semibold mb-3 text-green-800">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <span className="font-medium">{formatCurrency(payroll.basicSalary)}</span>
                  </div>
                  {payroll.allowances && payroll.allowances.length > 0 && (
                    <>
                      {payroll.allowances.map((allowance, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{allowance.name}:</span>
                          <span className="font-medium">{formatCurrency(allowance.amount)}</span>
                        </div>
                      ))}
                    </>
                  )}
                  <div className="border-t pt-2 mt-2" style={{ borderColor: themeColors.border }}>
                    <div className="flex justify-between font-semibold">
                      <span>Gross Salary:</span>
                      <span>{formatCurrency(payroll.grossSalary)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div 
                className="p-4 rounded-lg border"
                style={{ backgroundColor: themeColors.danger + '10', borderColor: themeColors.danger + '30' }}
              >
                <h4 className="font-semibold mb-3 text-red-800">Deductions</h4>
                <div className="space-y-2">
                  {payroll.deductions && payroll.deductions.length > 0 ? (
                    <>
                      {payroll.deductions.map((deduction, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{deduction.name}:</span>
                          <span className="font-medium">-{formatCurrency(deduction.amount)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2" style={{ borderColor: themeColors.border }}>
                        <div className="flex justify-between font-semibold">
                          <span>Total Deductions:</span>
                          <span>-{formatCurrency(payroll.deductions.reduce((sum, d) => sum + d.amount, 0))}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4" style={{ color: themeColors.textSecondary }}>
                      No deductions
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Net Salary */}
            <div 
              className="mt-6 p-6 rounded-lg border-2"
              style={{ backgroundColor: themeColors.primary + '10', borderColor: themeColors.primary }}
            >
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Net Salary:</span>
                <span className="text-2xl font-bold" style={{ color: themeColors.primary }}>
                  {formatCurrency(payroll.netSalary)}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(payroll.notes || payroll.paymentDate) && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {payroll.paymentDate && (
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Payment Date</label>
                    <p className="mt-1">{formatDate(payroll.paymentDate)}</p>
                  </div>
                )}
                {payroll.notes && (
                  <div>
                    <label className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>Notes</label>
                    <p className="mt-1">{payroll.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailsModal;