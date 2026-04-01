// src/components/MobileSidebar.jsx (Updated)
import { Link } from "react-router-dom";
import { memo, useEffect, useRef } from "react";

const MobileSidebarItem = memo(({ route, isActive, themeColors, onClose }) => {
  return (
    <Link
      to={route.path}
      className="flex items-center px-4 py-3 mx-2 rounded-md transition-all duration-300"
      style={{
        color: themeColors.text,
        backgroundColor: isActive 
          ? themeColors.active.background 
          : "transparent",
      }}
      onClick={onClose}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="text-lg mr-3" aria-hidden="true">
        {route.icon}
      </span>
      <span className="font-medium truncate">
        {route.name}
      </span>
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

const MobileSidebar = ({ 
  isOpen,
  onClose,
  routes, 
  currentPath, 
  user, 
  logout, 
  themeColors 
}) => {
  const sidebarRef = useRef(null);

  // Close sidebar on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Close sidebar when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Show loading if no routes
  if (!routes || routes.length === 0) {
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
          <div className="flex items-center justify-center h-full">
            <p style={{ color: themeColors.text }}>No menu items available</p>
          </div>
        </div>
      </>
    );
  }

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
              <MobileSidebarItem
                key={route.path}
                route={route}
                isActive={currentPath === route.path}
                themeColors={themeColors}
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
};

export default memo(MobileSidebar);