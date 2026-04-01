// src/pages/Leave.jsx
import { useTheme } from "../context/ThemeContext";

const Leave = () => {
  const { themeColors } = useTheme();

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: themeColors.text }}>
          Leave Management
        </h1>
        <div 
          className="p-6 rounded-lg"
          style={{
            backgroundColor: themeColors.surface,
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <p style={{ color: themeColors.text }}>Leave management content will go here.</p>
        </div>
      </div>
    </>
  );
};

export default Leave;