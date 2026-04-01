// src/routes/TeamLeaderRoutes.jsx
import { lazy } from "react";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Attendance = lazy(() => import("../team-leader/TeamLeaderAttendance"));
const TeamLeaderLeaves = lazy(() => import("../team-leader/TeamLeaderLeaves"));
const TeamMembers = lazy(() => import("../team-leader/TeamMembers"));
const TeamPayroll = lazy(() => import("../team-leader/TeamPayroll"));
const TeamNotices = lazy(() => import("../team-leader/TeamNotices"));
const MyAssets = lazy(() => import("../team-leader/MyAssets"));
const MyLeaves = lazy(() => import("../team-leader/MyLeaves"));
const TaskManagement = lazy(() => import("../pages/TaskManagement"));

const routes = [
  { path: "/dashboard", component: Dashboard, name: "Dashboard", icon: "📊" },
  { path: "/attendance", component: Attendance, name: "Mark Attendance", icon: "⏰" },
  { path: "/team-members", component: TeamMembers, name: "Team Members", icon: "👥" },
  { path: "/manage-tasks", component: TaskManagement, name: "Manage Tasks", icon: "📋" },
  { path: "/leave-requests", component: TeamLeaderLeaves, name: "Leave Requests", icon: "📅" },
  { path: "/my-leaves", component: MyLeaves, name: "My Leaves", icon: "📝" },
  { path: "/team-payroll", component: TeamPayroll, name: "Team Payroll", icon: "💰" },
  { path: "/team-notices", component: TeamNotices, name: "Team Notices", icon: "📢" },
  { path: "/my-assets", component: MyAssets, name: "My Assets", icon: "💻" },
];

export default routes;