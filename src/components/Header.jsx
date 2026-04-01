// src/components/Header.jsx (Updated)
import { memo, useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { User2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SettingsModal = ({
  isOpen,
  onClose,
  themeColors,
  currentFont,
  corporateFonts,
  changeFont,
  palette,
  changePalette,
  toggleTheme,
  availablePalettes
}) => {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
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

  // Palette display names and icons
  const paletteInfo = {
    professional: { label: "Professional", icon: "💼", desc: "Clean & formal" },
    modern: { label: "Modern", icon: "✨", desc: "Fresh & vibrant" },
    tech: { label: "Tech", icon: "💻", desc: "Dark & sleek" },
    elegant: { label: "Elegant", icon: "🌸", desc: "Soft & refined" },
    warm: { label: "Warm", icon: "🔥", desc: "Cozy & inviting" }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{
        backgroundColor: themeColors.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-auto p-4 rounded-xl shadow-2xl border max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
          boxShadow: `0 10px 25px -5px ${themeColors.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)'}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 px-2 py-1 rounded-lg hover:rotate-90 transition-all duration-300 border"
          style={{
            color: themeColors.textSecondary,
            backgroundColor: themeColors.background,
            borderColor: themeColors.mode === 'light' ? themeColors.primary : themeColors.border,
          }}
          aria-label="Close settings"
        >
          <span className="text-base font-bold">✕</span>
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⚙️</span>
            <h3
              className="text-lg font-semibold"
              style={{ color: themeColors.text }}
            >
              Settings
            </h3>
          </div>
          <p
            className="text-xs"
            style={{ color: themeColors.textSecondary }}
          >
            Customize your workspace
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Theme Section */}
          <div>
            <label
              className="flex items-center gap-2 text-xs font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              <span className="text-base">🎨</span>
              Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border transition-all duration-200 ${themeColors.mode === 'light' ? 'ring-1' : ''
                  }`}
                style={{
                  backgroundColor: themeColors.mode === 'light' ? themeColors.primary : themeColors.background,
                  borderColor: themeColors.mode === 'light' ? themeColors.primary : themeColors.border,
                  color: themeColors.mode === 'light' ? themeColors.onPrimary : themeColors.text,
                  ringColor: themeColors.primary,
                }}
              >
                <span className="text-base">☀️</span>
                <span className="text-xs font-medium">Light</span>
              </button>
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border transition-all duration-200 ${themeColors.mode === 'dark' ? 'ring-1' : ''
                  }`}
                style={{
                  backgroundColor: themeColors.mode === 'dark' ? themeColors.primary : themeColors.background,
                  borderColor: themeColors.mode === 'dark' ? themeColors.primary : themeColors.border,
                  color: themeColors.mode === 'dark' ? themeColors.onPrimary : themeColors.text,
                  ringColor: themeColors.primary,
                }}
              >
                <span className="text-base">🌙</span>
                <span className="text-xs font-medium">Dark</span>
              </button>
            </div>
          </div>

          {/* Font Section */}
          <div>
            <label
              className="flex items-center gap-2 text-xs font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              <span className="text-base">📝</span>
              Font
            </label>
            <div className="relative">
              <select
                value={currentFont.key}
                onChange={(e) => changeFont(e.target.value)}
                className="w-full p-2 rounded-lg border focus:outline-none focus:ring-1 transition-all duration-200 text-xs appearance-none cursor-pointer"
                style={{
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                  borderColor: themeColors.border,
                }}
              >
                {Object.values(corporateFonts).map((font) => (
                  <option
                    key={font.key}
                    value={font.key}
                    style={{
                      backgroundColor: themeColors.background,
                      color: themeColors.text
                    }}
                  >
                    {font.label}
                  </option>
                ))}
              </select>
              <div
                className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
                style={{ color: themeColors.textSecondary }}
              >
                <span className="text-xs">▼</span>
              </div>
            </div>
          </div>

          {/* Color Palette Section */}
          <div>
            <label
              className="flex items-center gap-2 text-xs font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              <span className="text-base">🎨</span>
              Color Scheme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {availablePalettes.map((paletteKey) => (
                <button
                  key={paletteKey}
                  onClick={() => changePalette(paletteKey)}
                  className={`flex flex-col items-center p-2 rounded-lg border transition-all duration-200 group ${palette === paletteKey ? 'ring-1' : ''
                    }`}
                  style={{
                    backgroundColor: palette === paletteKey ? themeColors.primary : themeColors.background,
                    borderColor: palette === paletteKey ? themeColors.primary : themeColors.border,
                    color: palette === paletteKey ? themeColors.onPrimary : themeColors.text,
                    ringColor: themeColors.primary,
                  }}
                  title={paletteInfo[paletteKey]?.label || paletteKey}
                >
                  <span className="text-base mb-1 group-hover:scale-110 transition-transform duration-200">
                    {paletteInfo[paletteKey]?.icon || "🎨"}
                  </span>
                  <span className="text-xs truncate w-full">
                    {paletteInfo[paletteKey]?.label || paletteKey}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t" style={{ borderColor: themeColors.border }}>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 p-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80 border"
              style={{
                backgroundColor: themeColors.background,
                color: themeColors.text,
                borderColor: themeColors.border
              }}
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="flex-1 p-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: themeColors.primary,
                color: themeColors.onPrimary,
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = memo(({
  toggleSidebar,
  currentPageTitle,
  currentFont,
  corporateFonts,
  changeFont,
  palette,
  changePalette,
  toggleTheme
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { themeColors, availablePalettes } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleMyProfileClick = () => {
    navigate(`/employee-profile/${user.id}`);
  };

  return (
    <>
      <header
        className="h-16 flex items-center justify-between px-4 border-b backdrop-blur-sm sticky top-0 z-40"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        }}
      >
        <div className="flex items-center min-w-0 flex-1">
          {/* Sidebar Toggle - Only show on Mobile & Tablet (lg:hidden) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden mr-3 p-1.5 rounded-md hover:scale-110 transition-all duration-200"
            style={{
              color: themeColors.text,
              backgroundColor: themeColors.background
            }}
            aria-label="Open sidebar"
          >
            <span className="text-base">☰</span>
          </button>
          <h2
            className="text-sm font-semibold truncate"
            style={{
              color: themeColors.text,
              fontFamily: currentFont.family
            }}
          >
            {currentPageTitle}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg border hover:scale-105 transition-all duration-200 group"
            style={{
              backgroundColor: themeColors.background,
              color: themeColors.textSecondary,
              borderColor: themeColors.border,
            }}
            aria-label="Open settings"
            title="Settings"
          >
            <span className="text-sm group-hover:rotate-90 transition-transform duration-300">⚙️</span>
          </button>

          {/* Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border hover:scale-105 transition-all duration-200 group"
            style={{
              backgroundColor: themeColors.background,
              color: themeColors.textSecondary,
              borderColor: themeColors.border,
            }}
            aria-label="Quick theme toggle"
            title={`Switch to ${themeColors.mode === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <span className="text-sm group-hover:rotate-180 transition-transform duration-300">
              {themeColors.mode === "dark" ? "☀️" : "🌙"}
            </span>
          </button>

          {/* User Profile */}
          <button
            onClick={handleMyProfileClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:scale-105 transition-all duration-200 group"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
            title="View Profile"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm group-hover:scale-110 transition-transform duration-200"
              style={{
                backgroundColor: themeColors.primary,
                boxShadow: `0 2px 8px ${themeColors.primary}40`
              }}
            >
              {user?.name?.first?.charAt(0)?.toUpperCase() || <User2 size={16} />}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium" style={{ color: themeColors.text }}>
                {user?.name?.first} {user?.name?.last}
              </div>
              <div className="text-xs" style={{ color: themeColors.textSecondary }}>
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themeColors={themeColors}
        currentFont={currentFont}
        corporateFonts={corporateFonts}
        changeFont={changeFont}
        palette={palette}
        changePalette={changePalette}
        toggleTheme={toggleTheme}
        availablePalettes={availablePalettes}
      />
    </>
  );
});

Header.displayName = 'Header';
export default Header;