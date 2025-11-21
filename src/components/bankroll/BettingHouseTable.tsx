import React from 'react';
// 1. Ícones corretos
import { Receipt, Trash2, Plus, Minus } from 'lucide-react';
import { BettingHouse, Transaction } from '../../types/bankroll';
import { formatCurrency } from '../../utils/currency';

// 2. Props Atualizadas
interface BettingHouseTableProps {
  bettingHouses: BettingHouse[];
  expandedHouses: Set<string>;
  onToggleHouseTransactions: (houseId: string) => void;
  getHouseTransactions: (houseId: string) => Transaction[];
  formatDateTime: (date: string) => string;
  handleDeleteTransaction: (transaction: Transaction) => void;
  onAddTransaction: (house: BettingHouse) => void;
  onWithdrawTransaction: (house: BettingHouse) => void;
  onDeleteHouse: (house: BettingHouse) => void;
}

export const BettingHouseTable: React.FC<BettingHouseTableProps> = ({
  bettingHouses,
  expandedHouses,
  onToggleHouseTransactions,
  getHouseTransactions,
  formatDateTime,
  handleDeleteTransaction,
  onAddTransaction,
  onWithdrawTransaction,
  onDeleteHouse,
}) => {

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b dark:border-dark-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Casas de Apostas
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-dark-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Casa de Apostas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Saldo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
            {bettingHouses.map((house) => (
              <React.Fragment key={house.id}>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {house.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {formatCurrency(house.balance)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {/* 3. AÇÕES REORDENADAS */}
                    <div className="flex items-center justify-end space-x-2">
                      {/* 1. Ver Extrato */}
                      <button
                        onClick={() => onToggleHouseTransactions(house.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Ver extrato"
                      >
                        <Receipt className="w-5 h-5" />
                      </button>
                      
                      {/* 2. Adicionar Saldo (+) */}
                      <button
                        onClick={() => onAddTransaction(house)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Adicionar Saldo"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      
                      {/* 3. Retirar Saldo (-) */}
                      <button
                        onClick={() => onWithdrawTransaction(house)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Retirar Saldo"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      
                      {/* 4. Excluir Casa */}
                      <button
                        onClick={() => onDeleteHouse(house)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Excluir Casa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedHouses.has(house.id) && (
                  <TransactionList
                    house={house}
                    transactions={getHouseTransactions(house.id)}
                    formatDateTime={formatDateTime}
                    onDeleteTransaction={handleDeleteTransaction}
                  />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Componente TransactionList (Extrato) sem alterações ---
interface TransactionListProps {
  house: BettingHouse;
  transactions: Transaction[];
  formatDateTime: (date: string) => string;
  onDeleteTransaction: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  house,
  transactions,
  formatDateTime,
  onDeleteTransaction,
}) => {
  return (
    <tr>
      <td colSpan={3} className="px-6 py-4">
        <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Extrato - {house.name}
          </h4>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                formatDateTime={formatDateTime}
                onDelete={onDeleteTransaction}
              />
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
};

interface TransactionItemProps {
  transaction: Transaction;
  formatDateTime: (date: string) => string;
  onDelete: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  formatDateTime,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between py-2 border-b dark:border-dark-600 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {formatDateTime(transaction.created_at)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span
          className={`text-sm font-medium ${
            transaction.type === 'deposit'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {transaction.type === 'deposit' ? '+' : '-'} {formatCurrency(transaction.amount)}
        </span>
        <button
          onClick={() => onDelete(transaction)}
          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          title="Excluir transação"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};