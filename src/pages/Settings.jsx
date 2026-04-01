// src/pages/Settings.jsx
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

import {
  Building,
  Briefcase,
  Clock,
  UserCheck,
  Settings as SettingsIcon,
  ChevronRight,
  LocateIcon,
  BookCheck
} from "lucide-react";
import Departments from "./Departments";
import Designations from "./Designations";
import WorkShifts from "./WorkShifts";
import EmploymentStatuses from "./EmploymentStatuses";
import OfficeLocations from "./OfficeLocations";
import LeavePolicies from "./LeavePolicies";

const Settings = () => {
  const { themeColors } = useTheme();
  const [activeTab, setActiveTab] = useState("departments");

  // Tab configuration
  const tabs = [
    {
      id: "employment-status",
      name: "Employment Status",
      icon: UserCheck,
      component: EmploymentStatuses,
      description: "Manage employment types and status categories"
    },
    {
      id: "departments",
      name: "Departments",
      icon: Building,
      component: Departments,
      description: "Manage company departments and organizational structure"
    },
    {
      id: "designations",
      name: "Designations",
      icon: Briefcase,
      component: Designations,
      description: "Manage employee job titles and roles"
    },
    {
      id: "workshifts",
      name: "Work Shifts",
      icon: Clock,
      component: WorkShifts,
      description: "Manage work schedules and shift timings"
    },
    {
      id: "officelocations",
      name: "Office Locations",
      icon: LocateIcon,
      component: OfficeLocations,
      description: "Manage office locations"
    },
    {
      id: "leavepolicies",
      name: "Leave Policies",
      icon: BookCheck,
      component: LeavePolicies,
      description: "Manage leave policies"
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon size={28} style={{ color: themeColors.primary }} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: themeColors.text }}>
            System Settings
          </h1>
          <p className="text-sm" style={{ color: themeColors.text }}>
            Manage your organization's settings and configurations
          </p>
        </div>
      </div>

      <div className="flex flex-col  gap-6">
        {/* Sidebar Navigation */}
        <div
          className=" p-6 rounded-lg h-fit"
          style={{
            backgroundColor: themeColors.surface,
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <h2 className="text-lg font-semibold mb-4" style={{ color: themeColors.text }}>
            Settings Categories
          </h2>

          <nav className="space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${isActive ? 'ring-2 ring-opacity-50' : 'hover:opacity-90'
                    }`}
                  style={{
                    backgroundColor: isActive ? themeColors.primary : themeColors.background,
                    color: isActive ? 'white' : themeColors.text,
                    border: `1px solid ${isActive ? themeColors.primary : themeColors.border}`,
                    ringColor: themeColors.primary
                  }}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent size={20} />
                    <div className="text-left">
                      <div className="font-medium">{tab.name}</div>
                      <div
                        className="text-xs mt-1"
                        style={{
                          color: isActive ? 'rgba(255,255,255,0.8)' : themeColors.text
                        }}
                      >
                        {tab.description}
                      </div>
                    </div>
                  </div>
                  {isActive && <ChevronRight size={16} />}
                </button>
              );
            })}
          </nav>

          {/* Coming Soon Section */}
          <div className="mt-8 pt-6 border-t" style={{ borderColor: themeColors.border }}>
            <h3 className="text-sm font-medium mb-3" style={{ color: themeColors.text }}>
              Coming Soon
            </h3>
            <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[
                { name: "Leave Policies", icon: "📋" },
                { name: "Attendance Rules", icon: "⏰" },
                { name: "Payroll Settings", icon: "💰" },
                { name: "System Preferences", icon: "⚙️" }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg opacity-60"
                  style={{
                    backgroundColor: themeColors.background,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <span>{item.icon}</span>
                  <span className="text-sm" style={{ color: themeColors.text }}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div
            className="rounded-lg"
            style={{
              backgroundColor: themeColors.surface,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            {/* Tab Header */}
            <div
              className="p-6 border-b"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const IconComponent = tabs.find(tab => tab.id === activeTab)?.icon;
                  return IconComponent ? <IconComponent size={24} style={{ color: themeColors.primary }} /> : null;
                })()}
                <div>
                  <h2 className="text-xl font-semibold" style={{ color: themeColors.text }}>
                    {tabs.find(tab => tab.id === activeTab)?.name}
                  </h2>
                  <p className="text-sm" style={{ color: themeColors.text }}>
                    {tabs.find(tab => tab.id === activeTab)?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-0">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Settings;