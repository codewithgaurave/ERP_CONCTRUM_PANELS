// src/components/tasks/TaskHistory.js
import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  CheckCircle,
  Clock,
  PlayCircle,
  AlertCircle,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const TaskHistory = ({ task }) => {
  const { themeColors } = useTheme();

  const [openSection, setOpenSection] = useState("details"); // 'details', 'history', or null

  const getHistoryIcon = (status) => {
    const icons = {
      Assigned: <User size={16} />,
      Approved: <ThumbsUp size={16} />,
      Rejected: <ThumbsDown size={16} />,
      Completed: <CheckCircle size={16} />,
      "In Progress": <PlayCircle size={16} />,
      Pending: <Clock size={16} />,
      New: <AlertCircle size={16} />,
    };
    return icons[status] || <AlertCircle size={16} />;
  };

  const getStatusColor = (status) => {
    const colors = {
      Approved: themeColors.success,
      Rejected: themeColors.danger,
      Completed: themeColors.success,
      "In Progress": themeColors.warning,
      Pending: themeColors.accent,
      Assigned: themeColors.primary,
      New: themeColors.text,
    };
    return colors[status] || themeColors.text;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Smart toggle functions
  const toggleDetails = () => {
    if (openSection === "details") {
      // If details is open, close it and open history
      setOpenSection("history");
    } else {
      // If details is closed or history is open, open details
      setOpenSection("details");
    }
  };

  const toggleHistory = () => {
    if (openSection === "history") {
      // If history is open, close it and open details
      setOpenSection("details");
    } else {
      // If history is closed or details is open, open history
      setOpenSection("history");
    }
  };

  // Always keep one section open
  const ensureOneOpen = () => {
    if (openSection === null) {
      setOpenSection("details");
    }
  };

  if (!task.taskHistory?.length) {
    return (
      <div className="text-center py-8" style={{ color: themeColors.text }}>
        <Clock size={48} className="mx-auto mb-4 opacity-50" />
        <p style={{ color: themeColors.text }}>No history available for this task.</p>
      </div>
    );
  }

  const sortedHistory = [...task.taskHistory].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  const isDetailsOpen = openSection === "details";
  const isHistoryOpen = openSection === "history";

  return (
    <div className="flex flex-col h-[90vh] gap-4">

      {/* TASK DETAILS - COLLAPSIBLE */}
      <div
        className="rounded-lg border flex-shrink-0 transition-all duration-300"
        style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border,
          transform: isDetailsOpen ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex justify-between items-center cursor-pointer hover:opacity-90 transition-all"
          onClick={toggleDetails}
          style={{ color: themeColors.text }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-full transition-transform duration-300"
              style={{
                backgroundColor: isDetailsOpen ? themeColors.primary + "20" : themeColors.background,
                color: isDetailsOpen ? themeColors.primary : themeColors.text,
              }}
            >
              <History size={20} />
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: themeColors.text }}>
                Task Details
              </h4>
              <p className="text-sm" style={{ color: themeColors.text }}>
                {isDetailsOpen ? 'Click to collapse and show history' : 'Click to expand'}
              </p>
            </div>
          </div>
          <div style={{ color: themeColors.text }}>
            {isDetailsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {/* BODY */}
        {isDetailsOpen && (
          <div className="p-4 border-t" style={{ borderColor: themeColors.border }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* LEFT COLUMN */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: themeColors.text }}>
                    TITLE
                  </label>
                  <div 
                    className="p-3 rounded border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  >
                    {task.title}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: themeColors.text }}>
                    DESCRIPTION
                  </label>
                  <div 
                    className="p-3 rounded border min-h-[60px] text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  >
                    {task.description || (
                      <span style={{ color: themeColors.text }}>No description provided</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: themeColors.text }}>
                    CURRENT STATUS
                  </label>
                  <div
                    className="inline-flex items-center gap-2 px-3 py-2 rounded border text-sm font-medium"
                    style={{
                      backgroundColor: getStatusColor(task.status) + "15",
                      borderColor: getStatusColor(task.status) + "40",
                      color: getStatusColor(task.status),
                    }}
                  >
                    {getHistoryIcon(task.status)}
                    {task.status}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: themeColors.text }}>
                    PRIORITY
                  </label>
                  <div 
                    className="p-3 rounded border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  >
                    {task.priority}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium mb-2 block" style={{ color: themeColors.text }}>
                    DEADLINE
                  </label>
                  <div 
                    className="p-3 rounded border flex gap-2 items-center text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text
                    }}
                  >
                    <Calendar size={16} style={{ color: themeColors.text }} />
                    {task.deadline ? formatDate(task.deadline) : "No deadline"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-2 block" style={{ color: themeColors.text }}>
                      ASSIGNED TO
                    </label>
                    <div 
                      className="p-3 rounded border flex gap-2 items-center text-sm"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: themeColors.border,
                        color: themeColors.text
                      }}
                    >
                      <User size={16} style={{ color: themeColors.text }} />
                      {task.assignedTo?.name?.first} {task.assignedTo?.name?.last}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-2 block" style={{ color: themeColors.text }}>
                      ASSIGNED BY
                    </label>
                    <div 
                      className="p-3 rounded border flex gap-2 items-center text-sm"
                      style={{
                        backgroundColor: themeColors.background,
                        borderColor: themeColors.border,
                        color: themeColors.text
                      }}
                    >
                      <User size={16} style={{ color: themeColors.text }} />
                      {task.assignedBy?.name?.first} {task.assignedBy?.name?.last}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {task.statusRemarks && (
              <div className="mt-4">
                <label className="text-xs font-medium mb-2 block" style={{ color: themeColors.text }}>
                  CURRENT REMARKS
                </label>
                <div 
                  className="p-3 rounded border text-sm"
                  style={{
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text
                  }}
                >
                  {task.statusRemarks}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* HISTORY SECTION - COLLAPSIBLE */}
      <div
        className="rounded-lg border flex-1 flex flex-col min-h-0 transition-all duration-300"
        style={{ 
          backgroundColor: themeColors.surface, 
          borderColor: themeColors.border,
          transform: isHistoryOpen ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:opacity-90 transition-all flex-shrink-0"
          onClick={toggleHistory}
          style={{ color: themeColors.text }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: isHistoryOpen ? themeColors.primary + "20" : themeColors.background,
                color: isHistoryOpen ? themeColors.primary : themeColors.text,
              }}
            >
              <History size={20} />
            </div>
            <div>
              <h4 className="font-semibold" style={{ color: themeColors.text }}>
                Activity History
              </h4>
              <p className="text-sm" style={{ color: themeColors.text }}>
                {isHistoryOpen ? `${sortedHistory.length} entries - Click to collapse and show details` : 'Click to expand'}
              </p>
            </div>
          </div>
          <div style={{ color: themeColors.text }}>
            {isHistoryOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {isHistoryOpen && (
          <div
            className="flex-1 overflow-y-auto border-t p-4"
            style={{ borderColor: themeColors.border }}
          >
            <div className="relative">
              {/* Timeline line */}
              <div
                className="absolute left-6 top-0 bottom-0 w-0.5"
                style={{ backgroundColor: themeColors.border + '80' }}
              />

              {sortedHistory.map((history, index) => (
                <div
                  key={index}
                  className="relative flex gap-4 p-4 mb-4 rounded-lg border transition-all hover:scale-[1.005] group"
                  style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                    marginLeft: "2rem",
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute left-0 top-1/2 w-3 h-3 rounded-full border-2 z-10 transition-all group-hover:scale-125"
                    style={{
                      backgroundColor: themeColors.surface,
                      borderColor: getStatusColor(history.status),
                      transform: "translate(-50%, -50%)",
                      boxShadow: `0 0 0 2px ${themeColors.surface}`
                    }}
                  />

                  {/* Status Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                    style={{
                      backgroundColor: getStatusColor(history.status) + "20",
                      color: getStatusColor(history.status),
                    }}
                  >
                    {getHistoryIcon(history.status)}
                  </div>

                  {/* History Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: getStatusColor(history.status) + "20",
                          color: getStatusColor(history.status),
                        }}
                      >
                        {history.status}
                      </span>

                      <div className="flex items-center gap-2 text-sm"
                        style={{ color: themeColors.text }}
                      >
                        <Calendar size={14} />
                        {formatDate(history.updatedAt)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-3"
                      style={{ color: themeColors.text }}
                    >
                      <User size={14} />
                      <span>
                        By: {history.updatedBy?.name?.first} {history.updatedBy?.name?.last}
                        {history.updatedBy?.employeeId && ` (${history.updatedBy.employeeId})`}
                      </span>
                    </div>

                    {history.remarks && (
                      <div
                        className="mt-2 p-3 rounded border"
                        style={{
                          backgroundColor: themeColors.background,
                          borderColor: themeColors.border,
                        }}
                      >
                        <label
                          className="text-xs font-medium mb-1 block"
                          style={{ color: themeColors.text }}
                        >
                          REMARKS
                        </label>
                        <p className="text-sm" style={{ color: themeColors.text }}>
                          {history.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div 
        className="flex justify-between text-sm pt-4 border-t flex-shrink-0"
        style={{ borderColor: themeColors.border }}
      >
        <div>
          <span style={{ color: themeColors.text }}>
            Created:{" "}
          </span>
          <strong style={{ color: themeColors.text }}>
            {task.createdAt ? formatDate(task.createdAt) : "N/A"}
          </strong>
        </div>

        <div>
          <span style={{ color: themeColors.text }}>
            Last Updated:{" "}
          </span>
          <strong style={{ color: themeColors.text }}>
            {task.updatedAt ? formatDate(task.updatedAt) : "N/A"}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default TaskHistory;