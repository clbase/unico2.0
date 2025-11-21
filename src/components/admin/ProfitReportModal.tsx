import React, { useState, useEffect } from 'react';
import { X, Loader2, Filter, TrendingUp, TrendingDown, Ban } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/currency';

// 1. Atualizar a interface para incluir 'status'
interface UserProfitStats {
  user_id: string;
  email: string;
  status: string | null; // <-- CAMPO ADICIONADO
  sure_profit: number;
  earnings_profit: number;
  total_profit: number;
}

interface ProfitReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfitReportModal: React.FC<ProfitReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [stats, setStats] = useState<UserProfitStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados dos filtros
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1); // Mês atual (1-12)
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [filterType, setFilterType] = useState<'month' | 'all'>('month');

  // Gera opções de Mês e Ano
  const months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
  ];
  const currentYear = now.getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  // Busca os dados quando o modal abre ou os filtros mudam
  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, filterType, selectedMonth, selectedYear]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    const params = {
      p_month: filterType === 'month' ? selectedMonth : null,
      p_year: filterType === 'month' ? selectedYear : null,
    };

    try {
      // ----- LINHA CORRIGIDA (REMOVIDO O '_' NO FINAL) -----
      const { data, error } = await supabase.rpc('admin_get_all_user_stats', params);

      if (error) throw error;
      setStats(data || []);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Erro ao buscar dados.');
    } finally {
      setLoading(false);
    }
  };

  const ProfitDisplay: React.FC<{ amount: number }> = ({ amount }) => (
    <span className={amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
      {formatCurrency(amount)}
    </span>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Cabeçalho */}
        <div className="p-6 border-b dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Relatório de Lucro por Aluno
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

        {/* Filtros */}
        <div className="p-4 border-b dark:border-dark-700 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'month' | 'all')}
              className="p-2 border rounded-lg dark:bg-dark-700 dark:border-dark-600 dark:text-white"
            >
              <option value="month">Mês Específico</option>
              <option value="all">Todo o Período</option>
            </select>
          </div>
          
          {filterType === 'month' && (
            <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="p-2 border rounded-lg dark:bg-dark-700 dark:border-dark-600 dark:text-white"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="p-2 border rounded-lg dark:bg-dark-700 dark:border-dark-600 dark:text-white"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>
          )}

          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Conteúdo (Tabela) */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-dark-700 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Aluno (Email)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lucro Sure
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lucro Ganhos
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Lucro Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                  {stats.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900 dark:text-white">{user.email}</span>
                          {user.status === 'suspended' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <Ban className="w-3 h-3" />
                              SUSPENSO
                            </span>
                          )}
                          {user.status === 'expired' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Expirado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <ProfitDisplay amount={user.sure_profit} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <ProfitDisplay amount={user.earnings_profit} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                        <ProfitDisplay amount={user.total_profit} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rodapé */}
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