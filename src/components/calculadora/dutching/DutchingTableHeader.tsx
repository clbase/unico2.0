import React from 'react';

interface DutchingTableHeaderProps {
  isDarkMode: boolean;
}

export function DutchingTableHeader({ isDarkMode }: DutchingTableHeaderProps) {
  return (
    <div className={`grid grid-cols-12 gap-1 sm:gap-4 mb-2 px-2 sm:px-4 py-3 sm:py-4 rounded-t-lg ${isDarkMode ? 'bg-dark-900' : 'bg-gray-100'} h-12 sm:h-14`}>
      <div className="col-span-1 text-xs sm:text-base font-medium flex items-center h-full"></div>
      <div className="col-span-3 sm:col-span-2 text-xs sm:text-base font-medium flex items-center h-full">Odds</div>
      <div className="col-span-4 text-xs sm:text-base font-medium flex items-center h-full">Investimento</div>
      <div className="col-span-2 sm:col-span-3 text-xs sm:text-base font-medium flex items-center h-full">Retorno</div>
      <div className="col-span-2"></div>
    </div>
  );
}