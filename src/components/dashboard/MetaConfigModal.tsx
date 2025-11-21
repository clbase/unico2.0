import React, { useState } from 'react';
import { X, Target, DollarSign } from 'lucide-react';

interface MetaConfig {
  type: 'month';
  value: number | null;
}

interface MetaConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: MetaConfig;
  onSave: (config: MetaConfig) => void;
}

export const MetaConfigModal: React.FC<MetaConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}) => {
  const [config, setConfig] = useState<MetaConfig>(currentConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    if (config.value === null || config.value <= 0) {
      alert('O valor da meta deve ser maior que zero.');
      return;
    }
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg w-full max-w-md">
        <div className="p-6 border-b dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Configurar Meta Mensal
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
          <div className="space-y-6">
            {/* Valor da Meta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor da Meta Mensal (R$)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={config.value === null ? '' : config.value}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      value: e.target.value === '' ? null : Number(e.target.value),
                    }))
                  }
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prévia:
            </h4>
            <div className="text-lg font-bold text-gray-800 dark:text-white">
              Meta do Mês
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {config.value === null
                ? 'Nenhuma meta definida'
                : `R$ 0,00 / R$ ${config.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
              Salvar Meta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};