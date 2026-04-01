import { createContext, useContext, useEffect, useState } from "react";

// 🎨 Enhanced Color Palettes with better contrast and accessibility
const colorPalettes = {
  professional: {
    primary: "#2563eb",
    primaryLight: "#3b82f6",
    primaryDark: "#1d4ed8",
    accent: "#f59e0b",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#06b6d4",
    
    // Light theme colors
    backgroundLight: "#ffffff",
    surfaceLight: "#f8fafc",
    cardLight: "#ffffff",
    textLight: "#1e293b",
    textSecondaryLight: "#64748b",
    borderLight: "#e2e8f0",
    hoverLight: "#f1f5f9",
    activeLight: "#e2e8f0",
    
    // Dark theme colors
    backgroundDark: "#0f172a",
    surfaceDark: "#1e293b",
    cardDark: "#334155",
    textDark: "#f1f5f9",
    textSecondaryDark: "#94a3b8",
    borderDark: "#475569",
    hoverDark: "#475569",
    activeDark: "#64748b",
  },
  
  modern: {
    primary: "#7c3aed",
    primaryLight: "#8b5cf6",
    primaryDark: "#6d28d9",
    accent: "#06b6d4",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#3b82f6",
    
    backgroundLight: "#ffffff",
    surfaceLight: "#fafafa",
    cardLight: "#ffffff",
    textLight: "#18181b",
    textSecondaryLight: "#71717a",
    borderLight: "#e4e4e7",
    hoverLight: "#f4f4f5",
    activeLight: "#e4e4e7",
    
    backgroundDark: "#09090b",
    surfaceDark: "#18181b",
    cardDark: "#27272a",
    textDark: "#fafafa",
    textSecondaryDark: "#a1a1aa",
    borderDark: "#3f3f46",
    hoverDark: "#3f3f46",
    activeDark: "#52525b",
  },
  
  tech: {
    primary: "#059669",
    primaryLight: "#10b981",
    primaryDark: "#047857",
    accent: "#f97316",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#dc2626",
    info: "#0891b2",
    
    backgroundLight: "#ffffff",
    surfaceLight: "#f0fdf4",
    cardLight: "#ffffff",
    textLight: "#14532d",
    textSecondaryLight: "#166534",
    borderLight: "#bbf7d0",
    hoverLight: "#dcfce7",
    activeLight: "#bbf7d0",
    
    backgroundDark: "#0c1e0f",
    surfaceDark: "#1a2e1a",
    cardDark: "#22543d",
    textDark: "#dcfce7",
    textSecondaryDark: "#86efac",
    borderDark: "#166534",
    hoverDark: "#15803d",
    activeDark: "#166534",
  },
  
  elegant: {
    primary: "#4f46e5",
    primaryLight: "#6366f1",
    primaryDark: "#4338ca",
    accent: "#ec4899",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#06b6d4",
    
    backgroundLight: "#ffffff",
    surfaceLight: "#f9fafb",
    cardLight: "#ffffff",
    textLight: "#111827",
    textSecondaryLight: "#6b7280",
    borderLight: "#d1d5db",
    hoverLight: "#f3f4f6",
    activeLight: "#e5e7eb",
    
    backgroundDark: "#111827",
    surfaceDark: "#1f2937",
    cardDark: "#374151",
    textDark: "#f9fafb",
    textSecondaryDark: "#d1d5db",
    borderDark: "#4b5563",
    hoverDark: "#4b5563",
    activeDark: "#6b7280",
  },
  
  warm: {
    primary: "#ea580c",
    primaryLight: "#f97316",
    primaryDark: "#c2410c",
    accent: "#0891b2",
    success: "#16a34a",
    warning: "#d97706",
    danger: "#dc2626",
    info: "#0284c7",
    
    backgroundLight: "#ffffff",
    surfaceLight: "#fffbeb",
    cardLight: "#ffffff",
    textLight: "#1c1917",
    textSecondaryLight: "#78716c",
    borderLight: "#e7e5e4",
    hoverLight: "#fef3c7",
    activeLight: "#fed7aa",
    
    backgroundDark: "#1c1917",
    surfaceDark: "#292524",
    cardDark: "#44403c",
    textDark: "#fafaf9",
    textSecondaryDark: "#d6d3d1",
    borderDark: "#57534e",
    hoverDark: "#57534e",
    activeDark: "#78716c",
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("hrms-theme") || "light";
    return savedTheme;
  };

  const getInitialPalette = () => {
    const savedPalette = localStorage.getItem("hrms-palette") || "professional";
    return savedPalette;
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [palette, setPalette] = useState(getInitialPalette);

  // 🎨 Get current palette colors
  const currentPalette = colorPalettes[palette] || colorPalettes.professional;

  // 🌈 Create theme colors object
  const createThemeColors = () => {
    const isLight = theme === "light";
    
    return {
      // Base colors (same for both themes)
      primary: currentPalette.primary,
      primaryLight: currentPalette.primaryLight,
      primaryDark: currentPalette.primaryDark,
      accent: currentPalette.accent,
      success: currentPalette.success,
      warning: currentPalette.warning,
      danger: currentPalette.danger,
      info: currentPalette.info,
      
      // Theme-specific colors
      background: isLight ? currentPalette.backgroundLight : currentPalette.backgroundDark,
      surface: isLight ? currentPalette.surfaceLight : currentPalette.surfaceDark,
      card: isLight ? currentPalette.cardLight : currentPalette.cardDark,
      text: isLight ? currentPalette.textLight : currentPalette.textDark,
      textSecondary: isLight ? currentPalette.textSecondaryLight : currentPalette.textSecondaryDark,
      border: isLight ? currentPalette.borderLight : currentPalette.borderDark,
      hover: isLight ? currentPalette.hoverLight : currentPalette.hoverDark,
      active: isLight ? currentPalette.activeLight : currentPalette.activeDark,
      
      // Utility colors with opacity
      primaryWithOpacity: (opacity = 0.1) => `${currentPalette.primary}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
      successWithOpacity: (opacity = 0.1) => `${currentPalette.success}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
      warningWithOpacity: (opacity = 0.1) => `${currentPalette.warning}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
      dangerWithOpacity: (opacity = 0.1) => `${currentPalette.danger}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
      
      // CSS custom properties for dynamic styling
      cssVars: {
        '--color-primary': currentPalette.primary,
        '--color-accent': currentPalette.accent,
        '--color-success': currentPalette.success,
        '--color-warning': currentPalette.warning,
        '--color-danger': currentPalette.danger,
        '--color-background': isLight ? currentPalette.backgroundLight : currentPalette.backgroundDark,
        '--color-surface': isLight ? currentPalette.surfaceLight : currentPalette.surfaceDark,
        '--color-text': isLight ? currentPalette.textLight : currentPalette.textDark,
        '--color-border': isLight ? currentPalette.borderLight : currentPalette.borderDark,
      }
    };
  };

  const themeColors = createThemeColors();

  useEffect(() => {
    const html = document.documentElement;
    
    // Set theme class
    if (theme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.add("light");
      html.classList.remove("dark");
    }
    
    // Set CSS custom properties
    Object.entries(themeColors.cssVars).forEach(([property, value]) => {
      html.style.setProperty(property, value);
    });
    
    // Set data attributes
    html.setAttribute("data-theme", theme);
    html.setAttribute("data-palette", palette);
    
    // Save to localStorage
    localStorage.setItem("hrms-theme", theme);
    localStorage.setItem("hrms-palette", palette);
  }, [theme, palette, themeColors.cssVars]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const changePalette = (newPalette) => {
    if (colorPalettes[newPalette]) {
      setPalette(newPalette);
    }
  };

  const resetToDefault = () => {
    setTheme("light");
    setPalette("professional");
  };

  // 📊 Get palette info
  const getPaletteInfo = () => {
    const paletteNames = {
      professional: "Professional Blue",
      modern: "Modern Purple",
      tech: "Tech Green",
      elegant: "Elegant Indigo",
      warm: "Warm Orange"
    };
    
    return {
      name: paletteNames[palette] || palette,
      key: palette,
      colors: currentPalette
    };
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        palette,
        themeColors,
        toggleTheme,
        changePalette,
        resetToDefault,
        getPaletteInfo,
        availablePalettes: Object.keys(colorPalettes),
        isDark: theme === "dark",
        isLight: theme === "light"
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};