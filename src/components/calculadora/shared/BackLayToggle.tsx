import React from 'react';
import { RefreshCw } from 'lucide-react'; // Ícone de "troca"

interface BackLayToggleProps {
  betMode: 'back' | 'lay';
  onToggle: () => void;
  isDarkMode: boolean;
}

export function BackLayToggle({ betMode, onToggle, isDarkMode }: BackLayToggleProps) {
  const isBack = betMode === 'back';

  // Define as cores com base no modo (Back = Azul, Lay = Rosa/Vermelho)
  const stateStyles = isBack
    ? (isDarkMode ? 'bg-blue-800 shadow-inner' : 'bg-blue-200 shadow-inner')
    : (isDarkMode ? 'bg-pink-800 shadow-inner' : 'bg-pink-200 shadow-inner');

  const textStyles = isBack
    ? (isDarkMode ? 'text-blue-300' : 'text-blue-700')
    : (isDarkMode ? 'text-pink-300' : 'text-pink-700');

  return (
    <button
      onClick={onToggle}
      className={`relative p-0.5 sm:p-1.5 rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${stateStyles} ${textStyles}`}
      title={isBack ? "Modo: Back (A Favor)" : "Modo: Lay (Contra)"}
    >
      <span className="font-bold text-xs sm:text-base w-3 h-3 sm:w-5 sm:h-5 flex items-center justify-center">
        {isBack ? 'B' : 'L'}
      </span>
    </button>
  );
}