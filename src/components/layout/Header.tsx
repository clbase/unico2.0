import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks';

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="p-4 flex items-center justify-between border-b dark:border-dark-700">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">
        Vivendo de Surebet
      </h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
        aria-label={isDark ? 'Modo claro' : 'Modo escuro'}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-gray-200" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>
    </header>
  );
};