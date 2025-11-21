import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { Edit2, Save, Trash2, X, Plus, Calculator, Clock, CheckCircle2, Gift, RefreshCw, HelpCircle } from 'lucide-react';
import { calculateBetReturn } from '../utils/bet';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/currency';

interface Bet {
  id: string;
  house_a: string;
  house_b: string;
  percentage: number;
  investment: number;
  dutching_investment: number;
  event_date: string;
  event_time: string;
  status: 'pending' | 'won' | 'lost' | 'returned' | 'cashout';
  house_type: 'A' | 'B' | 'C' | 'D' | 'E';
  group_id: string;
  created_at: string;
  odds: number;
  market: string;
  cashout_amount?: number;
  is_freebet?: boolean;
  bet_mode?: 'back' | 'lay';
}

interface GroupedBet {
  betA: Bet;
  betB: Bet | null;
  betC: Bet | null;
  betD: Bet | null;
  betE: Bet | null;
  key: string;
}

interface BetStats {
  totalBets: number;
  resolvedBets: number;
  pendingBets: number;
  pendingInvestment: number;
}

interface EditForm {
  [key: string]: {
    odds: number;
    investment: number;
    status: string;
    market: string;
    cashout_amount?: number;
  };
}

const calculateGroupROI = (group: GroupedBet): number => {
  const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
  
  if (allBets.some(bet => bet.status === 'pending')) {
    return 0;
  }
  
  // Calcula investimento total usando o Custo Real salvo no banco
  const totalInvestment = allBets.reduce((sum, bet) => {
    // Se for freebet, o custo é 0 (já está salvo como 0 no banco)
    // Se for lay, o custo é a responsabilidade (já está salvo como responsabilidade no banco)
    return sum + bet.investment;
  }, 0);

  const totalReturn = allBets.reduce((sum, bet) =>  sum + calculateBetReturn(bet), 0);
  const profit = totalReturn - totalInvestment;
  
  return totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
};

// Função para formatar odds com precisão completa
const formatOdds = (odds: number): string => {
  if (odds % 1 !== 0 && odds.toString().split('.')[1]?.length > 2) {
    return odds.toString();
  }
  return odds.toFixed(2);
};

// --- HELPER: Calcular o Stake Visual (o valor da aposta) ---
// O banco guarda o Custo Real. Aqui recuperamos o Stake para exibir na tabela.
const getDisplayStake = (bet: Bet): number => {
  // Se for Lay: Investment (Banco) = Responsabilidade = Stake * (Odd - 1)
  // Logo: Stake = Investment / (Odd - 1)
  if (bet.bet_mode === 'lay') {
    if (bet.odds <= 1) return 0;
    return bet.investment / (bet.odds - 1);
  }
  
  // Se for Freebet: Investment (Banco) = 0.
  // Dutching Investment (Banco) = Retorno = (Odd - 1) * Stake
  // Logo: Stake = Dutching Investment / (Odd - 1)
  if (bet.is_freebet) {
    if (bet.odds <= 1) return 0;
    return bet.dutching_investment / (bet.odds - 1);
  }

  // Se for Back Normal: Investment (Banco) = Stake
  return bet.investment;
};

