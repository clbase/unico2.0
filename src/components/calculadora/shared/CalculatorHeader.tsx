import React from 'react';
import { Calculator } from 'lucide-react';
import { CalculatorType } from '../types';

interface CalculatorHeaderProps {
  activeTab: CalculatorType;
  setActiveTab: (tab: CalculatorType) => void;
  isDarkMode: boolean;
}

export function CalculatorHeader({ activeTab, setActiveTab, isDarkMode }: CalculatorHeaderProps) {
  return (
    <>
      <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-8">
        <Calculator className="w-6 h-6 sm:w-10 sm:h-10 text-blue-500" />
        <h1 className="text-xl sm:text-3xl font-bold">Calculadora de Dutching</h1>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('dutching')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'dutching'
              ? isDarkMode
                ? 'bg-blue-500 text-white'
                : 'bg-blue-600 text-white'
              : isDarkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Dutching
        </button>
        <button
          onClick={() => setActiveTab('limitation')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'limitation'
              ? isDarkMode
                ? 'bg-blue-500 text-white'
                : 'bg-blue-600 text-white'
              : isDarkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Limitação
        </button>
        <button
          onClick={() => setActiveTab('aumentada')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'aumentada'
              ? isDarkMode
                ? 'bg-blue-500 text-white'
                : 'bg-blue-600 text-white'
              : isDarkMode
                ? 'text-gray-400 hover:text-gray-200'
                : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Aumentada
        </button>
      </div>
    </>
  );
}