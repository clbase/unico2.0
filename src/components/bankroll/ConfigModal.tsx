import React from 'react';
import { X, DollarSign, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import { BettingHouse } from '../../types/bankroll';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  house: BettingHouse | null;
  onResetBalance: (house: BettingHouse) => void;
  onResetBalanceAndTransactions: (house: BettingHouse) => void;
  onUpdateBalance: (house: BettingHouse) => void;
  onUpdateName: (house: BettingHouse) => void;
  onDelete: (house: BettingHouse) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  house,
  onResetBalance,
  onResetBalanceAndTransactions,
  onUpdateBalance,
  onUpdateName,
  onDelete,
}) => {
  if (!isOpen || !house) return null;

  const handleAction = (action: (house: BettingHouse) => void) => {
    action(house);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 w-full max-w-2xl rounded-xl shadow-xl">
        <div className="p-6 border-b dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Configurações da Casa
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {house.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
              className="bg-white dark:bg-dark-700 p-6 rounded-lg border border-gray-200 dark:border-dark-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => handleAction(onResetBalance)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Zerar Saldo
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Mantém o histórico de transações
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white dark:bg-dark-700 p-6 rounded-lg border border-gray-200 dark:border-dark-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => handleAction(onUpdateBalance)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Corrigir Valor Total
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Recalcula com base no histórico
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white dark:bg-dark-700 p-6 rounded-lg border border-gray-200 dark:border-dark-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => handleAction(onUpdateName)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <Edit2 className="w-6 h-6 text-green-600 dark:text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Renomear Casa
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Alterar nome da casa
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="bg-white dark:bg-dark-700 p-6 rounded-lg border border-gray-200 dark:border-dark-600 hover:border-red-500 dark:hover:border-red-500 transition-colors cursor-pointer"
              onClick={() => handleAction(onResetBalanceAndTransactions)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-red-600 dark:text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Zerar Saldo e Extrato
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Remove todo o histórico
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ações perigosas
            </p>
            <button
              onClick={() => handleAction(onDelete)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Casa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};