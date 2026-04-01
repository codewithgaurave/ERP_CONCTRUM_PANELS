import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import payrollAPI from "../apis/payrollAPI";
import { DollarSign, Download, Eye } from "lucide-react";
import PayrollDetailsModal from "../components/PayrollDetailsModal";

const TeamPayroll = () => {
  const { themeColors } = useTheme();
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: ""
  });

  useEffect(() => {
    fetchPayrolls();
  }, [filters]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      // Get all payrolls - backend will filter based on user role
      const { data } = await payrollAPI.getAll(filters);
      setPayrolls(data.payrolls || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching team payrolls");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleViewPayroll = async (payrollId) => {
    try {
      const { data } = await payrollAPI.getById(payrollId);
      setSelectedPayroll(data.payroll);
      setIsModalOpen(true);
    } catch (err) {
      setError("Error viewing payroll details");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayroll(null);
  };

  const handleDownloadSlip = async (payrollId) => {
    try {
      // This would typically download a PDF
      const response = await payrollAPI.getById(payrollId);
      const payroll = response.data.payroll;
      
      // Simple text download for now
      const content = `PAYROLL SLIP\n\nEmployee: ${payroll.employee?.name?.first} ${payroll.employee?.name?.last}\nEmployee ID: ${payroll.employee?.employeeId}\nBasic Salary: ${formatCurrency(payroll.basicSalary)}\nGross Salary: ${formatCurrency(payroll.grossSalary)}\nNet Salary: ${formatCurrency(payroll.netSalary)}\nStatus: ${payroll.status}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll-${payroll.employee?.employeeId}-${filters.month}-${filters.year}.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Error downloading payroll slip");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Payroll</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            View payroll details for you and your team members only
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div>
          <label className="block text-sm font-medium mb-2">Month</label>
          <select
            value={filters.month}
            onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
            className="w-full p-2 rounded border"
            style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Year</label>
          <select
            value={filters.year}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            className="w-full p-2 rounded border"
            style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full p-2 rounded border"
            style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}
          >
            <option value="">All Status</option>
            <option value="Generated">Generated</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: themeColors.danger + '20', 
          borderColor: themeColors.danger,
          color: themeColors.danger
        }}>
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.primary }}>{payrolls.length}</div>
          <div className="text-sm">Total Payrolls</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.success }}>
            {formatCurrency(payrolls.reduce((sum, p) => sum + (p.grossSalary || 0), 0))}
          </div>
          <div className="text-sm">Total Gross</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.info }}>
            {formatCurrency(payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0))}
          </div>
          <div className="text-sm">Total Net</div>
        </div>
        <div className="p-6 rounded-lg shadow-sm text-center" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
          <div className="text-3xl font-bold mb-2" style={{ color: themeColors.warning }}>
            {payrolls.filter(p => p.status === 'Paid').length}
          </div>
          <div className="text-sm">Paid</div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="rounded-lg shadow-sm overflow-hidden" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: themeColors.background }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Basic Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Gross Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Net Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: themeColors.border }}>
              {payrolls.map((payroll) => (
                <tr key={payroll._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium">
                        {payroll.employee?.name?.first} {payroll.employee?.name?.last}
                      </div>
                      <div className="text-sm" style={{ color: themeColors.textSecondary }}>
                        {payroll.employee?.employeeId}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatCurrency(payroll.basicSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatCurrency(payroll.grossSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {formatCurrency(payroll.netSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payroll.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      payroll.status === 'Generated' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payroll.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewPayroll(payroll._id)}
                        className="p-2 rounded text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: themeColors.info }}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDownloadSlip(payroll._id)}
                        className="p-2 rounded text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: themeColors.success }}
                        title="Download Slip"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {payrolls.length === 0 && (
        <div className="text-center py-12">
          <DollarSign size={48} style={{ color: themeColors.textSecondary }} className="mx-auto mb-4" />
          <p style={{ color: themeColors.textSecondary }}>No payroll records found for your team</p>
          <p className="text-xs mt-2" style={{ color: themeColors.textSecondary }}>Only your payroll and your team members' payroll will be displayed here</p>
        </div>
      )}

      {/* Payroll Details Modal */}
      <PayrollDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        payroll={selectedPayroll}
      />
    </div>
  );
};

export default TeamPayroll;