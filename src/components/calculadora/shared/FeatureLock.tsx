import React from 'react';
import { Lock } from 'lucide-react';

interface FeatureLockProps {
  children: React.ReactNode;
  isLocked: boolean;
  isDarkMode: boolean;
}

/**
 * Este componente renderiza os 'children' (a calculadora)
 * e, se 'isLocked' for true, aplica um blur e um overlay "Em breve".
 */
export function FeatureLock({ children, isLocked, isDarkMode }: FeatureLockProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* 1. Conteúdo Embaçado (Blur) */}
      <div className="filter blur-sm opacity-50 pointer-events-none select-none">
        {children}
      </div>

      {/* 2. Overlay "Em Breve" */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-b-xl ${isDarkMode ? 'bg-dark-800/50' : 'bg-white/50'}`}>
        <div className={`p-6 rounded-lg shadow-xl text-center ${isDarkMode ? 'bg-dark-900 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <Lock className={`w-10 h-10 mx-auto ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className="mt-4 text-2xl font-bold">Em breve</h3>
          <p className={`mt-1 text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Esta funcionalidade está em desenvolvimento.
          </p>
        </div>
      </div>
    </div>
  );
}