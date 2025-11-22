import React from 'react';

interface MobileAumentadaTableHeaderProps {
  isDarkMode: boolean;
}

export function MobileAumentadaTableHeader({ isDarkMode }: MobileAumentadaTableHeaderProps) {
  return (
    <div className={`sm:hidden grid grid-cols-12 gap-1 mb-2 px-2 py-2 rounded-t-lg ${isDarkMode ? 'bg-dark-900' : 'bg-gray-100'} h-10 items-center`}>
      <div className="col-span-1 text-[10px] font-medium flex items-center h-full"></div>
      <div className="col-span-3 text-[10px] font-medium flex items-center h-full">Odds</div>
      <div className="col-span-2 text-[10px] font-medium flex items-center h-full">Aum%</div>
      <div className="col-span-5 text-[10px] font-medium flex items-center h-full">Investimento</div>
      <div className="col-span-1 text-[10px] font-medium flex items-center h-full"></div>
    </div>
  );
}