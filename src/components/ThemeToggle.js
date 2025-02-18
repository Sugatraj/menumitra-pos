import React from 'react';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center px-1 py-1 rounded-full w-14 h-7 transition-colors duration-300 focus:outline-none"
      style={{
        backgroundColor: isDarkMode ? '#3B82F6' : '#E5E7EB'
      }}
    >
      {/* Sun and Moon Icons */}
      <span className="absolute left-1 text-xs text-yellow-400">☀️</span>
      <span className="absolute right-1 text-xs">🌙</span>

      {/* Toggle Circle */}
      <span
        className={`absolute block w-5 h-5 rounded-full transition-transform duration-300 transform bg-white
          ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}
      />

      {/* Screen Reader Text */}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

export default ThemeToggle; 