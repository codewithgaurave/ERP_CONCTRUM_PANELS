// src/routes/index.jsx
import { lazy } from "react";
import HRRoutes from "./HRRoutes";
import TeamLeaderRoutes from "./TeamLeaderRoutes";
import EmployeeRoutes from "./EmployeeRoutes";

// Common components that might be needed across roles
const EmployeeProfile = lazy(() => import("../components/EmployeeProfile"));

// Role-based route configuration
export const getRoutesByRole = (role) => {
  switch (role) {
    case "HR_Manager":
      return HRRoutes;
    case "Team_Leader":
      return TeamLeaderRoutes;
    case "Employee":
      return EmployeeRoutes;
    default:
      return []; // No routes for unknown roles
  }
};

// Common routes that should be available for all roles
export const getCommonRoutes = () => [
  { path: "/employee-profile/:id", component: EmployeeProfile, name: "Profile", icon: "👤" },
];

export { HRRoutes, TeamLeaderRoutes, EmployeeRoutes };