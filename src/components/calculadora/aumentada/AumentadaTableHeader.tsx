import React from 'react';

interface AumentadaTableHeaderProps {
  isDarkMode: boolean;
}

export function AumentadaTableHeader({ isDarkMode }: AumentadaTableHeaderProps) {
  // Hide on desktop, only show on mobile
  return (
    <div className={`sm:hidden grid grid-cols-12 gap-1 mb-2 px-2 py-2 rounded-t-lg ${isDarkMode ? 'bg-dark-900' : 'bg-gray-100'} h-10`}>
      <div className="col-span-1 text-[10px] font-medium flex items-center h-full"></div>
      <div className="col-span-2 text-[10px] font-medium flex items-center h-full">Odds</div>
      <div className="col-span-2 text-[10px] font-medium flex items-center h-full">%</div>
      <div className="col-span-4 text-[10px] font-medium flex items-center h-full">Invest.</div>
      <div className="col-span-3"></div>
    </div>
  );
}