// src/components/DashboardLayout.jsx (Updated)
import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { useLocation, Outlet } from "react-router-dom";
import { getRoutesByRole } from "../routes"; // Import role-based routes
import Header from "./Header";
import MobileSidebar from "./MobileSidebar"; 
import DesktopSidebar from "./DesktopSidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { user, logout } = useAuth();
  const { themeColors, toggleTheme, palette, changePalette } = useTheme();
  const { currentFont, corporateFonts, changeFont } = useFont();
  const location = useLocation();

  // Get routes based on user role
  const sidebarRoutes = useMemo(() => {
    return user ? getRoutesByRole(user.role) : [];
  }, [user]);

  const currentPageTitle = useMemo(() => {
    return sidebarRoutes.find(route => route.path === location.pathname)?.name || "Dashboard";
  }, [location.pathname, sidebarRoutes]);

  // Mobile/Tablet sidebar toggle
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Desktop sidebar collapse toggle
  const toggleSidebarCollapse = useCallback((collapsed) => {
    setSidebarCollapsed(collapsed);
  }, []);

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    if (window.innerWidth < 1024) {
      closeSidebar();
    }
  }, [location.pathname, closeSidebar]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ 
        backgroundColor: themeColors.background,
        fontFamily: currentFont.family
      }}
    >
      {/* Mobile & Tablet Sidebar */}
      <MobileSidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        routes={sidebarRoutes}
        currentPath={location.pathname}
        user={user}
        logout={logout}
        themeColors={themeColors}
      />

      {/* Desktop Sidebar */}
      <DesktopSidebar 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        routes={sidebarRoutes}
        currentPath={location.pathname}
        user={user}
        logout={logout}
        themeColors={themeColors}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header
          toggleSidebar={toggleSidebar}
          currentPageTitle={currentPageTitle}
          themeColors={themeColors}
          currentFont={currentFont}
          corporateFonts={corporateFonts}
          changeFont={changeFont}
          palette={palette}
          changePalette={changePalette}
          toggleTheme={toggleTheme}
        />

        <main 
          className="flex-1 overflow-y-auto p-4 md:p-6" 
          style={{backgroundColor: themeColors.background}}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;