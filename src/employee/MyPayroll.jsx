import { useState, useEffect } from 'react';
import { payrollAPI } from '../apis/payrollAPI';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const MyPayroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && (user._id || user.id)) {
      fetchMyPayroll();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyPayroll = async () => {
    if (!user || (!user._id && !user.id)) {
      console.log('No user or user ID available');
      setLoading(false);
      return;
    }

    try {
      const userId = user._id || user.id;
      console.log('Fetching payroll for user:', userId);
      const response = await payrollAPI.getAllPayrolls();
      console.log('Payroll response:', response);
      
      // Filter payrolls for current employee
      const myPayrolls = response.payrolls?.filter(p => {
        console.log('Comparing:', p.employee._id, 'with', userId);
        return p.employee._id === userId;
      }) || [];
      
      console.log('My payrolls after filter:', myPayrolls);
      setPayrolls(myPayrolls);
    } catch (error) {
      console.error('Fetch payroll error:', error);
      toast.error('Failed to fetch payroll data');
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

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Payroll</h1>
        <div className="text-sm text-gray-600">
          Current Salary: {formatCurrency(user?.salary || 0)}
        </div>
      </div>

      {/* Current Salary Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Salary Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(user?.salary || 0)}
            </div>
            <div className="text-sm text-gray-600">Monthly Salary</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency((user?.salary || 0) * 12)}
            </div>
            <div className="text-sm text-gray-600">Annual Salary</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {user?.department?.name || 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Department</div>
          </div>
        </div>
      </div>

      {/* Payroll History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Payroll History</h2>
        </div>
        
        {payrolls.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-gray-400 text-6xl mb-4">💰</div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Payroll Records</h3>
            <p className="text-gray-500">Your payroll records will appear here once generated.</p>
            <button 
              onClick={fetchMyPayroll}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Pay Period</th>
                  <th className="px-4 py-3 text-left">Basic Salary</th>
                  <th className="px-4 py-3 text-left">Allowances</th>
                  <th className="px-4 py-3 text-left">Deductions</th>
                  <th className="px-4 py-3 text-left">Net Pay</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll._id} className="border-b">
                    <td className="px-4 py-3">
                      {payroll.month}/{payroll.year}
                    </td>
                    <td className="px-4 py-3">{formatCurrency(payroll.basicSalary)}</td>
                    <td className="px-4 py-3">{formatCurrency((payroll.allowances.hra || 0) + (payroll.allowances.transport || 0) + (payroll.allowances.medical || 0) + (payroll.allowances.other || 0))}</td>
                    <td className="px-4 py-3">{formatCurrency((payroll.deductions.tax || 0) + (payroll.deductions.pf || 0) + (payroll.deductions.insurance || 0) + (payroll.deductions.other || 0))}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">
                      {formatCurrency(payroll.netSalary)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payroll.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        payroll.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payroll.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedPayroll(payroll)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payroll Detail Modal */}
      {selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Payroll Details - {selectedPayroll.month}/{selectedPayroll.year}
              </h2>
              <button
                onClick={() => setSelectedPayroll(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Employee ID</label>
                  <div className="font-medium">{selectedPayroll.employee.employeeId}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Pay Date</label>
                  <div className="font-medium">
                    {selectedPayroll.payDate ? new Date(selectedPayroll.payDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <h3 className="font-semibold text-green-600 mb-2">Earnings</h3>
                <div className="bg-green-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Basic Salary:</span>
                    <span>{formatCurrency(selectedPayroll.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HRA:</span>
                    <span>{formatCurrency(selectedPayroll.allowances.hra || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport:</span>
                    <span>{formatCurrency(selectedPayroll.allowances.transport || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical:</span>
                    <span>{formatCurrency(selectedPayroll.allowances.medical || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span>{formatCurrency(selectedPayroll.allowances.other || 0)}</span>
                  </div>
                  <div className="border-t pt-2 font-semibold flex justify-between">
                    <span>Total Earnings:</span>
                    <span>{formatCurrency(selectedPayroll.basicSalary + (selectedPayroll.allowances.hra || 0) + (selectedPayroll.allowances.transport || 0) + (selectedPayroll.allowances.medical || 0) + (selectedPayroll.allowances.other || 0))}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h3 className="font-semibold text-red-600 mb-2">Deductions</h3>
                <div className="bg-red-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(selectedPayroll.deductions.tax || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PF:</span>
                    <span>{formatCurrency(selectedPayroll.deductions.pf || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance:</span>
                    <span>{formatCurrency(selectedPayroll.deductions.insurance || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other:</span>
                    <span>{formatCurrency(selectedPayroll.deductions.other || 0)}</span>
                  </div>
                  <div className="border-t pt-2 font-semibold flex justify-between">
                    <span>Total Deductions:</span>
                    <span>{formatCurrency((selectedPayroll.deductions.tax || 0) + (selectedPayroll.deductions.pf || 0) + (selectedPayroll.deductions.insurance || 0) + (selectedPayroll.deductions.other || 0))}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Net Pay:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(selectedPayroll.netSalary)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPayroll;