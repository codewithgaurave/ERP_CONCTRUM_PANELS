// src/components/DesktopSidebar.jsx (Updated)
import { Link } from "react-router-dom";
import { memo, useState } from "react";

const SidebarItem = memo(({ route, isActive, themeColors, onClose, isCollapsed }) => {
  return (
    <Link
      to={route.path}
      className={`flex items-center rounded-md transition-all duration-300 ${
        isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
      }`}
      style={{
        color: themeColors.text,
        backgroundColor: isActive 
          ? themeColors.active.background 
          : "transparent",
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = themeColors.hover.background;
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = isActive 
          ? themeColors.active.background 
          : "transparent";
      }}
      onClick={onClose}
      aria-current={isActive ? "page" : undefined}
      title={isCollapsed ? route.name : undefined}
    >
      <span className={`text-lg transition-all duration-300 ${isCollapsed ? '' : 'mr-3'}`} aria-hidden="true">
        {route.icon}
      </span>
      {!isCollapsed && (
        <span className="font-medium truncate transition-opacity duration-300 opacity-100">
          {route.name}
        </span>
      )}
    </Link>
  );
});

const DesktopSidebar = ({ 
  isCollapsed,
  onToggleCollapse,
  routes, 
  currentPath, 
  user, 
  logout, 
  themeColors 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (isCollapsed && onToggleCollapse) {
      onToggleCollapse(false);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isCollapsed && onToggleCollapse) {
      onToggleCollapse(true);
    }
  };

  // Show loading if no routes
  if (!routes || routes.length === 0) {
    return (
      <div
        className="hidden lg:flex flex-col border-r w-16 h-screen"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        }}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-xs rotate-90 whitespace-nowrap" style={{ color: themeColors.text }}>
            No menu items
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`hidden lg:flex flex-col border-r transition-all duration-300 ease-in-out h-screen ${
        isCollapsed ? 'w-16' : 'w-68'
      }`}
      style={{
        backgroundColor: themeColors.surface,
        borderColor: themeColors.border,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Fixed Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b shrink-0" style={{borderColor: themeColors.border}}>
        {!isCollapsed ? (
          <h1 
            className="text-xl font-bold transition-all duration-300 opacity-100"
            style={{color: themeColors.primary}}
          >
            HRMS Panel
          </h1>
        ) : (
          <div className="w-6 h-6"></div>
        )}
        <button
          onClick={() => onToggleCollapse(!isCollapsed)}
          className="p-2 rounded-md hover:scale-110 transition-all duration-200"
          style={{
            color: themeColors.text,
            backgroundColor: themeColors.background
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className={`transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
            ←
          </span>
        </button>
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1" aria-label="Main navigation">
          {routes.map((route) => (
            <SidebarItem
              key={route.path}
              route={route}
              isActive={currentPath === route.path}
              themeColors={themeColors}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>

      {/* Fixed Bottom Section */}
      <div className="shrink-0 border-t" style={{borderColor: themeColors.border}}>
        {/* User Info */}
        <div className="p-3">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
              style={{backgroundColor: themeColors.primary, color: "#fff"}}
              aria-hidden="true"
            >
              {user?.name?.charAt(0) || "U"}
            </div>
            {!isCollapsed && (
              <div className="ml-3 min-w-0 flex-1 transition-all duration-300 opacity-100">
                <p className="font-medium truncate" style={{color: themeColors.text}}>
                  {user?.name || "User"}
                </p>
                <p className="text-sm truncate" style={{color: themeColors.text}}>
                  {user?.role || "Employee"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-3 pt-0">
          <button
            onClick={logout}
            className={`w-full text-center transition-all duration-300 rounded-md ${
              isCollapsed ? 'py-3 px-3' : 'py-2 px-4'
            }`}
            style={{
              color: themeColors.danger,
              border: `1px solid ${themeColors.danger}`,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = themeColors.danger;
              e.target.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = themeColors.danger;
            }}
            aria-label={isCollapsed ? "Sign out" : undefined}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            {isCollapsed ? (
              <span className="text-lg transition-all duration-300">🚪</span>
            ) : (
              <span className="transition-all duration-300">Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(DesktopSidebar);