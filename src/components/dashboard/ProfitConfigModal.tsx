import React, { useState } from 'react';
import { X, Settings, TrendingUp, Calculator } from 'lucide-react';

interface ProfitConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: {
    showSureProfit: boolean;
    showEarningsProfit: boolean;
  };
  onSave: (config: { showSureProfit: boolean; showEarningsProfit: boolean }) => void;
}

export const ProfitConfigModal: React.FC<ProfitConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}) => {
  const [config, setConfig] = useState(currentConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    // Pelo menos uma opção deve estar selecionada
    if (!config.showSureProfit && !config.showEarningsProfit) {
      alert('Selecione pelo menos uma opção de lucro para exibir.');
      return;
    }
    
    onSave(config);
    onClose();
  };

  const handleToggle = (type: 'showSureProfit' | 'showEarningsProfit') => {
    setConfig(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg w-full max-w-md">
        <div className="p-6 border-b dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Configurar Lucro Total
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Escolha quais tipos de lucro devem ser exibidos no card "Lucro Total":
          </p>

          <div className="space-y-4">
            {/* Lucro das Surebets */}
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                config.showSureProfit
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleToggle('showSureProfit')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Lucro das Surebets
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lucro líquido das apostas sure
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  config.showSureProfit 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {config.showSureProfit && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Lucros Extras (Aba Ganhos) */}
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                config.showEarningsProfit
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleToggle('showEarningsProfit')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Lucros Extras
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Lucro líquido da aba Ganhos
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  config.showEarningsProfit 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {config.showEarningsProfit && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prévia do Card:
            </h4>
            <div className="text-lg font-bold text-gray-800 dark:text-white">
              {config.showSureProfit && config.showEarningsProfit 
                ? 'Lucro Total (Sure + Extras)'
                : config.showSureProfit 
                ? 'Lucro Total - Sure'
                : config.showEarningsProfit
                ? 'Lucro Total - Extras'
                : 'Selecione uma opção'
              }
            </div>
          </div>
        </div>

        <div className="p-6 border-t dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Salvar Configuração
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};