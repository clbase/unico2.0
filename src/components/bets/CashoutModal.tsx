import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';

interface CashoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cashoutAmounts: { [betId: string]: number }) => void;
  bets: Array<{
    id: string;
    house_type: string;
    house_a: string;
    house_b: string;
    investment: number;
  }>;
}

export const CashoutModal: React.FC<CashoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bets,
}) => {
  const [cashoutAmounts, setCashoutAmounts] = useState<{ [betId: string]: string }>({});

  if (!isOpen) return null;

  const handleAmountChange = (betId: string, value: string) => {
    setCashoutAmounts(prev => ({
      ...prev,
      [betId]: value
    }));
  };

  const handleConfirm = () => {
    const amounts: { [betId: string]: number } = {};
    
    for (const bet of bets) {
      const amount = parseFloat(cashoutAmounts[bet.id] || '0');
      if (isNaN(amount) || amount < 0) {
        alert(`Por favor, insira um valor válido para ${bet.house_type === 'A' ? bet.house_a : bet.house_b}`);
        return;
      }
      amounts[bet.id] = amount;
    }

    onConfirm(amounts);
    setCashoutAmounts({});
  };

  const handleClose = () => {
    setCashoutAmounts({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Valor do Cashout
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Informe o valor recebido no cashout para cada casa:
        </p>

        <div className="space-y-4">
          {bets.map((bet) => (
            <div key={bet.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {bet.house_type === 'A' ? bet.house_a : bet.house_b}
                <span className="text-xs text-gray-500 ml-2">
                  (Investimento: R$ {bet.investment.toFixed(2)})
                </span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={cashoutAmounts[bet.id] || ''}
                  onChange={(e) => handleAmountChange(bet.id, e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
          >
            Confirmar Cashout
          </button>
        </div>
      </div>
    </div>
  );
};