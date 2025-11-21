import React from 'react';

interface PunctuateToggleButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
}

export function PunctuateToggleButton({ isEnabled, onToggle, isDarkMode }: PunctuateToggleButtonProps) {
  // Estilos do botão: "afundado" (shadow-inner) vs "normal" (shadow-sm)
  const stateStyles = isEnabled
    ? (isDarkMode ? 'bg-dark-900 shadow-inner' : 'bg-gray-200 shadow-inner') // Pressionado
    : (isDarkMode ? 'bg-dark-800 hover:bg-dark-700 shadow-sm' : 'bg-white hover:bg-gray-100 shadow-sm'); // Normal

  // Estilos do texto "P"
  const textStyles = isEnabled
    ? (isDarkMode ? 'text-gray-200' : 'text-gray-800') // Ativo
    : (isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'); // Inativo

  // Estilos da bolinha de status
  const dotStyles = "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border";
  const dotColor = isEnabled
    ? (isDarkMode ? 'bg-green-500 border-dark-800' : 'bg-green-500 border-white') // Verde
    : (isDarkMode ? 'bg-gray-600 border-dark-800' : 'bg-gray-400 border-white'); // Cinza/Apagado

  return (
    <button
      onClick={onToggle}
      className={`relative p-0.5 sm:p-1.5 rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${stateStyles} ${textStyles}`}
      title={isEnabled ? "Pontuação automática ATIVADA" : "Pontuação automática DESATIVADA"}
    >
      {/* O "P" de Pontuação */}
      <span className="font-bold text-xs sm:text-base w-3 h-3 sm:w-5 sm:h-5 flex items-center justify-center">
        P
      </span>
      
      {/* A bolinha de status */}
      <div
        className={`${dotStyles} ${dotColor}`}
        style={{ borderWidth: '1.5px' }}
      />
    </button>
  );
}