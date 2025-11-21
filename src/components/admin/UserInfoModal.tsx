import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { Info, X } from 'lucide-react';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
}

interface UserStats {
  totalInvestment: number;
  totalReturn: number;
  netProfit: number;
  lastAccess: string | null;
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
}) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUserStats();
    }
  }, [isOpen, userId]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user's bets
      const { data: bets, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', userId);

      if (betsError) throw betsError;

      // Fetch user's last access
      const { data: userData, error: userError } = await supabase.auth
        .admin.getUserById(userId);

      if (userError) throw userError;

      // Calculate stats
      let totalInvestment = 0;
      let totalReturn = 0;

      bets?.forEach((bet) => {
        totalInvestment += bet.investment;
        if (bet.status === 'won') {
          totalReturn += bet.dutching_investment;
        } else if (bet.status === 'returned') {
          totalReturn += bet.investment;
        }
      });

      setStats({
        totalInvestment,
        totalReturn,
        netProfit: totalReturn - totalInvestment,
        lastAccess: userData?.last_sign_in_at || null,
      });
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      setError('Erro ao carregar informações do usuário');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Informações do Usuário
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-300">
            Email: {userEmail}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 dark:text-red-400 text-center py-4">
            {error}
          </div>
        ) : stats ? (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Último Acesso
              </h3>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {stats.lastAccess
                  ? format(new Date(stats.lastAccess), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })
                  : 'Nunca acessou'}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Investimento Total
              </h3>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                R$ {stats.totalInvestment.toFixed(2)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Retorno Total
              </h3>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                R$ {stats.totalReturn.toFixed(2)}
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Lucro Líquido
              </h3>
              <p
                className={`text-lg font-semibold ${
                  stats.netProfit >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                R$ {stats.netProfit.toFixed(2)}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-white py-2 px-4 rounded hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};