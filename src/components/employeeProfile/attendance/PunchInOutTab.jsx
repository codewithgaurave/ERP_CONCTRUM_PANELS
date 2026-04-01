// src/components/employeeProfile/attendance/PunchInOutTab.jsx
import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  LogIn, 
  LogOut, 
  Calendar,
  CheckCircle,
  AlertCircle,
  User,
  Smartphone
} from 'lucide-react';

const PunchInOutTab = ({ 
  isSelf, 
  employee, 
  punchData, 
  onPunchAction, 
  onConfirmPunch, 
  onCancelPunch, 
  onRefreshLocation,
  onManualPunch,
  onRefresh 
}) => {
  const { themeColors } = useTheme();
  const [manualTime, setManualTime] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const { 
    loading, 
    error, 
    success, 
    todayAttendance, 
    currentLocation, 
    showConfirmation 
  } = punchData;

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle manual punch submission
  const handleManualPunchSubmit = (action) => {
    if (!manualTime) {
      alert('Please select a time');
      return;
    }
    onManualPunch(action, new Date(manualTime));
    setManualTime('');
    setShowManualInput(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Employee Info */}
      <div className="p-4 sm:p-6 rounded-xl border" style={{ 
        backgroundColor: themeColors.surface, 
        borderColor: themeColors.border 
      }}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-full" style={{ backgroundColor: themeColors.primary + '20' }}>
            <User size={20} className="sm:w-6 sm:h-6" style={{ color: themeColors.primary }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: themeColors.text }}>
              {employee?.name?.first} {employee?.name?.last}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              Employee ID: {employee?.employeeId}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Mode: {isSelf ? 'Self Service' : 'HR Manager View'}
            </p>
          </div>
          <div className="sm:hidden">
            <Smartphone size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Attendance Status */}
        <div className="p-4 sm:p-6 rounded-xl border" style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Calendar size={20} className="sm:w-6 sm:h-6" style={{ color: themeColors.primary }} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base" style={{ color: themeColors.text }}>Today's Status</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          {todayAttendance ? (
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Punch In:</span>
                <span className="font-medium" style={{ color: themeColors.text }}>
                  {formatTime(todayAttendance.punchIn?.timestamp)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Punch Out:</span>
                <span className="font-medium" style={{ color: themeColors.text }}>
                  {todayAttendance.punchOut?.timestamp 
                    ? formatTime(todayAttendance.punchOut.timestamp)
                    : '--:--'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  todayAttendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                  todayAttendance.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                  todayAttendance.status === 'Absent' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {todayAttendance.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Work Hours:</span>
                <span className="font-medium" style={{ color: themeColors.text }}>
                  {todayAttendance.totalWorkHours?.toFixed(2) || '0'}h
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-3 sm:py-4 text-sm text-gray-500">
              <p>No attendance recorded for today</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-4 sm:p-6 rounded-xl border" style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border 
        }}>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Clock size={20} className="sm:w-6 sm:h-6" style={{ color: themeColors.primary }} />
            <div>
              <h3 className="font-semibold text-sm sm:text-base" style={{ color: themeColors.text }}>Quick Actions</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {isSelf ? 'Mark your attendance' : `Mark attendance for ${employee?.name?.first}`}
              </p>
            </div>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => onConfirmPunch('in')}
              disabled={loading || (todayAttendance && todayAttendance.punchIn)}
              className="w-full py-2 sm:py-3 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base"
              style={{ backgroundColor: themeColors.success }}
            >
              <LogIn size={16} className="sm:w-5 sm:h-5" />
              {todayAttendance?.punchIn ? 'Already Punched In' : 'Punch In'}
            </button>
            
            <button
              onClick={() => onConfirmPunch('out')}
              disabled={loading || !todayAttendance?.punchIn || todayAttendance?.punchOut}
              className="w-full py-2 sm:py-3 rounded-lg font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm sm:text-base"
              style={{ backgroundColor: themeColors.danger }}
            >
              <LogOut size={16} className="sm:w-5 sm:h-5" />
              {todayAttendance?.punchOut ? 'Already Punched Out' : 'Punch Out'}
            </button>

            {/* Manual Time Input for HR Manager */}
            {!isSelf && (
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="w-full py-2 sm:py-3 rounded-lg font-medium transition-all hover:scale-105 border flex items-center justify-center gap-2 text-sm sm:text-base"
                style={{ 
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }}
              >
                <Clock size={16} className="sm:w-5 sm:h-5" />
                {showManualInput ? 'Cancel' : 'Manual Time'}
              </button>
            )}
          </div>

          {/* Manual Time Input */}
          {showManualInput && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border" style={{ 
              backgroundColor: themeColors.background,
              borderColor: themeColors.border
            }}>
              <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                Select Time:
              </label>
              <input
                type="datetime-local"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 border rounded-lg mb-2 sm:mb-3 text-sm"
                style={{
                  borderColor: themeColors.border,
                  backgroundColor: themeColors.surface,
                  color: themeColors.text
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleManualPunchSubmit('in')}
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg font-medium text-white text-xs sm:text-sm disabled:opacity-50"
                  style={{ backgroundColor: themeColors.success }}
                >
                  Punch In
                </button>
                <button
                  onClick={() => handleManualPunchSubmit('out')}
                  disabled={loading}
                  className="flex-1 py-2 rounded-lg font-medium text-white text-xs sm:text-sm disabled:opacity-50"
                  style={{ backgroundColor: themeColors.danger }}
                >
                  Punch Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Location Services */}
        {isSelf && (
          <div className="p-4 sm:p-6 rounded-xl border" style={{ 
            backgroundColor: themeColors.surface, 
            borderColor: themeColors.border 
          }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Navigation size={20} className="sm:w-6 sm:h-6" style={{ color: themeColors.primary }} />
              <div>
                <h3 className="font-semibold text-sm sm:text-base" style={{ color: themeColors.text }}>Location Services</h3>
                <p className="text-xs sm:text-sm text-gray-600">Manage your location</p>
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={onRefreshLocation}
                disabled={loading}
                className="w-full py-2 sm:py-3 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 border text-sm sm:text-base"
                style={{ 
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }}
              >
                <Navigation size={16} className={`sm:w-5 sm:h-5 ${loading ? "animate-spin" : ""}`} />
                {loading ? 'Getting Location...' : 'Refresh Location'}
              </button>

              {/* Current Location Info */}
              {currentLocation && (
                <div className="p-2 sm:p-3 rounded-lg text-xs space-y-1" style={{ 
                  backgroundColor: themeColors.background,
                  color: themeColors.text
                }}>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Latitude:</span>
                    <span>{currentLocation.latitude?.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Longitude:</span>
                    <span>{currentLocation.longitude?.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accuracy:</span>
                    <span>±{currentLocation.accuracy?.toFixed(1)}m</span>
                  </div>
                  {currentLocation.address && (
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: themeColors.border }}>
                      <span className="font-medium text-gray-600">Address:</span>
                      <p className="mt-1 text-gray-700 truncate">{currentLocation.address}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 sm:p-4 rounded-lg border flex items-center gap-2 text-sm" style={{ 
          backgroundColor: themeColors.danger + '20', 
          borderColor: themeColors.danger,
          color: themeColors.danger
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 sm:p-4 rounded-lg border flex items-center gap-2 text-sm" style={{ 
          backgroundColor: themeColors.success + '20', 
          borderColor: themeColors.success,
          color: themeColors.success
        }}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Punch Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-auto" style={{ 
            backgroundColor: themeColors.surface,
            color: themeColors.text
          }}>
            <h3 className="text-lg font-semibold mb-4">
              Confirm {showConfirmation === 'in' ? 'Punch In' : 'Punch Out'}
            </h3>
            
            <div className="space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
              <p>
                Are you sure you want to {showConfirmation === 'in' ? 'punch in' : 'punch out'} 
                {!isSelf && ` for ${employee?.name?.first} ${employee?.name?.last}`}?
              </p>
              
              {isSelf && currentLocation && (
                <div className="p-2 sm:p-3 rounded-lg text-xs sm:text-sm" style={{ 
                  backgroundColor: themeColors.background 
                }}>
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <MapPin size={14} />
                    <span className="font-medium">Location:</span>
                  </div>
                  <p className="text-xs sm:text-sm">{currentLocation.address}</p>
                  <p className="text-xs opacity-75 mt-1">
                    Coordinates: {currentLocation.latitude?.toFixed(4)}, {currentLocation.longitude?.toFixed(4)}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm" style={{ color: themeColors.text }}>
                <Clock size={14} />
                <span>Time: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={onCancelPunch}
                disabled={loading}
                className="flex-1 py-2 rounded-lg border font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
                style={{ 
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                  color: themeColors.text
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => onPunchAction(showConfirmation)}
                disabled={loading}
                className="flex-1 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                style={{ 
                  backgroundColor: showConfirmation === 'in' ? themeColors.success : themeColors.danger
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {showConfirmation === 'in' ? <LogIn size={16} /> : <LogOut size={16} />}
                    Confirm {showConfirmation === 'in' ? 'Punch In' : 'Punch Out'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PunchInOutTab;