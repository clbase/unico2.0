import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Calculator,
  Table,
  Shield,
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  isActive,
  onClick,
}) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700 ${
      isActive ? 'bg-blue-50 dark:bg-dark-700 border-r-4 border-blue-500' : ''
    }`}
    onClick={onClick}
  >
    {icon}
    {label}
  </Link>
);

export const Sidebar: React.FC<{
  isAdmin: boolean;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}> = ({ isAdmin, isMobileMenuOpen, onCloseMobileMenu }) => {
  const location = useLocation();

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <NavItem
        to="/"
        icon={<LayoutDashboard className="w-5 h-5 mr-3" />}
        label="Dashboard"
        isActive={isActivePath('/')}
        onClick={onCloseMobileMenu}
      />
      <NavItem
        to="/new-bet"
        icon={<PlusCircle className="w-5 h-5 mr-3" />}
        label="Adicionar Aposta"
        isActive={isActivePath('/new-bet')}
        onClick={onCloseMobileMenu}
      />
      <NavItem
        to="/bets"
        icon={<Table className="w-5 h-5 mr-3" />}
        label="Planilha"
        isActive={isActivePath('/bets')}
        onClick={onCloseMobileMenu}
      />
      <a
        href="https://vivendodesure.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-700"
        onClick={onCloseMobileMenu}
      >
        <Calculator className="w-5 h-5 mr-3" />
        Calculadora
      </a>
      {isAdmin && (
        <NavItem
          to="/admin"
          icon={<Shield className="w-5 h-5 mr-3" />}
          label="Administração"
          isActive={isActivePath('/admin')}
          onClick={onCloseMobileMenu}
        />
      )}
    </nav>
  );
};