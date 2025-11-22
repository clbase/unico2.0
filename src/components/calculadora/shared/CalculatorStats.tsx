import React from 'react';

interface CalculatorStatsProps {
  profit: number;
  totalReturn: number;
  totalInvestment: number;
  hideResults?: boolean; // <-- NOVA PROP
}

export function CalculatorStats({ profit, totalReturn, totalInvestment, hideResults }: CalculatorStatsProps) {
  
  const calculateROI = () => {
    if (totalInvestment <= 0 || profit === 0) return 0;
    if (profit > 0 && totalInvestment === 0) return Infinity; 
    return ((profit / totalInvestment) * 100);
  };

  const roi = calculateROI();
  const displayProfit = (totalReturn === 0 && profit === 0) ? 0 : profit;
  const displayReturn = totalReturn;

  return (
    <div className="space-y-1 sm:space-y-3">
      {/* ROI sempre aparece (pode ser 0) */}
      <div className="flex justify-between items-center">
        <span className="text-xs sm:text-base font-medium">ROI:</span>
        <span 
          className={`text-base sm:text-xl font-semibold ${
            hideResults ? 'text-gray-500' : (displayProfit < 0 ? 'text-red-500' : 'text-green-500')
          }`}
          translate="no" // <-- CORREÇÃO 1: Protege o ROI
        >
          {hideResults ? '-' : (isFinite(roi) ? `${roi.toFixed(2)}%` : '∞')}
        </span>
      </div>

      {/* Se hideResults for true, não mostra Lucro e Retorno, ou mostra traço */}
      <div className="flex justify-between items-center">
        <span className="text-xs sm:text-base font-medium">Lucro:</span>
        <span 
          className={`text-base sm:text-xl font-semibold ${
            hideResults ? 'text-gray-500' : (displayProfit < 0 ? 'text-red-500' : 'text-green-500')
          }`}
          translate="no" // <-- CORREÇÃO 2: Protege o Lucro
        >
          {hideResults ? '-' : `R$ ${displayProfit.toFixed(2)}`}
        </span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-xs sm:text-base font-medium">Retorno:</span>
        <span 
          className={`text-base sm:text-xl font-semibold ${
            hideResults ? 'text-gray-500' : 'text-blue-500'
          }`}
          translate="no" // <-- CORREÇÃO 3: Protege o Retorno
        >
          {hideResults ? '-' : `R$ ${displayReturn.toFixed(2)}`}
        </span>
      </div>
    </div>
  );
}