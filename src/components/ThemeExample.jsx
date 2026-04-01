import React from 'react';
import { useTheme } from '../context/ThemeContext';

// Example component showing how to use theme colors properly
const ThemeExample = () => {
  const { themeColors, toggleTheme, changePalette, availablePalettes, theme, palette } = useTheme();

  return (
    <div 
      style={{ 
        backgroundColor: themeColors.background,
        color: themeColors.text,
        minHeight: '100vh',
        padding: '20px'
      }}
    >
      <div 
        style={{
          backgroundColor: themeColors.card,
          border: `1px solid ${themeColors.border}`,
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}
      >
        <h2 style={{ color: themeColors.primary }}>Theme Controls</h2>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            backgroundColor: themeColors.primary,
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>

        {/* Palette Selector */}
        <select
          value={palette}
          onChange={(e) => changePalette(e.target.value)}
          style={{
            backgroundColor: themeColors.surface,
            color: themeColors.text,
            border: `1px solid ${themeColors.border}`,
            padding: '10px',
            borderRadius: '6px'
          }}
        >
          {availablePalettes.map(p => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Color Showcase */}
      <div 
        style={{
          backgroundColor: themeColors.card,
          border: `1px solid ${themeColors.border}`,
          borderRadius: '8px',
          padding: '20px'
        }}
      >
        <h3 style={{ color: themeColors.text }}>Color Showcase</h3>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            backgroundColor: themeColors.primary,
            color: 'white',
            padding: '10px',
            borderRadius: '4px'
          }}>
            Primary
          </div>
          
          <div style={{
            backgroundColor: themeColors.success,
            color: 'white',
            padding: '10px',
            borderRadius: '4px'
          }}>
            Success
          </div>
          
          <div style={{
            backgroundColor: themeColors.warning,
            color: 'white',
            padding: '10px',
            borderRadius: '4px'
          }}>
            Warning
          </div>
          
          <div style={{
            backgroundColor: themeColors.danger,
            color: 'white',
            padding: '10px',
            borderRadius: '4px'
          }}>
            Danger
          </div>
          
          <div style={{
            backgroundColor: themeColors.info,
            color: 'white',
            padding: '10px',
            borderRadius: '4px'
          }}>
            Info
          </div>
        </div>

        {/* Interactive Elements */}
        <div style={{ marginTop: '20px' }}>
          <button
            style={{
              backgroundColor: themeColors.surface,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`,
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = themeColors.hover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = themeColors.surface;
            }}
          >
            Hover Me
          </button>

          <div 
            style={{
              backgroundColor: themeColors.primaryWithOpacity(0.1),
              border: `1px solid ${themeColors.primary}`,
              color: themeColors.primary,
              padding: '10px',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Primary with Opacity
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeExample;