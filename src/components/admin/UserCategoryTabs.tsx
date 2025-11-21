import React from 'react';
import { Shield, Crown, FileSpreadsheet } from 'lucide-react';

interface UserCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  userCounts: {
    administradores: number;
    membros_vip: number;
    assinatura_planilha: number;
  };
}

export const UserCategoryTabs: React.FC<UserCategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
  userCounts
}) => {
  const categories = [
    {
      id: 'administradores',
      label: 'Administradores',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-500',
      count: userCounts.administradores
    },
    {
      id: 'membros_vip',
      label: 'Membros VIP',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-500',
      count: userCounts.membros_vip
    },
    {
      id: 'assinatura_planilha',
      label: 'Assinatura Planilha',
      icon: FileSpreadsheet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      borderColor: 'border-blue-500',
      count: userCounts.assinatura_planilha
    }
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="-mb-px flex space-x-8">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isActive = activeCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-[#7200C9] text-[#7200C9]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {category.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                isActive 
                  ? 'bg-[#7200C9]/20 text-[#7200C9]' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {category.count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};