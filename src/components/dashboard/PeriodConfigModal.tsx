import React, { useState } from 'react';
import { X, Calendar, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PeriodConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: PeriodConfig;
  onSave: (config: PeriodConfig) => void;
}

export interface PeriodConfig {
  type: 'general' | 'current_month' | 'last_30' | 'specific_month';
  month?: number;
  year?: number;
}

export const PeriodConfigModal: React.FC<PeriodConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}) => {
  const [config, setConfig] = useState<PeriodConfig>(currentConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    if (config.type === 'specific_month' && (!config.month || !config.year)) {
      alert('Selecione um mês e ano específico.');
      return;
    }
    onSave(config);
    onClose();
  };

  const handleTypeChange = (type: PeriodConfig['type']) => {
    const now = new Date();
    setConfig({
      type,
      month: type === 'specific_month' ? now.getMonth() + 1 : undefined,
      year: type === 'specific_month' ? now.getFullYear() : undefined,
    });
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const getPeriodLabel = (type: string) => {
    switch (type) {
      case 'general':
        return 'Geral (Todos os períodos)';
      case 'current_month':
        return 'Mês Atual';
      case 'last_30':
        return 'Últimos 30 Dias';
      case 'specific_month':
        return 'Mês Específico';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg w-full max-w-md">
        <div className="p-6 border-b dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Configurar Período
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
            Escolha o período para visualizar os dados da Dashboard:
          </p>

          <div className="space-y-3">
            {/* Geral */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                config.type === 'general'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleTypeChange('general')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Geral
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Todos os períodos
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  config.type === 'general'
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {config.type === 'general' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </div>

            {/* Mês Atual */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                config.type === 'current_month'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleTypeChange('current_month')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Mês Atual
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  config.type === 'current_month'
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {config.type === 'current_month' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </div>

            {/* Últimos 30 Dias */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                config.type === 'last_30'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleTypeChange('last_30')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Últimos 30 Dias
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Período móvel de 30 dias
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  config.type === 'last_30'
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {config.type === 'last_30' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </div>

            {/* Mês Específico */}
            <div
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                config.type === 'specific_month'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleTypeChange('specific_month')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">
                      Mês Específico
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Escolha um mês e ano
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  config.type === 'specific_month'
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {config.type === 'specific_month' && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>

              {config.type === 'specific_month' && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mês
                    </label>
                    <select
                      value={config.month || 1}
                      onChange={(e) => setConfig({ ...config, month: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ano
                    </label>
                    <select
                      value={config.year || currentYear}
                      onChange={(e) => setConfig({ ...config, year: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Período Selecionado:
            </h4>
            <div className="text-lg font-bold text-gray-800 dark:text-white">
              {config.type === 'specific_month' && config.month && config.year
                ? `${months[config.month - 1]} de ${config.year}`
                : getPeriodLabel(config.type)
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
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Aplicar Período
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
