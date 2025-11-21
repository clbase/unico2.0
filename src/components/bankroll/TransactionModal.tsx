import React, { useState, useEffect } from 'react';
import { X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { BettingHouse } from '../../types/bankroll';
import { formatCurrency } from '../../utils/currency';

// 1. Props Atualizadas
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (houseId: string, amount: string) => Promise<void>;
  house: BettingHouse | null;
  transactionType: 'deposit' | 'withdrawal';
  error?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  house,
  transactionType,
  error,
}) => {
  const [amount, setAmount] = useState<string>('');

  // Limpa o valor quando o modal é fechado ou o 'house' muda
  useEffect(() => {
    if (isOpen) {
      setAmount('');
    }
  }, [isOpen]);

  if (!isOpen || !house) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(house.id, amount);
    // Não limpamos mais os estados aqui, o Bankroll.tsx cuida disso ao fechar
  };

  const title = transactionType === 'deposit' ? 'Adicionar Saldo' : 'Retirar Saldo';
  const Icon = transactionType === 'deposit' ? ArrowUpCircle : ArrowDownCircle;
  const buttonColor = transactionType === 'deposit' 
    ? 'bg-green-500 hover:bg-green-600' 
    : 'bg-red-500 hover:bg-red-600';
  const iconColor = transactionType === 'deposit' 
    ? 'text-green-500' 
    : 'text-red-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className={`w-6 h-6 ${iconColor}`} />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 2. UI Simplificada: Remove seleção de Tipo e Casa */}
            
            {/* Mostra a casa selecionada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Casa de Apostas
              </label>
              <div className="w-full p-3 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white">
                <span className="font-medium">{house.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  (Saldo: {formatCurrency(house.balance)})
                </span>
              </div>
            </div>

            {/* Mantém apenas o valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`text-white px-4 py-2 rounded transition-colors ${buttonColor}`}
            >
              {transactionType === 'deposit' ? 'Adicionar' : 'Retirar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};