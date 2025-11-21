import React from 'react';
import { Gift } from 'lucide-react'; // <-- Importa o ícone de presente

interface FreebetToggleButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
}

export function FreebetToggleButton({ isEnabled, onToggle, isDarkMode }: FreebetToggleButtonProps) {
  // Estilos do botão: "aceso" vs "apagado"
  const stateStyles = isEnabled
    ? (isDarkMode ? 'bg-green-800 shadow-inner' : 'bg-green-200 shadow-inner') // Aceso
    : (isDarkMode ? 'bg-dark-800 hover:bg-dark-700 shadow-sm' : 'bg-white hover:bg-gray-100 shadow-sm'); // Apagado

  // Estilos do ícone
  const iconStyles = isEnabled
    ? (isDarkMode ? 'text-green-300' : 'text-green-700') // Aceso
    : (isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'); // Apagado

  return (
    <button
      onClick={onToggle}
      className={`relative p-0.5 sm:p-1.5 rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${stateStyles} ${iconStyles}`}
      title={isEnabled ? "Aposta Grátis (Freebet) ATIVADA" : "Aposta Grátis (Freebet) DESATIVADA"}
    >
      <Gift className="w-3 h-3 sm:w-5 sm:h-5" />
    </button>
  );
}