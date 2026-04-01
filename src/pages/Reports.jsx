import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import reportsAPI from "../apis/reportsAPI";
import apiRoutes from "../contants/api";
import { BarChart3, Users, IndianRupee, Package, TrendingUp, Download, Calendar } from "lucide-react";

// Export utility functions
const exportToCSV = (data, filename) => {
  const csvContent = "data:text/csv;charset=utf-8," + data;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const convertToCSV = (objArray, headers) => {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = headers.map(h => `"${h}"`).join(',') + '\r\n';
  
  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (let index in headers) {
      if (line !== '') line += ',';
      const value = array[i][headers[index]] ?? '';
      const strVal = String(value).replace(/"/g, '""');
      line += `"${strVal}"`;
    }
    str += line + '\r\n';
  }
  return str;
};

const Reports = () => {
  const { themeColors } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');
  const [loading, setLoading] = useState(true);
  const [employeeReports, setEmployeeReports] = useState(null);
  const [payrollReports, setPayrollReports] = useState(null);
  const [assetReports, setAssetReports] = useState(null);
  const [attendanceReports, setAttendanceReports] = useState(null);
  const [leaveReports, setLeaveReports] = useState(null);
  const [departmentReports, setDepartmentReports] = useState(null);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState('');
  const [assetYear, setAssetYear] = useState(new Date().getFullYear());
  const [assetMonth, setAssetMonth] = useState('');
  const [attendanceYear, setAttendanceYear] = useState(new Date().getFullYear());
  const [attendanceMonth, setAttendanceMonth] = useState(String(new Date().getMonth() + 1));
  const [leaveYear, setLeaveYear] = useState(new Date().getFullYear());
  const [leaveMonth, setLeaveMonth] = useState('');
  const [deptYear, setDeptYear] = useState(new Date().getFullYear());
  const [deptMonth, setDeptMonth] = useState('');
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const handleExport = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    switch (activeTab) {
      case 'employees':
        if (employeeReports) {
          const { summary, departmentStats, roleStats, employeeDetails } = employeeReports;
          const currentDate2 = currentDate;

          // Section 1: Summary
          let csv = '"EMPLOYEE REPORT SUMMARY"\r\n';
          csv += '"Category","Count"\r\n';
          csv += `"Total Employees","${summary.totalEmployees}"\r\n`;
          csv += `"Active Employees","${summary.activeEmployees}"\r\n`;
          csv += `"Inactive Employees","${summary.inactiveEmployees}"\r\n`;

          // Section 2: Department Distribution
          csv += '\r\n"DEPARTMENT DISTRIBUTION"\r\n';
          csv += '"Department","Count"\r\n';
          departmentStats.forEach(dept => {
            csv += `"${dept._id}","${dept.count}"\r\n`;
          });

          // Section 3: Role Distribution
          csv += '\r\n"ROLE DISTRIBUTION"\r\n';
          csv += '"Role","Count"\r\n';
          roleStats.forEach(role => {
            csv += `"${role._id}","${role.count}"\r\n`;
          });

          // Section 4: Employee Details
          if (employeeDetails && employeeDetails.length > 0) {
            csv += '\r\n"EMPLOYEE DETAILS"\r\n';
            csv += '"Employee ID","First Name","Last Name","Email","Mobile","Role","Department","Designation","Employment Status","Office Location","Work Shift","Manager","Manager ID","Salary","Date of Joining","Gender","Status"\r\n';
            employeeDetails.forEach(emp => {
              const managerName = emp.manager ? `${emp.manager.name?.first || ''} ${emp.manager.name?.last || ''}`.trim() : '';
              const doj = emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '';
              const row = [
                emp.employeeId || '',
                emp.name?.first || '',
                emp.name?.last || '',
                emp.email || '',
                emp.mobile || '',
                emp.role || '',
                emp.department?.name || '',
                emp.designation?.title || '',
                emp.employmentStatus?.title || '',
                emp.officeLocation?.officeName || '',
                emp.workShift?.name || '',
                managerName,
                emp.manager?.employeeId || '',
                emp.salary || '',
                doj,
                emp.gender || '',
                emp.isActive ? 'Active' : 'Inactive',
              ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
              csv += row + '\r\n';
            });
          }

          exportToCSV(csv, `employee-report-${currentDate2}`);
        }
        break;
        
      case 'payroll':
        if (payrollReports) {
          const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
          const filterLabel = selectedMonth ? MONTHS[parseInt(selectedMonth)-1] : 'All Months';
          let csv = `"PAYROLL REPORT","Period: ${filterLabel} ${selectedYear}",,,,,,,,,,,,,,,,,,,,,,,,,,\r\n`;
          csv += `"Generated On","${new Date().toLocaleDateString('en-IN')}",,,,,,,,,,,,,,,,,,,,,,,,,,\r\n`;

          // Section 1: Monthly Summary
          csv += `\r\n"=== MONTHLY SUMMARY ===",,,,,,,,,,,,,,,,,,,,,,,,,,\r\n`;
          csv += '"Month","Total Payrolls","Total Gross Salary (₹)","Total Net Salary (₹)","Average Net Salary (₹)",,,,,,,,,,,,,,,,,,,,,,\r\n';
          (payrollReports.monthlyStats || []).forEach(m => {
            csv += `"${MONTHS[m._id-1]}","${m.totalPayrolls}","${m.totalGrossSalary}","${m.totalNetSalary}","${Math.round(m.avgSalary)}",,,,,,,,,,,,,,,,,,,,,,\r\n`;
          });
          if (!(payrollReports.monthlyStats || []).length) csv += '"No data for selected period",,,,,,,,,,,,,,,,,,,,,,,,,,\r\n';

          // Section 2: Department Wise
          csv += `\r\n"=== DEPARTMENT WISE SUMMARY ===",,,,,,,,,,,,,,,,,,,,,,,,,,\r\n`;
          csv += '"Department","Unique Employees","Total Payroll Records","Total Gross (₹)","Total Net (₹)","Avg Net Salary (₹)",,,,,,,,,,,,,,,,,,,,\r\n';
          (payrollReports.departmentPayroll || []).forEach(d => {
            csv += `"${d._id}","${d.employeeCount}","${d.totalPayrolls}","${d.totalGross}","${d.totalAmount}","${Math.round(d.avgSalary)}",,,,,,,,,,,,,,,,,,,,\r\n`;
          });
          if (!(payrollReports.departmentPayroll || []).length) csv += '"No department data",,,,,,,,,,,,,,,,,,,,,,,,,,\r\n';

          // Section 3: Employee Wise Detail
          csv += `\r\n"=== EMPLOYEE WISE PAYROLL DETAIL ===",,,,,,,,,,,,,,,,,,,,,,,,,,\r\n`;
          csv += '"Emp ID","First Name","Last Name","Email","Mobile","Role","Department","Designation","Month","Year","Basic Salary","HRA","Transport","Medical","Other Allowance","Gross Salary","Tax","PF","Insurance","Other Deduction","Net Salary","Working Days","Present Days","Leave Days","OT Hours","OT Amount","Status","Payment Method","Payment Date","Remarks"\r\n';
          (payrollReports.employeePayroll || []).forEach(p => {
            const row = [
              p.employeeId||'', p.firstName||'', p.lastName||'', p.email||'', p.mobile||'',
              p.role||'', p.department||'', p.designation||'',
              MONTHS[p.month-1], p.year,
              p.basicSalary||0,
              p.allowances?.hra||0, p.allowances?.transport||0, p.allowances?.medical||0, p.allowances?.other||0,
              p.grossSalary||0,
              p.deductions?.tax||0, p.deductions?.pf||0, p.deductions?.insurance||0, p.deductions?.other||0,
              p.netSalary||0,
              p.workingDays||0, p.presentDays||0, p.leaveDays||0,
              p.overtimeHours||0, p.overtimeAmount||0,
              p.status||'', p.paymentMethod||'',
              p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '',
              p.remarks||''
            ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',');
            csv += row + '\r\n';
          });
          if (!(payrollReports.employeePayroll || []).length) csv += '"No employee payroll data for selected period",,,,,,,,,,,,,,,,,,,,,,,,,,,,\r\n';

          exportToCSV(csv, `payroll-report-${selectedYear}${selectedMonth ? '-'+String(selectedMonth).padStart(2,'0') : ''}-${currentDate}`);
        }
        break;
        
      case 'assets':
        if (assetReports) {
          const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
          const assetFilterLabel = assetMonth ? `${MONTHS[parseInt(assetMonth)-1]} ${assetYear}` : `Year ${assetYear}`;
          const today = new Date().toLocaleDateString('en-IN');
          let csv = `"ASSET REPORT","Period: ${assetFilterLabel}",,,,,,,,,,,,,\r\n`;
          csv += `"Generated On","${today}",,,,,,,,,,,,,\r\n`;

          csv += `\r\n"=== ASSET SUMMARY ===",,,,,,,,,,,,,\r\n`;
          csv += `"Total Assets","${assetReports.totalAssets}",,,,,,,,,,,,,\r\n`;
          csv += `\r\n"STATUS WISE",,,,,,,,,,,,,\r\n`;
          csv += '"Status","Count",,,,,,,,,,,,,\r\n';
          (assetReports.statusStats || []).forEach(s => { csv += `"${s._id}","${s.count}",,,,,,,,,,,,,\r\n`; });
          csv += `\r\n"CATEGORY WISE",,,,,,,,,,,,,\r\n`;
          csv += '"Category","Total","Assigned","Available",,,,,,,,,\r\n';
          (assetReports.categoryStats || []).forEach(c => { csv += `"${c._id}","${c.count}","${c.assigned}","${c.count - c.assigned}",,,,,,,,,\r\n`; });

          csv += `\r\n"=== EMPLOYEE WISE CURRENT ASSETS ===",,,,,,,,,,,,,\r\n`;
          csv += '"Emp ID","Employee Name","Email","Asset ID","Asset Name","Category","Assigned Date",,,,,,,\r\n';
          (assetReports.employeeAssets || []).forEach(ea => {
            ea.assets.forEach(a => {
              const row = [
                ea.employee?.employeeId || '',
                `${ea.employee?.name?.first || ''} ${ea.employee?.name?.last || ''}`.trim(),
                ea.employee?.email || '',
                a.assetId, a.name, a.category,
                a.assignedDate ? new Date(a.assignedDate).toLocaleDateString('en-IN') : ''
              ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',');
              csv += row + ',,,,,,,\r\n';
            });
          });
          if (!(assetReports.employeeAssets || []).length) csv += '"No assets currently assigned",,,,,,,,,,,,,\r\n';

          csv += `\r\n"=== COMPLETE TRANSFER / ASSIGNMENT HISTORY ===",,,,,,,,,,,,,\r\n`;
          csv += '"Asset ID","Asset Name","Category","Brand","Model","Serial No","Assigned To (ID)","Assigned To (Name)","Assigned By (ID)","Assigned By (Name)","Transfer Type","Assigned Date","Return Date","Status","Days Used"\r\n';
          (assetReports.transferHistory || []).forEach(h => {
            const row = [
              h.assetId, h.assetName, h.category, h.brand, h.model, h.serialNumber,
              h.assignedTo?.employeeId || '',
              `${h.assignedTo?.name?.first || ''} ${h.assignedTo?.name?.last || ''}`.trim(),
              h.assignedBy?.employeeId || '',
              `${h.assignedBy?.name?.first || ''} ${h.assignedBy?.name?.last || ''}`.trim(),
              h.transferType,
              h.assignedDate ? new Date(h.assignedDate).toLocaleDateString('en-IN') : '',
              h.returnDate ? new Date(h.returnDate).toLocaleDateString('en-IN') : 'Still Assigned',
              h.isActive ? 'Active' : 'Returned',
              h.daysUsed
            ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',');
            csv += row + '\r\n';
          });
          if (!(assetReports.transferHistory || []).length) csv += '"No transfer history for selected period",,,,,,,,,,,,,\r\n';

          exportToCSV(csv, `asset-report-${assetYear}${assetMonth ? '-'+String(assetMonth).padStart(2,'0') : ''}-${currentDate}`);
        }
        break;
        
      case 'attendance':
        if (attendanceReports) {
          const aLabel = attendanceMonth ? `${MONTHS[parseInt(attendanceMonth)-1]} ${attendanceYear}` : `Year ${attendanceYear}`;
          let csv = `"ATTENDANCE REPORT","Period: ${aLabel}",,,,,,,,\r\n`;
          csv += `"Generated On","${new Date().toLocaleDateString('en-IN')}",,,,,,,,\r\n`;
          csv += `"Team Size","${attendanceReports.teamSize || 0}",,,,,,,,\r\n`;
          csv += `"Average Attendance","${attendanceReports.averageAttendance}%",,,,,,,,\r\n`;

          csv += `\r\n"=== MONTHLY SUMMARY ===",,,,,,,,\r\n`;
          csv += '"Month","Year","Present","Late","Half Day","On Leave","Absent","Work Hours","OT Hours"\r\n';
          (attendanceReports.monthlyStats || []).forEach(m => {
            csv += `"${MONTHS[m._id.month-1]}","${m._id.year}","${m.present}","${m.late}","${m.halfDay}","${m.onLeave}","${m.absent}","${m.totalWorkHours?.toFixed(1)}","${m.overtimeHours?.toFixed(1)}"\r\n`;
          });

          csv += `\r\n"=== EMPLOYEE WISE ATTENDANCE ===",,,,,,,,\r\n`;
          csv += '"Emp ID","First Name","Last Name","Email","Department","Role","Present","Late","Half Day","On Leave","Absent","Total Days","Work Hours","OT Hours"\r\n';
          (attendanceReports.employeeStats || []).forEach(e => {
            const row = [e.employeeId,e.firstName,e.lastName,e.email,e.department||'',e.role,e.present,e.late,e.halfDay,e.onLeave,e.absent,e.totalDays,e.totalWorkHours?.toFixed(1),e.overtimeHours?.toFixed(1)]
              .map(v => `"${String(v??'').replace(/"/g,'""')}"`).join(',');
            csv += row + '\r\n';
          });
          exportToCSV(csv, `attendance-report-${attendanceYear}${attendanceMonth?'-'+String(attendanceMonth).padStart(2,'0'):''}-${currentDate}`);
        }
        break;

      case 'leaves':
        if (leaveReports) {
          const lLabel = leaveMonth ? `${MONTHS[parseInt(leaveMonth)-1]} ${leaveYear}` : `Year ${leaveYear}`;
          let csv = `"LEAVE REPORT","Period: ${lLabel}",,,,,,,,\r\n`;
          csv += `"Generated On","${new Date().toLocaleDateString('en-IN')}",,,,,,,,\r\n`;
          csv += `"Total Leaves","${leaveReports.totalLeaves}",,,,,,,,\r\n`;

          csv += `\r\n"=== STATUS SUMMARY ===",,,,,,,,\r\n`;
          csv += '"Status","Count",,,,,,,,\r\n';
          (leaveReports.statusStats||[]).forEach(s => { csv += `"${s._id}","${s.count}",,,,,,,,\r\n`; });

          csv += `\r\n"=== LEAVE TYPE SUMMARY ===",,,,,,,,\r\n`;
          csv += '"Leave Type","Count",,,,,,,,\r\n';
          (leaveReports.typeStats||[]).forEach(t => { csv += `"${t._id}","${t.count}",,,,,,,,\r\n`; });

          csv += `\r\n"=== MONTHLY SUMMARY ===",,,,,,,,\r\n`;
          csv += '"Month","Year","Total","Approved","Pending","Rejected",,,,\r\n';
          (leaveReports.monthlyStats||[]).forEach(m => {
            csv += `"${MONTHS[m._id.month-1]}","${m._id.year}","${m.total}","${m.approved}","${m.pending}","${m.rejected}",,,,\r\n`;
          });

          csv += `\r\n"=== EMPLOYEE WISE LEAVE DETAIL ===",,,,,,,,\r\n`;
          csv += '"Emp ID","First Name","Last Name","Email","Department","Role","Leave Type","Start Date","End Date","Days","Reason","Status","Approved By"\r\n';
          (leaveReports.employeeLeaves||[]).forEach(l => {
            const row = [
              l.employeeId,l.firstName,l.lastName,l.email,l.department,l.role,
              l.leaveType,
              l.startDate?new Date(l.startDate).toLocaleDateString('en-IN'):'',
              l.endDate?new Date(l.endDate).toLocaleDateString('en-IN'):'',
              Math.round(l.leaveDays||1),
              l.reason||'',l.status,l.approvedBy||''
            ].map(v => `"${String(v??'').replace(/"/g,'""')}"`).join(',');
            csv += row + '\r\n';
          });
          exportToCSV(csv, `leave-report-${leaveYear}${leaveMonth?'-'+String(leaveMonth).padStart(2,'0'):''}-${currentDate}`);
        }
        break;

      case 'departments':
        if (departmentReports) {
          const dLabel = deptMonth ? `${MONTHS[parseInt(deptMonth)-1]} ${deptYear}` : `Year ${deptYear}`;
          let csv = `"DEPARTMENT REPORT","Period: ${dLabel}",,,,,,\r\n`;
          csv += `"Generated On","${new Date().toLocaleDateString('en-IN')}",,,,,,\r\n`;

          csv += `\r\n"=== DEPARTMENT OVERVIEW ===",,,,,,\r\n`;
          csv += '"Department","Total Employees","Active","Inactive","Avg Salary (₹)",,\r\n';
          (departmentReports.departmentStats||[]).forEach(d => {
            csv += `"${d._id}","${d.employees}","${d.active}","${d.employees-d.active}","${Math.round(d.avgSalary||0)}",,\r\n`;
          });

          csv += `\r\n"=== DEPARTMENT PAYROLL ===",,,,,,\r\n`;
          csv += '"Department","Unique Employees","Total Gross (₹)","Total Net (₹)",,,,\r\n';
          (departmentReports.payrollByDept||[]).forEach(d => {
            csv += `"${d._id}","${d.employeeCount}","${d.totalGross}","${d.totalBudget}",,,,\r\n`;
          });

          csv += `\r\n"=== EMPLOYEE WISE DETAIL ===",,,,,,\r\n`;
          csv += '"Emp ID","First Name","Last Name","Email","Department","Designation","Role","Salary","Status","Date of Joining"\r\n';
          (departmentReports.employeeDetails||[]).forEach(e => {
            const row = [
              e.employeeId,e.name?.first,e.name?.last,e.email,
              e.department?.name||'N/A',e.designation?.title||'N/A',e.role,
              e.salary,e.isActive?'Active':'Inactive',
              e.dateOfJoining?new Date(e.dateOfJoining).toLocaleDateString('en-IN'):''
            ].map(v => `"${String(v??'').replace(/"/g,'""')}"`).join(',');
            csv += row + '\r\n';
          });
          exportToCSV(csv, `department-report-${deptYear}${deptMonth?'-'+String(deptMonth).padStart(2,'0'):''}-${currentDate}`);
        }
        break;
        
      default:
        alert('No data available to export');
    }
  };

  useEffect(() => { fetchReports(); }, [activeTab, selectedYear, selectedMonth, assetYear, assetMonth, attendanceYear, attendanceMonth, leaveYear, leaveMonth, deptYear, deptMonth]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Use HR team endpoints for HR managers
      const isHRManager = user?.role === 'HR_Manager';
      
      if (activeTab === 'employees') {
        const { data } = isHRManager 
          ? await reportsAPI.getHRTeamEmployeeReports()
          : await reportsAPI.getEmployeeReports();
        setEmployeeReports(data.data);
      } else if (activeTab === 'payroll') {
        const params = { year: selectedYear };
        if (selectedMonth) params.month = selectedMonth;
        const { data } = isHRManager
          ? await reportsAPI.getHRTeamPayrollReports(params)
          : await reportsAPI.getPayrollReports(params);
        setPayrollReports(data.data);
      } else if (activeTab === 'assets') {
        const params = {};
        if (assetYear) params.year = assetYear;
        if (assetMonth) params.month = assetMonth;
        const { data } = await reportsAPI.getAssetReports(params);
        setAssetReports(data.data);
      } else if (activeTab === 'attendance') {
        const params = { year: attendanceYear };
        if (attendanceMonth) params.month = attendanceMonth;
        const response = isHRManager
          ? await reportsAPI.getHRTeamAttendanceReports(params)
          : await reportsAPI.getAttendanceReports(params);
        setAttendanceReports(response.data.data);
      } else if (activeTab === 'leaves') {
        const params = { year: leaveYear };
        if (leaveMonth) params.month = leaveMonth;
        const { data } = isHRManager
          ? await reportsAPI.getHRTeamLeaveReports(params)
          : await reportsAPI.getLeaveReports(params);
        setLeaveReports(data.data);
      } else if (activeTab === 'departments') {
        const params = { year: deptYear };
        if (deptMonth) params.month = deptMonth;
        const { data } = await reportsAPI.getDepartmentReports(params);
        setDepartmentReports(data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'employees', name: 'Employee Reports', icon: Users },
    { id: 'payroll', name: 'Payroll Reports', icon: IndianRupee },
    { id: 'assets', name: 'Asset Reports', icon: Package },
    { id: 'attendance', name: 'Attendance Reports', icon: Calendar },
    { id: 'leaves', name: 'Leave Reports', icon: TrendingUp },
    { id: 'departments', name: 'Department Reports', icon: BarChart3 },

  ];

  const StatCard = ({ title, value, icon: Icon, color = themeColors.primary }) => (
    <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: themeColors.textSecondary }}>{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: color + '20' }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: themeColors.primary }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4" style={{ color: themeColors.text }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Comprehensive insights and analytics dashboard
          </p>
        </div>
        <div className="flex items-center gap-4">
          {activeTab === 'payroll' && (
            <div className="flex items-center gap-2">
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="px-3 py-2 rounded border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                {Array.from({ length: 5 }, (_, i) => (<option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>))}
              </select>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-2 rounded border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                <option value="">All Months</option>
                {MONTHS.map((m, i) => (<option key={i+1} value={i+1}>{m}</option>))}
              </select>
            </div>
          )}
          {activeTab === 'assets' && (
            <div className="flex items-center gap-2">
              <select value={assetYear} onChange={(e) => setAssetYear(parseInt(e.target.value))} className="px-3 py-2 rounded border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                {Array.from({ length: 5 }, (_, i) => (<option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>))}
              </select>
              <select value={assetMonth} onChange={(e) => setAssetMonth(e.target.value)} className="px-3 py-2 rounded border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                <option value="">All Months</option>
                {MONTHS.map((m, i) => (<option key={i+1} value={i+1}>{m}</option>))}
              </select>
            </div>
          )}
          {activeTab === 'attendance' && (
            <div className="flex items-center gap-2">
              <select value={attendanceYear} onChange={(e) => setAttendanceYear(parseInt(e.target.value))} className="px-3 py-2 rounded border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                {Array.from({ length: 5 }, (_, i) => (<option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>))}
              </select>
              <select value={attendanceMonth} onChange={(e) => setAttendanceMonth(e.target.value)} className="px-3 py-2 rounded border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                <option value="">All Months</option>
                {MONTHS.map((m, i) => (<option key={i+1} value={i+1}>{m}</option>))}
              </select>
            </div>
          )}
          {activeTab === 'leaves' && (
            <div className="flex items-center gap-2">
              <select value={leaveYear} onChange={(e) => setLeaveYear(parseInt(e.target.value))} className="px-3 py-2 rounded border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                {Array.from({ length: 5 }, (_, i) => (<option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>))}
              </select>
              <select value={leaveMonth} onChange={(e) => setLeaveMonth(e.target.value)} className="px-3 py-2 rounded border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                <option value="">All Months</option>
                {MONTHS.map((m, i) => (<option key={i+1} value={i+1}>{m}</option>))}
              </select>
            </div>
          )}
          {activeTab === 'departments' && (
            <div className="flex items-center gap-2">
              <select value={deptYear} onChange={(e) => setDeptYear(parseInt(e.target.value))} className="px-3 py-2 rounded border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                {Array.from({ length: 5 }, (_, i) => (<option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>))}
              </select>
              <select value={deptMonth} onChange={(e) => setDeptMonth(e.target.value)} className="px-3 py-2 rounded border text-sm" style={{ backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }}>
                <option value="">All Months</option>
                {MONTHS.map((m, i) => (<option key={i+1} value={i+1}>{m}</option>))}
              </select>
            </div>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b" style={{ borderColor: themeColors.border }}>
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  borderBottomColor: activeTab === tab.id ? themeColors.primary : 'transparent',
                  color: activeTab === tab.id ? themeColors.primary : themeColors.textSecondary
                }}
              >
                <Icon size={16} className="mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Employee Reports */}
      {activeTab === 'employees' && employeeReports && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Employees"
              value={employeeReports.summary.totalEmployees}
              icon={Users}
              color={themeColors.primary}
            />
            <StatCard
              title="Active Employees"
              value={employeeReports.summary.activeEmployees}
              icon={TrendingUp}
              color={themeColors.success}
            />
            <StatCard
              title="Inactive Employees"
              value={employeeReports.summary.inactiveEmployees}
              icon={Users}
              color={themeColors.danger}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Stats */}
            <ChartCard title="Department Distribution">
              <div className="space-y-3">
                {employeeReports.departmentStats.map((dept, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{dept._id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{dept.count}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: themeColors.primary,
                            width: `${(dept.count / employeeReports.summary.totalEmployees) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>

            {/* Role Stats */}
            <ChartCard title="Role Distribution">
              <div className="space-y-3">
                {employeeReports.roleStats.map((role, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm">{role._id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{role.count}</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: themeColors.success,
                            width: `${(role.count / employeeReports.summary.totalEmployees) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Payroll Reports */}
      {activeTab === 'payroll' && payrollReports && (
        <div className="space-y-6">
          {/* Monthly Stats */}
          <ChartCard title={`Monthly Payroll Summary - ${selectedYear}${selectedMonth ? ' / ' + ['January','February','March','April','May','June','July','August','September','October','November','December'][selectedMonth-1] : ''}`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Month','Payrolls','Total Gross','Total Net','Avg Salary'].map(h => (
                      <th key={h} className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(payrollReports.monthlyStats || []).map((month) => (
                    <tr key={month._id} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 text-sm">{['January','February','March','April','May','June','July','August','September','October','November','December'][month._id-1]}</td>
                      <td className="p-3 text-sm">{month.totalPayrolls}</td>
                      <td className="p-3 text-sm">₹{month.totalGrossSalary?.toLocaleString()}</td>
                      <td className="p-3 text-sm font-medium">₹{month.totalNetSalary?.toLocaleString()}</td>
                      <td className="p-3 text-sm">₹{Math.round(month.avgSalary)?.toLocaleString()}</td>
                    </tr>
                  ))}
                  {(payrollReports.monthlyStats || []).length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-sm" style={{ color: themeColors.textSecondary }}>No payroll data for selected period</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Department Wise */}
          <ChartCard title="Department Wise Payroll">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Department','Unique Employees','Payroll Records','Total Gross','Total Net','Avg Net Salary'].map(h => (
                      <th key={h} className="p-3 text-left border-b text-sm font-medium" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(payrollReports.departmentPayroll || []).map((dept, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 text-sm font-medium">{dept._id}</td>
                      <td className="p-3 text-sm">{dept.employeeCount}</td>
                      <td className="p-3 text-sm">{dept.totalPayrolls}</td>
                      <td className="p-3 text-sm">₹{(dept.totalGross||0).toLocaleString()}</td>
                      <td className="p-3 text-sm font-medium">₹{(dept.totalAmount||0).toLocaleString()}</td>
                      <td className="p-3 text-sm">₹{Math.round(dept.avgSalary||0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {(payrollReports.departmentPayroll || []).length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-sm" style={{ color: themeColors.textSecondary }}>No department data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Employee Wise Detail */}
          <ChartCard title="Employee Wise Payroll Detail">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Emp ID','Name','Department','Designation','Month','Basic','Gross','Net Salary','Present Days','Status'].map(h => (
                      <th key={h} className="p-3 text-left border-b font-medium whitespace-nowrap" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(payrollReports.employeePayroll || []).map((p, i) => (
                    <tr key={i} className="border-b hover:opacity-80" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 whitespace-nowrap">{p.employeeId}</td>
                      <td className="p-3 whitespace-nowrap">{p.firstName} {p.lastName}</td>
                      <td className="p-3 whitespace-nowrap">{p.department || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{p.designation || '-'}</td>
                      <td className="p-3 whitespace-nowrap">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][p.month-1]} {p.year}</td>
                      <td className="p-3 whitespace-nowrap">₹{p.basicSalary?.toLocaleString()}</td>
                      <td className="p-3 whitespace-nowrap">₹{p.grossSalary?.toLocaleString()}</td>
                      <td className="p-3 whitespace-nowrap font-medium">₹{p.netSalary?.toLocaleString()}</td>
                      <td className="p-3 whitespace-nowrap">{p.presentDays}/{p.workingDays}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: p.status === 'Paid' ? themeColors.success+'20' : p.status === 'Processed' ? themeColors.primary+'20' : themeColors.warning+'20',
                          color: p.status === 'Paid' ? themeColors.success : p.status === 'Processed' ? themeColors.primary : themeColors.warning
                        }}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                  {(payrollReports.employeePayroll || []).length === 0 && (
                    <tr><td colSpan={10} className="p-4 text-center" style={{ color: themeColors.textSecondary }}>No employee payroll data for selected period</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Status Stats */}
          <ChartCard title="Payroll Status Summary">
            <div className="space-y-3">
              {(payrollReports.statusStats || []).map((status, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: themeColors.background }}>
                  <span className="text-sm font-medium">{status._id}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{status.count} records</span>
                    <span className="text-sm font-medium">₹{status.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      )}

      {/* Asset Reports */}
      {activeTab === 'assets' && assetReports && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Assets" value={assetReports.totalAssets} icon={Package} color={themeColors.primary} />
            {(assetReports.statusStats || []).map((s, i) => (
              <StatCard key={i} title={s._id} value={s.count} icon={Package}
                color={s._id === 'Available' ? themeColors.success : s._id === 'Assigned' ? themeColors.primary : s._id === 'Under Maintenance' ? themeColors.warning : themeColors.danger} />
            ))}
          </div>

          {/* Category Stats */}
          <ChartCard title="Category Wise">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Category', 'Total', 'Assigned', 'Available'].map(h => (
                      <th key={h} className="p-3 text-left border-b font-medium" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(assetReports.categoryStats || []).map((c, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 font-medium">{c._id}</td>
                      <td className="p-3">{c.count}</td>
                      <td className="p-3">{c.assigned}</td>
                      <td className="p-3">{c.count - c.assigned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Employee Wise Current Assets */}
          <ChartCard title="Employee Wise Current Assets">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Emp ID', 'Employee Name', 'Asset ID', 'Asset Name', 'Category', 'Assigned Date'].map(h => (
                      <th key={h} className="p-3 text-left border-b font-medium whitespace-nowrap" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(assetReports.employeeAssets || []).length === 0 && (
                    <tr><td colSpan={6} className="p-4 text-center" style={{ color: themeColors.textSecondary }}>No assets currently assigned</td></tr>
                  )}
                  {(assetReports.employeeAssets || []).map((ea, i) =>
                    ea.assets.map((a, j) => (
                      <tr key={`${i}-${j}`} className="border-b" style={{ borderColor: themeColors.border }}>
                        <td className="p-3 whitespace-nowrap">{ea.employee?.employeeId}</td>
                        <td className="p-3 whitespace-nowrap">{ea.employee?.name?.first} {ea.employee?.name?.last}</td>
                        <td className="p-3 whitespace-nowrap">{a.assetId}</td>
                        <td className="p-3 whitespace-nowrap">{a.name}</td>
                        <td className="p-3 whitespace-nowrap">{a.category}</td>
                        <td className="p-3 whitespace-nowrap">{a.assignedDate ? new Date(a.assignedDate).toLocaleDateString('en-IN') : '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ChartCard>

          {/* Complete Transfer History */}
          <ChartCard title={`Transfer / Assignment History — ${assetMonth ? ['January','February','March','April','May','June','July','August','September','October','November','December'][assetMonth-1]+' ' : ''}${assetYear}`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Asset ID', 'Asset Name', 'Category', 'Assigned To', 'Assigned By', 'Type', 'Assigned Date', 'Return Date', 'Days Used', 'Status'].map(h => (
                      <th key={h} className="p-3 text-left border-b font-medium whitespace-nowrap" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(assetReports.transferHistory || []).length === 0 && (
                    <tr><td colSpan={10} className="p-4 text-center" style={{ color: themeColors.textSecondary }}>No transfer history found</td></tr>
                  )}
                  {(assetReports.transferHistory || []).map((h, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 whitespace-nowrap font-medium">{h.assetId}</td>
                      <td className="p-3 whitespace-nowrap">{h.assetName}</td>
                      <td className="p-3 whitespace-nowrap">{h.category}</td>
                      <td className="p-3 whitespace-nowrap">
                        <div>{h.assignedTo?.name?.first} {h.assignedTo?.name?.last}</div>
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>{h.assignedTo?.employeeId}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div>{h.assignedBy?.name?.first} {h.assignedBy?.name?.last}</div>
                        <div className="text-xs" style={{ color: themeColors.textSecondary }}>{h.assignedBy?.employeeId}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: h.transferType === 'transfer' ? themeColors.warning+'20' : h.transferType === 'share' ? themeColors.primary+'20' : themeColors.success+'20',
                          color: h.transferType === 'transfer' ? themeColors.warning : h.transferType === 'share' ? themeColors.primary : themeColors.success
                        }}>{h.transferType}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">{h.assignedDate ? new Date(h.assignedDate).toLocaleDateString('en-IN') : '-'}</td>
                      <td className="p-3 whitespace-nowrap">{h.returnDate ? new Date(h.returnDate).toLocaleDateString('en-IN') : <span style={{ color: themeColors.success }}>Still Assigned</span>}</td>
                      <td className="p-3 whitespace-nowrap">{h.daysUsed} days</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: h.isActive ? themeColors.success+'20' : themeColors.textSecondary+'20',
                          color: h.isActive ? themeColors.success : themeColors.textSecondary
                        }}>{h.isActive ? 'Active' : 'Returned'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Attendance Reports */}
      {activeTab === 'attendance' && attendanceReports && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Average Attendance" value={`${parseFloat(attendanceReports.averageAttendance||0).toFixed(1)}%`} icon={Calendar} color={themeColors.success} />
            <StatCard title="Present Today" value={attendanceReports.todayAttendance||0} icon={Users} color={themeColors.primary} />
            <StatCard title="Late Today" value={attendanceReports.lateToday||0} icon={TrendingUp} color={themeColors.warning} />
            <StatCard title="Team Size" value={attendanceReports.teamSize||0} icon={Users} color={themeColors.primary} />
          </div>

          <ChartCard title={`Monthly Attendance — ${attendanceMonth ? MONTHS[attendanceMonth-1]+' ' : ''}${attendanceYear}`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Month','Year','Present','Late','Half Day','On Leave','Absent','Work Hrs','OT Hrs'].map(h => (
                      <th key={h} className="p-3 text-left border-b font-medium whitespace-nowrap" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(attendanceReports.monthlyStats||[]).length === 0 && <tr><td colSpan={9} className="p-4 text-center" style={{ color: themeColors.textSecondary }}>No attendance data for selected period</td></tr>}
                  {(attendanceReports.monthlyStats||[]).map((m,i) => (
                    <tr key={i} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3">{MONTHS[m._id.month-1]}</td>
                      <td className="p-3">{m._id.year}</td>
                      <td className="p-3" style={{ color: themeColors.success }}>{m.present}</td>
                      <td className="p-3" style={{ color: themeColors.warning }}>{m.late}</td>
                      <td className="p-3">{m.halfDay}</td>
                      <td className="p-3">{m.onLeave}</td>
                      <td className="p-3" style={{ color: themeColors.danger }}>{m.absent}</td>
                      <td className="p-3">{m.totalWorkHours?.toFixed(1)}</td>
                      <td className="p-3">{m.overtimeHours?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <ChartCard title="Employee Wise Attendance">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Emp ID','Name','Department','Role','Present','Late','Half Day','On Leave','Absent','Total Days','Work Hrs','OT Hrs'].map(h => (
                      <th key={h} className="p-3 text-left border-b font-medium whitespace-nowrap" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(attendanceReports.employeeStats||[]).length === 0 && <tr><td colSpan={12} className="p-4 text-center" style={{ color: themeColors.textSecondary }}>No data</td></tr>}
                  {(attendanceReports.employeeStats||[]).map((e,i) => (
                    <tr key={i} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 whitespace-nowrap">{e.employeeId}</td>
                      <td className="p-3 whitespace-nowrap">{e.firstName} {e.lastName}</td>
                      <td className="p-3 whitespace-nowrap">{e.department||'-'}</td>
                      <td className="p-3 whitespace-nowrap">{e.role}</td>
                      <td className="p-3" style={{ color: themeColors.success }}>{e.present}</td>
                      <td className="p-3" style={{ color: themeColors.warning }}>{e.late}</td>
                      <td className="p-3">{e.halfDay}</td>
                      <td className="p-3">{e.onLeave}</td>
                      <td className="p-3" style={{ color: themeColors.danger }}>{e.absent}</td>
                      <td className="p-3">{e.totalDays}</td>
                      <td className="p-3">{e.totalWorkHours?.toFixed(1)}</td>
                      <td className="p-3">{e.overtimeHours?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Leave Reports */}
      {activeTab === 'leaves' && leaveReports && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total Leaves" value={leaveReports.totalLeaves} icon={Calendar} color={themeColors.primary} />
            {(leaveReports.statusStats||[]).map((s,i) => (
              <StatCard key={i} title={s._id} value={s.count} icon={Calendar}
                color={s._id==='Approved'?themeColors.success:s._id==='Pending'?themeColors.warning:themeColors.danger} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Leave Type Summary">
              <div className="space-y-2">
                {(leaveReports.typeStats||[]).map((t,i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: themeColors.background }}>
                    <span className="text-sm">{t._id}</span>
                    <span className="text-sm font-medium">{t.count}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
            <ChartCard title={`Monthly Leave — ${leaveMonth ? MONTHS[leaveMonth-1]+' ' : ''}${leaveYear}`}>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr style={{ backgroundColor: themeColors.background }}>
                      {['Month','Year','Total','Approved','Pending','Rejected'].map(h => (
                        <th key={h} className="p-2 text-left border-b font-medium" style={{ borderColor: themeColors.border }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(leaveReports.monthlyStats||[]).map((m,i) => (
                      <tr key={i} className="border-b" style={{ borderColor: themeColors.border }}>
                        <td className="p-2">{MONTHS[m._id.month-1]}</td>
                        <td className="p-2">{m._id.year}</td>
                        <td className="p-2 font-medium">{m.total}</td>
                        <td className="p-2" style={{ color: themeColors.success }}>{m.approved}</td>
                        <td className="p-2" style={{ color: themeColors.warning }}>{m.pending}</td>
                        <td className="p-2" style={{ color: themeColors.danger }}>{m.rejected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Employee Wise Leave Detail">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Emp ID','Name','Department','Leave Type','Start','End','Days','Reason','Status','Approved By'].map(h => (
                      <th key={h} className="p-3 text-left border-b font-medium whitespace-nowrap" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(leaveReports.employeeLeaves||[]).length === 0 && <tr><td colSpan={10} className="p-4 text-center" style={{ color: themeColors.textSecondary }}>No leave data for selected period</td></tr>}
                  {(leaveReports.employeeLeaves||[]).map((l,i) => (
                    <tr key={i} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 whitespace-nowrap">{l.employeeId}</td>
                      <td className="p-3 whitespace-nowrap">{l.firstName} {l.lastName}</td>
                      <td className="p-3 whitespace-nowrap">{l.department}</td>
                      <td className="p-3 whitespace-nowrap">{l.leaveType}</td>
                      <td className="p-3 whitespace-nowrap">{l.startDate?new Date(l.startDate).toLocaleDateString('en-IN'):'-'}</td>
                      <td className="p-3 whitespace-nowrap">{l.endDate?new Date(l.endDate).toLocaleDateString('en-IN'):'-'}</td>
                      <td className="p-3">{Math.round(l.leaveDays||1)}</td>
                      <td className="p-3" style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason||'-'}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: l.status==='Approved'?themeColors.success+'20':l.status==='Pending'?themeColors.warning+'20':themeColors.danger+'20',
                          color: l.status==='Approved'?themeColors.success:l.status==='Pending'?themeColors.warning:themeColors.danger
                        }}>{l.status}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">{l.approvedBy||'-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Department Reports */}
      {activeTab === 'departments' && departmentReports && (
        <div className="space-y-6">
          <ChartCard title={`Department Overview — ${deptMonth ? MONTHS[deptMonth-1]+' ' : ''}${deptYear}`}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Department','Total','Active','Inactive','Avg Salary'].map(h => (
                      <th key={h} className="p-3 text-left border-b font-medium" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(departmentReports.departmentStats||[]).map((d,i) => (
                    <tr key={i} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 font-medium">{d._id}</td>
                      <td className="p-3">{d.employees}</td>
                      <td className="p-3" style={{ color: themeColors.success }}>{d.active}</td>
                      <td className="p-3" style={{ color: themeColors.danger }}>{d.employees - d.active}</td>
                      <td className="p-3">₹{Math.round(d.avgSalary||0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <ChartCard title="Department Payroll Budget">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Department','Unique Employees','Total Gross (₹)','Total Net (₹)'].map(h => (
                      <th key={h} className="p-3 text-left border-b font-medium" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(departmentReports.payrollByDept||[]).length === 0 && <tr><td colSpan={4} className="p-4 text-center" style={{ color: themeColors.textSecondary }}>No payroll data for selected period</td></tr>}
                  {(departmentReports.payrollByDept||[]).map((d,i) => (
                    <tr key={i} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 font-medium">{d._id}</td>
                      <td className="p-3">{d.employeeCount}</td>
                      <td className="p-3">₹{(d.totalGross||0).toLocaleString()}</td>
                      <td className="p-3 font-medium">₹{(d.totalBudget||0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <ChartCard title="Employee Wise Detail">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: themeColors.background }}>
                    {['Emp ID','Name','Department','Designation','Role','Salary','Status','Joined'].map(h => (
                      <th key={h} className="p-3 text-left border-b font-medium whitespace-nowrap" style={{ borderColor: themeColors.border }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(departmentReports.employeeDetails||[]).map((e,i) => (
                    <tr key={i} className="border-b" style={{ borderColor: themeColors.border }}>
                      <td className="p-3 whitespace-nowrap">{e.employeeId}</td>
                      <td className="p-3 whitespace-nowrap">{e.name?.first} {e.name?.last}</td>
                      <td className="p-3 whitespace-nowrap">{e.department?.name||'N/A'}</td>
                      <td className="p-3 whitespace-nowrap">{e.designation?.title||'N/A'}</td>
                      <td className="p-3 whitespace-nowrap">{e.role}</td>
                      <td className="p-3 whitespace-nowrap">₹{(e.salary||0).toLocaleString()}</td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: e.isActive?themeColors.success+'20':themeColors.danger+'20',
                          color: e.isActive?themeColors.success:themeColors.danger
                        }}>{e.isActive?'Active':'Inactive'}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">{e.dateOfJoining?new Date(e.dateOfJoining).toLocaleDateString('en-IN'):'-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}


    </div>
  );
};

export default Reports;