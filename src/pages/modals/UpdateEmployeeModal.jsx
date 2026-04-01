// src/components/modals/UpdateEmployeeModal.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import employeeAPI from "../../apis/employeeAPI";
import departmentAPI from "../../apis/departmentAPI";
import designationAPI from "../../apis/designationAPI";
import employmentStatusAPI from "../../apis/employmentStatusAPI";
import officeLocationAPI from "../../apis/officeLocationAPI";
import workShiftAPI from "../../apis/workShiftAPI";
import { toast } from "sonner";

const UpdateEmployeeModal = ({ isOpen, onClose, employee, onEmployeeUpdated }) => {
  const { themeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employmentStatuses, setEmploymentStatuses] = useState([]);
  const [officeLocations, setOfficeLocations] = useState([]);
  const [workShifts, setWorkShifts] = useState([]);
  
  const [formData, setFormData] = useState({
    name: { first: "", last: "" },
    email: "",
    mobile: "",
    alternateMobile: "",
    whatsappNumber: "",
    gender: "",
    dob: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "India",
      pincode: ""
    },
    role: "Employee",
    manager: "",
    department: "",
    designation: "",
    employmentStatus: "",
    officeLocation: "",
    workShift: "",
    salary: "",
    dateOfJoining: "",
    allowedPunchInRange: 500
  });

  // Fetch all reference data
  const fetchReferenceData = async () => {
    try {
      const [
        managersResponse,
        deptResponse,
        desigResponse,
        statusResponse,
        locationResponse,
        shiftResponse
      ] = await Promise.all([
        employeeAPI.getManagers(),
        departmentAPI.getAll({ limit: 100 }),
        designationAPI.getAll({ limit: 100 }),
        employmentStatusAPI.getAll({ limit: 100 }),
        officeLocationAPI.getAll(),
        workShiftAPI.getAllWithoutFilters()
      ]);

      setManagers(managersResponse.data.managers || []);
      setDepartments(deptResponse.data.departments || []);
      setDesignations(desigResponse.data.designations || []);
      setEmploymentStatuses(statusResponse.data.employmentStatuses || []);
      setOfficeLocations(locationResponse.data.officeLocations || []);
      setWorkShifts(shiftResponse.data || []);
    } catch (err) {
      console.error("Error fetching reference data:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReferenceData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        name: {
          first: employee.name?.first || "",
          last: employee.name?.last || ""
        },
        email: employee.email || "",
        mobile: employee.mobile || "",
        alternateMobile: employee.alternateMobile || "",
        whatsappNumber: employee.whatsappNumber || "",
        gender: employee.gender || "",
        dob: employee.dob ? new Date(employee.dob).toISOString().split('T')[0] : "",
        address: {
          street: employee.address?.street || "",
          city: employee.address?.city || "",
          state: employee.address?.state || "",
          country: employee.address?.country || "India",
          pincode: employee.address?.pincode || ""
        },
        role: employee.role || "Employee",
        manager: employee.manager?._id || "",
        department: employee.department?._id || "",
        designation: employee.designation?._id || "",
        employmentStatus: employee.employmentStatus?._id || "",
        officeLocation: employee.officeLocation?._id || "",
        workShift: employee.workShift?._id || "",
        salary: employee.salary || "",
        dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        allowedPunchInRange: employee.allowedPunchInRange || 500
      });
    }
  }, [employee, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('name.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        name: {
          ...prev.name,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    

    try {
      setLoading(true);
      
      const updateData = {
        ...formData,
        salary: Number(formData.salary),
        allowedPunchInRange: Number(formData.allowedPunchInRange) || 500,
        // Convert empty strings to undefined for optional fields
        gender: formData.gender || undefined,
        dob: formData.dob || undefined,
        manager: formData.manager || undefined,
        alternateMobile: formData.alternateMobile || undefined,
        whatsappNumber: formData.whatsappNumber || undefined,
        address: formData.address.street ? formData.address : undefined
      };

      const response = await employeeAPI.update(employee._id, updateData);
      toast.success(response.data.message || "Employee updated successfully!");
      onEmployeeUpdated(response.data.employee);
      onClose();

    } catch (err) {
      console.log("err", err);
      toast.error(err.response?.data?.message || "Error updating employee");
      setError(err.response?.data?.message || err.message || "Error updating employee");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !employee) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: themeColors.surface,
          color: themeColors.text
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: themeColors.border }}>
          <h2 className="text-xl font-bold">Update Employee</h2>
          <p className="text-sm mt-1" style={{ color: themeColors.textSecondary }}>
            Update details for {employee.name?.first} {employee.name?.last}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div 
              className="p-3 rounded-lg mb-4 text-sm"
              style={{
                backgroundColor: themeColors.danger + '20',
                color: themeColors.danger,
                border: `1px solid ${themeColors.danger}`
              }}
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg" style={{ color: themeColors.primary }}>
                Personal Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    name="name.first"
                    value={formData.name.first}
                    onChange={handleInputChange}
                    // required
                    className="w-full p-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="name.last"
                    value={formData.name.last}
                    onChange={handleInputChange}
                    // required
                    className="w-full p-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  // required
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mobile *</label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    // required
                    className="w-full p-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Alternate Mobile</label>
                  <input
                    type="text"
                    name="alternateMobile"
                    value={formData.alternateMobile}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg" style={{ color: themeColors.primary }}>
                Address Information
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                    className="w-full p-2 rounded-md border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg" style={{ color: themeColors.primary }}>
                Employment Information
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  // required
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                >
                  <option value="Employee">Employee</option>
                  <option value="Team_Leader">Team Leader</option>
                  <option value="HR_Manager">HR Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Manager</label>
                <select
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                >
                  <option value="">Select Manager</option>
                  {managers.map(manager => (
                    <option key={manager._id} value={manager._id}>
                      {manager.name?.first} {manager.name?.last} ({manager.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  // required
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Designation *</label>
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  // required
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                >
                  <option value="">Select Designation</option>
                  {designations.map(designation => (
                    <option key={designation._id} value={designation._id}>
                      {designation.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Employment Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg" style={{ color: themeColors.primary }}>
                Additional Information
              </h3>

              <div>
                <label className="block text-sm font-medium mb-2">Employment Status *</label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleInputChange}
                  // required
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                >
                  <option value="">Select Status</option>
                  {employmentStatuses.map(status => (
                    <option key={status._id} value={status._id}>
                      {status.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Office Location *</label>
                <select
                  name="officeLocation"
                  value={formData.officeLocation}
                  onChange={handleInputChange}
                  // required
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                >
                  <option value="">Select Office Location</option>
                  {officeLocations.map(location => (
                    <option key={location._id} value={location._id}>
                      {location.officeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Work Shift *</label>
                <select
                  name="workShift"
                  value={formData.workShift}
                  onChange={handleInputChange}
                  // required
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                >
                  <option value="">Select Work Shift</option>
                  {workShifts.map(shift => (
                    <option key={shift._id} value={shift._id}>
                      {shift.name} ({shift.startTime} - {shift.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Salary *</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  // required
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date of Joining</label>
                <input
                  type="date"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Punch-In Range (meters)
                  <span className="text-xs ml-2" style={{ color: themeColors.textSecondary }}>
                    (10m - 10,000m)
                  </span>
                </label>
                <input
                  type="number"
                  name="allowedPunchInRange"
                  value={formData.allowedPunchInRange}
                  onChange={handleInputChange}
                  min="10"
                  max="10000"
                  placeholder="500"
                  className="w-full p-2 rounded-md border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                />
                <p className="text-xs mt-1" style={{ color: themeColors.textSecondary }}>
                  Default: 500m. Employee can punch-in within this range from office.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: themeColors.border }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border font-medium"
              style={{
                backgroundColor: themeColors.background,
                borderColor: themeColors.border,
                color: themeColors.text
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50"
              style={{
                backgroundColor: themeColors.primary
              }}
            >
              {loading ? "Updating..." : "Update Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEmployeeModal;