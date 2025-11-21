import React from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface MonthlyStats {
  month: string;
  totalInvestment: number;
  totalProfit: number;
  roi: number;
}

interface OverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyStats: MonthlyStats[];
  totalStats: {
    totalInvestment: number;
    totalProfit: number;
    overallROI: number;
  };
}

export const OverviewModal: React.FC<OverviewModalProps> = ({
  isOpen,
  onClose,
  monthlyStats,
  totalStats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Visão Geral Detalhada
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 dark:bg-dark-700 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Investido</h3>
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                    {formatCurrency(totalStats.totalInvestment)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-dark-700 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Lucro Total</h3>
                  <p className={`text-2xl font-bold ${
                    totalStats.totalProfit >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatCurrency(totalStats.totalProfit)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  totalStats.totalProfit >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {totalStats.totalProfit >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-dark-700 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">ROI Geral</h3>
                  <p className={`text-2xl font-bold ${
                    totalStats.overallROI >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {totalStats.overallROI.toFixed(2)}%
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  totalStats.overallROI >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {totalStats.overallROI >= 0 ? (
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas Mensais */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Desempenho por Mês
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-dark-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Mês
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Investimento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lucro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                  {monthlyStats.map((stat, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {stat.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                        {formatCurrency(stat.totalInvestment)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        stat.totalProfit >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(stat.totalProfit)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                        stat.roi >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {stat.roi.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-6 border-t dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};