export const BetList: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({});
  const [hoveredBetId, setHoveredBetId] = useState<string | null>(null);
  const [stats, setStats] = useState<BetStats>({
    totalBets: 0,
    resolvedBets: 0,
    pendingBets: 0,
    pendingInvestment: 0
  });

  useEffect(() => {
    fetchBets();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [bets]);

  const fetchBets = async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .order('event_date', { ascending: false })
        .order('event_time', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBets(data || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const groupedBets = groupBets(bets);
    let totalInvestment = 0;
    let totalReturn = 0;
    let resolvedCount = 0;
    let totalCount = groupedBets.length;
    let pendingInvestment = 0;

    groupedBets.forEach((group) => {
      const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
      const allResolved = allBets.every(bet => bet.status !== 'pending');
      
      // Soma dos investimentos (Custo Real do banco)
      const groupInvestment = allBets.reduce((sum, bet) => sum + bet.investment, 0);

      if (allResolved) {
        resolvedCount++;
        totalInvestment += groupInvestment;
        totalReturn += allBets.reduce((sum, bet) => sum + calculateBetReturn(bet), 0);
      } else {
        pendingInvestment += groupInvestment;
      }
    });

    setStats({
      totalBets: totalCount,
      resolvedBets: resolvedCount,
      pendingBets: totalCount - resolvedCount,
      pendingInvestment
    });
  };

  const calculateGroupProfit = (group: GroupedBet): number => {
    const bets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
    
    if (bets.some(bet => bet.status === 'pending')) {
      return 0;
    }
    
    const totalInvestment = bets.reduce((sum, bet) => sum + bet.investment, 0); // Custo Real
    const totalReturn = bets.reduce((sum, bet) => sum + calculateBetReturn(bet), 0);
    return totalReturn - totalInvestment;
  };

  const groupBets = (bets: Bet[]): GroupedBet[] => {
    const grouped: { [key: string]: GroupedBet } = {};

    bets.forEach((bet) => {
      const key = `${bet.event_date}-${bet.event_time}-${bet.group_id}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          betA: bet.house_type === 'A' ? bet : null as any,
          betB: bet.house_type === 'B' ? bet : null,
          betC: bet.house_type === 'C' ? bet : null,
          betD: bet.house_type === 'D' ? bet : null,
          betE: bet.house_type === 'E' ? bet : null,
          key,
        };
      } else {
        if (bet.house_type === 'A') grouped[key].betA = bet;
        else if (bet.house_type === 'B') grouped[key].betB = bet;
        else if (bet.house_type === 'C') grouped[key].betC = bet;
        else if (bet.house_type === 'D') grouped[key].betD = bet;
        else if (bet.house_type === 'E') grouped[key].betE = bet;
      }
    });

    return Object.values(grouped).sort((a, b) => {
      const dateCompare = new Date(b.betA.event_date).getTime() - new Date(a.betA.event_date).getTime();
      if (dateCompare !== 0) return dateCompare;
      
      const timeCompare = b.betA.event_time.localeCompare(a.betA.event_time);
      if (timeCompare !== 0) return timeCompare;
      
      return new Date(a.betA.created_at).getTime() - new Date(b.betA.created_at).getTime();
    });
  };

  const groupHasCashout = (group: GroupedBet): boolean => {
    const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
    if (editingGroupKey === group.key) {
      return allBets.some(bet => editForm[bet.id]?.status === 'cashout');
    }
    return allBets.some(bet => bet.status === 'cashout');
  };

  const handleEdit = (group: GroupedBet) => {
    setEditingGroupKey(group.key);
    const newEditForm: EditForm = {};
    
    [group.betA, group.betB, group.betC, group.betD, group.betE]
      .filter(Boolean)
      .forEach((bet) => {
        newEditForm[bet!.id] = {
          odds: bet!.odds,
          // Ao editar, o usuário quer editar o STAKE, não a Responsabilidade
          investment: getDisplayStake(bet!),
          status: bet!.status,
          market: bet!.market,
          cashout_amount: bet!.cashout_amount || undefined,
        };
      });
    
    setEditForm(newEditForm);
  };

  const handleSave = async (group: GroupedBet) => {
    try {
      const betsToUpdate = [group.betA, group.betB, group.betC, group.betD, group.betE]
        .filter(Boolean) as Bet[];
      
      for (const bet of betsToUpdate) {
        const formData = editForm[bet.id];
        
        // Recalcula os valores para o banco (Stake -> Custo Real)
        let dbInvestment = formData.investment;
        let dbReturn = formData.odds * formData.investment;

        if (bet.bet_mode === 'lay') {
          dbInvestment = formData.investment * (formData.odds - 1); // Responsabilidade
          dbReturn = dbInvestment + formData.investment; // Responsabilidade + Stake
        } else if (bet.is_freebet) {
          dbInvestment = 0; // Custo zero
          dbReturn = (formData.odds - 1) * formData.investment; // Lucro
        }

        const updatedBet = {
          ...bet,
          odds: formData.odds,
          investment: dbInvestment,
          dutching_investment: dbReturn,
          status: formData.status,
          market: formData.market,
          cashout_amount: formData.status === 'cashout' ? (formData.cashout_amount || null) : null,
        };

        const { error } = await supabase
          .from('bets')
          .update(updatedBet)
          .eq('id', bet.id);

        if (error) throw error;
      }

      // Atualiza estado local
      setBets(prev => prev.map(b => {
        const formData = editForm[b.id];
        if (formData) {
          let dbInvestment = formData.investment;
          let dbReturn = formData.odds * formData.investment;

          if (b.bet_mode === 'lay') {
            dbInvestment = formData.investment * (formData.odds - 1);
            dbReturn = dbInvestment + formData.investment;
          } else if (b.is_freebet) {
            dbInvestment = 0;
            dbReturn = (formData.odds - 1) * formData.investment;
          }

          return {
            ...b,
            odds: formData.odds,
            investment: dbInvestment,
            dutching_investment: dbReturn,
            status: formData.status,
            market: formData.market,
            cashout_amount: formData.status === 'cashout' ? (formData.cashout_amount || undefined) : undefined,
          };
        }
        return b;
      }));
      
      setEditingGroupKey(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating bets:', error);
    }
  };

  const handleDelete = async (group: GroupedBet) => {
    if (!confirm('Tem certeza que deseja excluir esta aposta?')) return;

    try {
      const betIds = [group.betA, group.betB, group.betC, group.betD, group.betE]
        .filter(Boolean)
        .map(bet => bet!.id);

      const { error } = await supabase
        .from('bets')
        .delete()
        .in('id', betIds);

      if (error) throw error;

      setBets((prev) => prev.filter((b) => !betIds.includes(b.id)));
    } catch (error) {
      console.error('Error deleting bets:', error);
    }
  };

  const handleInputChange = (betId: string, field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [betId]: {
        ...prev[betId],
        [field]: field === 'status' || field === 'market' ? value : 
                field === 'cashout_amount' ? (value === '' ? undefined : Number(value)) :
                Number(value),
      },
    }));
  };

  const formatDateTime = (date: string, time: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hours, minutes);
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'returned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cashout': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'won': return 'Ganhou';
      case 'lost': return 'Perdeu';
      case 'returned': return 'Devolvida';
      case 'cashout': return 'Cashout';
      default: return 'Pendente';
    }
  };

  const shouldShowCashoutColumn = (): boolean => {
    const groupedBets = groupBets(bets);
    return groupedBets.some(group => groupHasCashout(group));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const groupedBets = groupBets(bets);
  const showCashoutColumn = shouldShowCashoutColumn();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Planilha de Apostas</h1>
        <button
          onClick={() => navigate('/new-bet')}
          className={`flex items-center gap-2 py-2 px-4 rounded hover:opacity-90 transition-colors ${
            isDark 
              ? 'bg-[#2e2e33] text-[#b0b0b5] hover:bg-[#3a3a3f]' 
              : 'bg-gray-800 text-white hover:bg-gray-900'
          }`}
        >
          <Plus className="w-5 h-5" />
          Nova Aposta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total de Apostas</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{stats.totalBets}</p>
            </div>
            <div className="p-3 bg-[#7200C9]/20 rounded-full">
              <Calculator className="w-6 h-6 text-[#7200C9]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Apostas Resolvidas</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{stats.resolvedBets}</p>
            </div>
            <div className="p-3 bg-[#7200C9]/20 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-[#7200C9]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Apostas Pendentes</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">{stats.pendingBets}</p>
            </div>
            <div className="p-3 bg-[#7200C9]/20 rounded-full">
              <Clock className="w-6 h-6 text-[#7200C9]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Valores Pendentes</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
                {formatCurrency(stats.pendingInvestment)}
              </p>
            </div>
            <div className="p-3 bg-[#7200C9]/20 rounded-full">
              <Calculator className="w-6 h-6 text-[#7200C9]" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Casa
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Odds
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Investimento
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Retorno
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                {showCashoutColumn && (
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Valor Cashout
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
              {groupedBets.map((group) => {
                const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
                
                return (
                  <React.Fragment key={group.key}>
                    {allBets.map((bet, index) => (
                      <tr key={bet.id}>
                        {index === 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200" rowSpan={allBets.length}>
                            <div className="space-y-2">
                              <div className="text-white dark:text-white">{formatDateTime(bet.event_date, bet.event_time)}</div>
                              <div className="text-xs space-y-1">
                                <div className="font-medium">
                                  <span className="text-white dark:text-white">Lucro:</span>
                                  <span className={
                                    calculateGroupProfit(group) >= 0 
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }>
                                    {' '}{formatCurrency(calculateGroupProfit(group))}
                                  </span>
                                </div>
                                <div className="font-medium">
                                  <span className="text-white dark:text-white">ROI:</span>
                                  <span className={
                                    calculateGroupROI(group) >= 0 
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }>
                                    {' '}{calculateGroupROI(group).toFixed(2)}%
                                  </span>
                                </div>
                                <div className="font-medium">
                                  <span className="text-white dark:text-white">Mercado:</span>
                                  <span className="text-blue-400 dark:text-blue-300">
                                    {' '}{bet.market || 'Não especificado'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        <td 
                          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 transition-colors cursor-pointer ${
                            hoveredBetId === bet.id ? 'bg-gray-100 dark:bg-dark-750' : ''
                          }`}
                          onMouseEnter={() => setHoveredBetId(bet.id)}
                          onMouseLeave={() => setHoveredBetId(null)}
                        >
                          <div className="flex items-center gap-2">
                            {bet.house_type === 'A' ? bet.house_a : bet.house_b}
                            {bet.is_freebet && (
                              <Gift className="w-4 h-4 text-green-500" title="Aposta Grátis" />
                            )}
                            {bet.bet_mode === 'lay' && (
                              <RefreshCw className="w-4 h-4 text-pink-500" title="Aposta Lay (Contra)" />
                            )}
                          </div>
                        </td>
                        <td 
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-white transition-colors ${
                            hoveredBetId === bet.id ? 'bg-gray-100 dark:bg-dark-750' : ''
                          }`}
                          onMouseEnter={() => setHoveredBetId(bet.id)}
                          onMouseLeave={() => setHoveredBetId(null)}
                        >
                          {editingGroupKey === group.key ? (
                            <input
                              type="number"
                              value={editForm[bet.id]?.odds || bet.odds}
                              onChange={(e) => handleInputChange(bet.id, 'odds', e.target.value)}
                              step="0.001"
                              min="1"
                              className="w-24 p-1 text-right border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                            />
                          ) : (
                            formatOdds(bet.odds)
                          )}
                        </td>
                        
                        {/* --- COLUNA INVESTIMENTO CORRIGIDA --- */}
                        <td 
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-white transition-colors ${
                            hoveredBetId === bet.id ? 'bg-gray-100 dark:bg-dark-750' : ''
                          }`}
                          onMouseEnter={() => setHoveredBetId(bet.id)}
                          onMouseLeave={() => setHoveredBetId(null)}
                        >
                          {editingGroupKey === group.key ? (
                            <input
                              type="number"
                              value={editForm[bet.id]?.investment || getDisplayStake(bet)}
                              onChange={(e) => handleInputChange(bet.id, 'investment', e.target.value)}
                              step="0.01"
                              min="0"
                              className="w-24 p-1 text-right border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                            />
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {formatCurrency(getDisplayStake(bet))}
                              {bet.bet_mode === 'lay' && (
                                <div className="group relative">
                                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                                  <div className="absolute bottom-full right-0 mb-2 w-max p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                    Responsabilidade: {formatCurrency(bet.investment)}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        {/* ------------------------------------- */}

                        <td 
                          className={`px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-white transition-colors ${
                            hoveredBetId === bet.id ? 'bg-gray-100 dark:bg-dark-750' : ''
                          }`}
                          onMouseEnter={() => setHoveredBetId(bet.id)}
                          onMouseLeave={() => setHoveredBetId(null)}
                        >
                          {formatCurrency(calculateBetReturn(bet))}
                        </td>
                        <td 
                          className={`px-6 py-4 whitespace-nowrap text-sm text-center transition-colors ${
                            hoveredBetId === bet.id ? 'bg-gray-100 dark:bg-dark-750' : ''
                          }`}
                          onMouseEnter={() => setHoveredBetId(bet.id)}
                          onMouseLeave={() => setHoveredBetId(null)}
                        >
                          {editingGroupKey === group.key ? (
                            <select
                              value={editForm[bet.id]?.status || bet.status}
                              onChange={(e) => handleInputChange(bet.id, 'status', e.target.value)}
                              className="p-1 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                            >
                              <option value="pending">Pendente</option>
                              <option value="won">Ganhou</option>
                              <option value="lost">Perdeu</option>
                              <option value="returned">Devolvida</option>
                              <option value="cashout">Cashout</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                getStatusColor(bet.status)
                              }`}
                            >
                              {getStatusText(bet.status)}
                            </span>
                          )}
                        </td>
                        {showCashoutColumn && (
                          <td 
                            className={`px-6 py-4 whitespace-nowrap text-sm text-center transition-colors ${
                              hoveredBetId === bet.id ? 'bg-gray-100 dark:bg-dark-750' : ''
                            }`}
                            onMouseEnter={() => setHoveredBetId(bet.id)}
                            onMouseLeave={() => setHoveredBetId(null)}
                          >
                            {editingGroupKey === group.key ? (
                              (editForm[bet.id]?.status === 'cashout') ? (
                                <input
                                  type="number"
                                  value={editForm[bet.id]?.cashout_amount !== undefined ? editForm[bet.id]?.cashout_amount : ''}
                                  onChange={(e) => handleInputChange(bet.id, 'cashout_amount', e.target.value)}
                                  step="0.01"
                                  min="0"
                                  placeholder="Valor do cashout"
                                  className="w-24 p-1 text-center border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white text-xs"
                                />
                              ) : (
                                <span className="text-gray-400">-</span>
                              )
                            ) : (
                              bet.status === 'cashout' ? (
                                <span className="text-purple-600 dark:text-purple-400 font-medium">
                                  {formatCurrency(bet.cashout_amount || 0)}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )
                            )}
                          </td>
                        )}
                        {index === 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right" rowSpan={allBets.length}>
                            <div className="flex items-center justify-end space-x-2">
                              {editingGroupKey === group.key ? (
                                <>
                                  <button
                                    onClick={() => handleSave(group)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                    title="Salvar alterações"
                                  >
                                    <Save className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingGroupKey(null);
                                      setEditForm({});
                                    }}
                                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                    title="Cancelar edição"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(group)}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                    title="Editar apostas"
                                  >
                                    <Edit2 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(group)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    title="Excluir apostas"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    <tr className="h-2 bg-gray-50 dark:bg-dark-900">
                      <td colSpan={showCashoutColumn ? 8 : 7}></td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};