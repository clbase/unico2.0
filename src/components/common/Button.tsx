import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: LucideIcon;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  icon: Icon,
  loading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'flex items-center justify-center gap-2 px-4 py-2 rounded font-medium transition-colors';
  
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-dark-700 dark:text-gray-200 dark:hover:bg-dark-600',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      {children}
    </button>
  );
};