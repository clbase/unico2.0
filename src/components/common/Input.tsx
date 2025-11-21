import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        className={`w-full rounded-md shadow-sm ${
          Icon ? 'pl-10' : 'pl-3'
        } pr-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent ${
          error ? 'border-red-300 dark:border-red-700' : ''
        } ${className}`}
        {...props}
      />
    </div>
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
    )}
  </div>
);