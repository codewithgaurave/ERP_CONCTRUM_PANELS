// src/routes/SidebarRoutes.jsx
import { lazy } from "react";
import LeavesManagement from "../pages/LeavesManagement";
import ManageAnnouncements from "../pages/ManageAnnouncements";
import TaskManagement from "../pages/TaskManagement";

// ✅ Components first
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Employees = lazy(() => import("../pages/Employees"));
const Attendance = lazy(() => import("../pages/Attendance"));
const Leave = lazy(() => import("../pages/Leave"));
const Payroll = lazy(() => import("../pages/Payroll"));
const Reports = lazy(() => import("../pages/Reports"));
const Settings = lazy(() => import("../pages/Settings"));

// ✅ Then use them in routes
const routes = [
  { path: "/dashboard", component: Dashboard, name: "Dashboard", icon: "📊" },
  { path: "/employees", component: Employees, name: "Employees", icon: "👥" },
  { path: "/attendance", component: Attendance, name: "Attendance", icon: "⏱️" },
  { path: "/leave-requests", component: LeavesManagement, name: "Manage Leaves", icon: "📅" },
  { path: "/announcements", component: ManageAnnouncements, name: "Manage Annoucement", icon: "📢" },
  { path: "/manage-tasks", component: TaskManagement, name: "Manage Tasks", icon: "📢" },
  { path: "/payroll", component: Payroll, name: "Payroll", icon: "💰" },
  { path: "/reports", component: Reports, name: "Reports", icon: "📈" },
  { path: "/settings", component: Settings, name: "Settings", icon: "⚙️" },
];

export default routes;
