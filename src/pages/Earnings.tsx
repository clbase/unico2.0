import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Earning, EarningFormData } from '../types/earnings';
import { EarningModal } from '../components/earnings/EarningModal';
import { EarningEditModal } from '../components/earnings/EarningEditModal';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/currency';

export const Earnings: React.FC = () => {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEarning, setSelectedEarning] = useState<Earning | null>(null);
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .order('event_date', { ascending: false })
        .order('event_time', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEarnings(data || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setError('Erro ao carregar ganhos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEarning = async (data: EarningFormData) => {
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('earnings')
        .insert([{
          user_id: user.id,
          type: data.type,
          house_name: data.house_name,
          amount: Number(data.amount),
          observation: data.observation || null,
          event_date: data.event_date,
          event_time: data.event_time,
        }]);

      if (error) throw error;

      setShowModal(false);
      fetchEarnings();
    } catch (error) {
      console.error('Error adding earning:', error);
      setError('Erro ao adicionar ganho');
    }
  };

  const handleEditEarning = async (data: EarningFormData) => {
    if (!selectedEarning) return;

    setError('');

    try {
      const { error } = await supabase
        .from('earnings')
        .update({
          type: data.type,
          house_name: data.house_name,
          amount: Number(data.amount),
          observation: data.observation || null,
          event_date: data.event_date,
          event_time: data.event_time,
        })
        .eq('id', selectedEarning.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedEarning(null);
      fetchEarnings();
    } catch (error) {
      console.error('Error updating earning:', error);
      setError('Erro ao atualizar ganho');
    }
  };

  const handleDeleteEarning = async (earning: Earning) => {
    if (!confirm('Tem certeza que deseja excluir este ganho?')) return;

    try {
      const { error } = await supabase
        .from('earnings')
        .delete()
        .eq('id', earning.id);

      if (error) throw error;

      fetchEarnings();
    } catch (error) {
      console.error('Error deleting earning:', error);
      setError('Erro ao excluir ganho');
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hours, minutes);
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const totalProfit = earnings
    .filter(e => e.type === 'profit')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalLoss = earnings
    .filter(e => e.type === 'loss')
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalProfit - totalLoss;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Ganhos</h1>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center gap-2 py-2 px-4 rounded hover:opacity-90 transition-colors ${
            isDark 
              ? 'bg-[#2e2e33] text-[#b0b0b5] hover:bg-[#3a3a3f]' 
              : 'bg-gray-800 text-white hover:bg-gray-900'
          }`}
        >
          <Plus className="w-5 h-5" />
          Adicionar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-lg shadow-md ${
          isDark ? 'bg-[#1a1a1d]' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-600'}`}>
                Total de Lucros
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
            <div className="p-3 bg-[#7200C9]/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-[#7200C9]" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${
          isDark ? 'bg-[#1a1a1d]' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-600'}`}>
                Total de Perdas
              </p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {formatCurrency(totalLoss)}
              </p>
            </div>
            <div className="p-3 bg-[#7200C9]/20 rounded-full">
              <TrendingDown className="w-6 h-6 text-[#7200C9]" />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${
          isDark ? 'bg-[#1a1a1d]' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-600'}`}>
                Lucro Líquido
              </p>
              <p className={`text-2xl font-bold ${
                netProfit >= 0 
                  ? (isDark ? 'text-white' : 'text-gray-800')
                  : 'text-red-500'
              }`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            <div className="p-3 bg-[#7200C9]/20 rounded-full">
              {netProfit >= 0 ? (
                <TrendingUp className="w-6 h-6 text-[#7200C9]" />
              ) : (
                <TrendingDown className="w-6 h-6 text-[#7200C9]" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Earnings List */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b dark:border-dark-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Extrato
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Casa
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Observação
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {earnings.map((earning) => (
                <tr key={earning.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDateTime(earning.event_date, earning.event_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      earning.type === 'profit'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {earning.type === 'profit' ? (
                        <>
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Lucro
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 mr-1" />
                          Perda
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {earning.house_name}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    earning.type === 'profit'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {earning.type === 'profit' ? '+' : '-'} {formatCurrency(earning.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {earning.observation || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEarning(earning);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEarning(earning)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EarningModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddEarning}
        error={error}
      />

      <EarningEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEarning(null);
        }}
        onSubmit={handleEditEarning}
        earning={selectedEarning}
        error={error}
      />
    </div>
  );
};