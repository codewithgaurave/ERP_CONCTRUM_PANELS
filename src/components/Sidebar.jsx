// src/components/Sidebar.jsx (Combined Mobile + Desktop)
import { Link } from "react-router-dom";
import { memo, useState, useEffect, useRef } from "react";

const SidebarItem = memo(({ route, isActive, themeColors, onClose, isCollapsed, isMobile }) => {
  return (
    <Link
      to={route.path}
      className={`flex items-center rounded-md transition-all duration-300 ${
        isCollapsed && !isMobile ? 'px-3 py-3 justify-center' : 'px-4 py-3'
      } ${isMobile ? 'mx-2' : ''}`}
      style={{
        color: themeColors.text,
        backgroundColor: isActive 
          ? themeColors.active.background 
          : "transparent",
      }}
      onMouseEnter={(e) => {
        if (!isMobile) {
          e.target.style.backgroundColor = themeColors.hover.background;
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          e.target.style.backgroundColor = isActive 
            ? themeColors.active.background 
            : "transparent";
        }
      }}
      onClick={isMobile ? onClose : undefined}
      aria-current={isActive ? "page" : undefined}
      title={isCollapsed && !isMobile ? route.name : undefined}
    >
      <span className={`text-lg transition-all duration-300 ${isCollapsed && !isMobile ? '' : 'mr-3'}`} aria-hidden="true">
        {route.icon}
      </span>
      {(!isCollapsed || isMobile) && (
        <span className="font-medium truncate transition-opacity duration-300 opacity-100">
          {route.name}
        </span>
      )}
    </Link>
  );
});

const MobileOverlay = memo(({ isOpen, onClose, themeColors }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300"
      onClick={onClose}
      aria-hidden="true"
    />
  );
});

const Sidebar = ({ 
  // Mobile props
  isOpen = false,
  onClose,
  // Desktop props  
  isCollapsed = false,
  onToggleCollapse,
  // Common props
  routes, 
  currentPath, 
  user, 
  logout, 
  themeColors 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef(null);
  const isMobile = typeof isOpen === 'boolean' && onClose;

  // Handle desktop hover behavior
  const handleMouseEnter = () => {
    if (isMobile) return;
    setIsHovered(true);
    if (isCollapsed && onToggleCollapse) {
      onToggleCollapse(false);
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsHovered(false);
    if (!isCollapsed && onToggleCollapse) {
      onToggleCollapse(true);
    }
  };

  // Close sidebar on escape key (mobile)
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobile, isOpen, onClose]);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen, onClose]);

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <MobileOverlay isOpen={isOpen} onClose={onClose} themeColors={themeColors} />
        
        <div
          ref={sidebarRef}
          className={`fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out h-screen w-64 md:w-72 lg:hidden ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            backgroundColor: themeColors.surface,
            borderColor: themeColors.border,
          }}
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b shrink-0" style={{borderColor: themeColors.border}}>
            <h1 
              className="text-xl font-bold"
              style={{color: themeColors.primary}}
            >
              HRMS Panel
            </h1>
            
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:scale-110 transition-all duration-200"
              style={{
                color: themeColors.text,
                backgroundColor: themeColors.background
              }}
              aria-label="Close sidebar"
            >
              <span className="text-xl">×</span>
            </button>
          </div>

          {/* Scrollable Navigation Area */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1" aria-label="Main navigation">
              {routes.map((route) => (
                <SidebarItem
                  key={route.path}
                  route={route}
                  isActive={currentPath === route.path}
                  themeColors={themeColors}
                  isCollapsed={false}
                  isMobile={true}
                  onClose={onClose}
                />
              ))}
            </nav>
          </div>

          {/* Fixed Bottom Section */}
          <div className="shrink-0 border-t" style={{borderColor: themeColors.border}}>
            {/* User Info */}
            <div className="p-3">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{backgroundColor: themeColors.primary, color: "#fff"}}
                  aria-hidden="true"
                >
                  {user?.name?.charAt(0) || "U"}
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="font-medium truncate" style={{color: themeColors.text}}>
                    {user?.name || "User"}
                  </p>
                  <p className="text-sm truncate" style={{color: themeColors.text}}>
                    {user?.role || "Employee"}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className="p-3 pt-0">
              <button
                onClick={logout}
                className="w-full py-2 px-4 text-center rounded-md transition-all duration-300"
                style={{
                  color: themeColors.danger,
                  border: `1px solid ${themeColors.danger}`,
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop sidebar
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
              isMobile={false}
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

export default memo(Sidebar);