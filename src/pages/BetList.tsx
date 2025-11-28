import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { 
  Edit2, Save, Trash2, X, Plus, Calculator, Clock, 
  Gift, RefreshCw, HelpCircle, 
  Calendar, Archive, ChevronLeft, ChevronRight, Loader2, AlertCircle, TrendingUp,
  PenLine 
} from 'lucide-react';
import { calculateBetReturn } from '../utils/bet';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/currency';

// --- Interfaces ---
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
  increase_percentage?: number;
}

interface GroupedBet {
  betA: Bet | null;
  betB: Bet | null;
  betC: Bet | null;
  betD: Bet | null;
  betE: Bet | null;
  key: string;
  timestamp: number;
}

interface GeneralStats {
  totalBetsAllTime: number;
  pendingBetsCount: number;
  pendingValue: number;
}

interface EditForm {
  [key: string]: {
    odds: number;
    investment: number;
    status: string;
    market: string;
    cashout_amount?: number;
    increase_percentage?: number;
    house_name: string;
    event_date: string;
    event_time: string;
  };
}

// --- Helpers ---
const getMainBet = (group: GroupedBet): Bet | null => {
  return group.betA || group.betB || group.betC || group.betD || group.betE || null;
};

const calculateGroupROI = (group: GroupedBet): number => {
  const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
  if (allBets.length === 0) return 0;
  if (allBets.some(bet => bet.status === 'pending')) return 0;
  
  const totalInvestment = allBets.reduce((sum, bet) => sum + (Number(bet.investment) || 0), 0);
  const totalReturn = allBets.reduce((sum, bet) => sum + calculateBetReturn(bet), 0);
  const profit = totalReturn - totalInvestment;
  
  return totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
};

const calculateGroupProfit = (group: GroupedBet): number => {
  const bets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
  if (bets.length === 0) return 0;
  if (bets.some(bet => bet.status === 'pending')) return 0;
  
  const totalInvestment = bets.reduce((sum, bet) => sum + (Number(bet.investment) || 0), 0);
  const totalReturn = bets.reduce((sum, bet) => sum + calculateBetReturn(bet), 0);
  return totalReturn - totalInvestment;
};

const formatOdds = (odds: number): string => {
  const val = Number(odds);
  if (isNaN(val)) return "0.00";
  if (val % 1 !== 0 && val.toString().split('.')[1]?.length > 2) {
    return val.toString();
  }
  return val.toFixed(2);
};

const getDisplayStake = (bet: Bet): number => {
  if (bet.bet_mode === 'lay') {
    if (bet.odds <= 1) return 0;
    return bet.investment / (bet.odds - 1);
  }
  if (bet.is_freebet) {
    if (bet.odds <= 1) return 0;
    return bet.dutching_investment / (bet.odds - 1);
  }
  return bet.investment;
};

// --- Componente Principal ---
export const BetList: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const isMounted = useRef(true);

  // Estados
  const [bets, setBets] = useState<Bet[]>([]);
  const [generalStats, setGeneralStats] = useState<GeneralStats>({
    totalBetsAllTime: 0,
    pendingBetsCount: 0,
    pendingValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [visibleCount, setVisibleCount] = useState(50);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- ESTADO DE EDIÇÃO ---
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({});
  
  // Estado para controlar quais "sub-campos" (Date, Market, House) estão ativos para edição
  const [activeSubEdits, setActiveSubEdits] = useState<Record<string, boolean>>({});

  // --- Effects ---
  useEffect(() => {
    isMounted.current = true;
    loadPageData();
    return () => { isMounted.current = false; };
  }, [selectedDate]);

  // --- Data Fetching ---
  const loadPageData = async () => {
    setLoading(true);
    setErrorMsg('');
    setVisibleCount(50);
    try {
      await Promise.all([fetchMonthBets(), fetchGeneralStats()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (isMounted.current) setErrorMsg('Erro de conexão.');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const fetchGeneralStats = async () => {
    try {
      const { data: pendingData, error: pendingError } = await supabase
        .from('bets')
        .select('investment, group_id')
        .eq('status', 'pending');
      if (pendingError) throw pendingError;

      const { count: totalCount, error: countError } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true });
      if (countError) throw countError;

      const uniquePendingGroups = new Set(pendingData?.map(b => b.group_id));
      const totalPendingValue = pendingData?.reduce((acc, curr) => acc + (Number(curr.investment) || 0), 0) || 0;
      
      if (isMounted.current) {
        setGeneralStats({
          totalBetsAllTime: Math.floor((totalCount || 0) / 2),
          pendingBetsCount: uniquePendingGroups.size,
          pendingValue: totalPendingValue
        });
      }
    } catch (error) { console.error('Erro stats:', error); }
  };

  const fetchMonthBets = async () => {
    try {
      const startStr = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
      const endStr = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .gte('event_date', startStr)
        .lte('event_date', endStr)
        .order('event_date', { ascending: false })
        .order('event_time', { ascending: false })
        .range(0, 9999);
      if (error) throw error;
      if (isMounted.current) setBets(data || []);
    } catch (error) { console.error('Erro bets:', error); }
  };

  const groupBets = (betsList: Bet[]): GroupedBet[] => {
    const grouped: { [key: string]: GroupedBet } = {};
    betsList.forEach((bet) => {
      if (!bet) return;
      const groupIdSafe = bet.group_id || `single-${bet.id}`;
      const key = `${bet.event_date}-${bet.event_time}-${groupIdSafe}`;
      if (!grouped[key]) {
        let ts = 0;
        try { ts = new Date(`${bet.event_date}T${bet.event_time}`).getTime(); if (isNaN(ts)) ts = 0; } catch { ts = 0; }
        grouped[key] = { betA: null, betB: null, betC: null, betD: null, betE: null, key, timestamp: ts };
      }
      const g = grouped[key];
      if (bet.house_type === 'A') g.betA = bet;
      else if (bet.house_type === 'B') g.betB = bet;
      else if (bet.house_type === 'C') g.betC = bet;
      else if (bet.house_type === 'D') g.betD = bet;
      else if (bet.house_type === 'E') g.betE = bet;
    });
    return Object.values(grouped).sort((a, b) => b.timestamp - a.timestamp);
  };

  const groupedBets = groupBets(bets);
  const visibleBets = groupedBets.slice(0, visibleCount);
  const hasMoreBets = visibleCount < groupedBets.length;
  const loadMore = () => setVisibleCount(prev => prev + 50);
  const totalBetsThisMonth = groupedBets.length;

  // --- Handlers de Edição ---

  const handleEdit = (group: GroupedBet) => {
    setEditingGroupKey(group.key);
    setActiveSubEdits({}); // Reseta sub-edições
    const newEditForm: EditForm = {};
    [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean).forEach((bet) => {
      newEditForm[bet!.id] = {
        odds: bet!.odds,
        investment: getDisplayStake(bet!),
        status: bet!.status,
        market: bet!.market,
        cashout_amount: bet!.cashout_amount || undefined,
        increase_percentage: bet!.increase_percentage || 0,
        house_name: bet!.house_type === 'A' ? bet!.house_a : bet!.house_b,
        event_date: bet!.event_date,
        event_time: bet!.event_time,
      };
    });
    setEditForm(newEditForm);
  };

  const toggleSubEdit = (key: string) => {
    setActiveSubEdits(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async (group: GroupedBet) => {
    try {
      const betsToUpdate = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
      for (const bet of betsToUpdate) {
        const formData = editForm[bet.id];
        let dbInvestment = formData.investment;
        let dbReturn = formData.odds * formData.investment;

        if (bet.bet_mode === 'lay') {
          dbInvestment = formData.investment * (formData.odds - 1); 
          dbReturn = dbInvestment + formData.investment;
        } else if (bet.is_freebet) {
          dbInvestment = 0;
          dbReturn = (formData.odds - 1) * formData.investment;
        } else {
          const increase = formData.increase_percentage || 0;
          const finalOdds = formData.odds + (formData.odds - 1) * (increase / 100);
          dbReturn = formData.investment * finalOdds;
        }

        const updatePayload: any = {
          odds: formData.odds,
          investment: dbInvestment,
          dutching_investment: dbReturn,
          status: formData.status,
          market: formData.market,
          event_date: formData.event_date,
          event_time: formData.event_time,
          cashout_amount: formData.status === 'cashout' ? (formData.cashout_amount || null) : null,
          increase_percentage: formData.increase_percentage || 0
        };

        if (bet.house_type === 'A') updatePayload.house_a = formData.house_name;
        if (bet.house_type === 'B') updatePayload.house_b = formData.house_name;

        await supabase.from('bets').update(updatePayload).eq('id', bet.id);
      }
      await loadPageData();
      setEditingGroupKey(null);
      setEditForm({});
      setActiveSubEdits({});
    } catch { alert('Erro ao salvar.'); }
  };

  const handleDelete = async (group: GroupedBet) => {
    if (!confirm('Excluir aposta?')) return;
    try {
      const betIds = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean).map(b => b!.id);
      await supabase.from('bets').delete().in('id', betIds);
      setBets(prev => prev.filter(b => !betIds.includes(b.id)));
      fetchGeneralStats();
    } catch { console.error('Error deleting'); }
  };

  const handleInputChange = (betId: string, field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [betId]: { ...prev[betId], [field]: (field === 'status' || field === 'house_name' || field === 'market') ? value : Number(value) },
    }));
  };

  const handleGroupInputChange = (group: GroupedBet, field: string, value: string) => {
    const betIds = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean).map(b => b!.id);
    setEditForm(prev => {
      const newState = { ...prev };
      betIds.forEach(id => { if (newState[id]) newState[id] = { ...newState[id], [field]: value }; });
      return newState;
    });
  };

  const formatDateTime = (date: string, time: string) => {
    if (!date) return '-';
    try {
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      return `${format(dateObj, "dd/MM/yyyy", { locale: ptBR })} às ${time.slice(0, 5)}`;
    } catch { return date; }
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

  const getStatusText = (status: string) => status === 'won' ? 'Ganhou' : status === 'lost' ? 'Perdeu' : status === 'returned' ? 'Devolvida' : status === 'cashout' ? 'Cashout' : 'Pendente';
  const showCashoutColumn = groupedBets.some(group => {
    const bets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
    return editingGroupKey === group.key ? bets.some(b => editForm[b.id]?.status === 'cashout') : bets.some(b => b.status === 'cashout');
  });

  const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));
  const monthLabel = format(selectedDate, 'MMMM yyyy', { locale: ptBR });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Planilha de Apostas</h1>
        <div className="flex items-center gap-3">
           <div className="flex items-center bg-white dark:bg-dark-800 rounded-lg p-1 border border-gray-200 dark:border-dark-600 shadow-sm">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors text-gray-600 dark:text-gray-300"><ChevronLeft className="w-5 h-5" /></button>
              <div className="flex items-center gap-2 px-4 min-w-[160px] justify-center border-x border-gray-100 dark:border-dark-700">
                 <Calendar className="w-4 h-4 text-purple-500" />
                 <span className="text-sm font-medium capitalize text-gray-800 dark:text-gray-200 select-none">{monthLabel}</span>
              </div>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md transition-colors text-gray-600 dark:text-gray-300"><ChevronRight className="w-5 h-5" /></button>
           </div>
           
           <button onClick={() => navigate('/new-bet')} className={`flex items-center gap-2 py-2.5 px-4 rounded-lg hover:opacity-90 transition-colors shadow-sm ${isDark ? 'bg-[#2e2e33] text-[#b0b0b5] hover:bg-[#3a3a3f]' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nova Aposta</span>
          </button>
        </div>
      </div>

      {errorMsg && <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded flex items-center gap-2"><AlertCircle className="w-5 h-5" />{errorMsg}</div>}

      {/* Cards Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Total de Apostas</p><p className="text-xs text-gray-400">(Geral)</p><p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-1">{generalStats.totalBetsAllTime}</p></div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full"><Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Apostas do Mês</p><p className="text-xs text-purple-500 capitalize">({monthLabel.split(' ')[0]})</p><p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-1">{totalBetsThisMonth}</p></div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full"><Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Apostas Pendentes</p><p className="text-xs text-yellow-500">(Em aberto)</p><p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-1">{generalStats.pendingBetsCount}</p></div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full"><Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" /></div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Valores Pendentes</p><p className="text-xs text-green-500">(Investido)</p><p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-1">{formatCurrency(generalStats.pendingValue)}</p></div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full"><TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" /></div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-50 dark:bg-dark-750 px-6 py-3 border-b border-gray-200 dark:border-dark-600 flex justify-between items-center">
           <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Archive className="w-4 h-4" />Registros de <span className="text-purple-600 dark:text-purple-400 capitalize">{monthLabel}</span></h3>
           {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-dark-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Casa</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Odds</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aum. %</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Investimento</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Retorno</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                {showCashoutColumn && <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Cashout</th>}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
              {visibleBets.length === 0 && !loading ? (
                <tr><td colSpan={showCashoutColumn ? 9 : 8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"><div className="flex flex-col items-center gap-2"><Archive className="w-8 h-8 text-gray-300" /><p>Nenhuma aposta encontrada para {monthLabel}.</p></div></td></tr>
              ) : (
                visibleBets.map((group) => {
                const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
                const mainBet = getMainBet(group);
                if (!mainBet) return null;

                // Verificação crítica: Esta linha está sendo editada?
                const isEditingThisGroup = editingGroupKey === group.key;

                return (
                  <React.Fragment key={group.key}>
                    {allBets.map((bet, index) => (
                      <tr key={bet.id}>
                        {index === 0 && (
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 align-top min-w-[160px]" rowSpan={allBets.length}>
                            <div className="space-y-2">
                              {/* DATA E HORA */}
                              <div className="flex items-center gap-2 mb-1">
                                {isEditingThisGroup && activeSubEdits['date'] ? (
                                  <div className="flex gap-1 flex-1 animate-fade-in">
                                    <input 
                                      type="date"
                                      value={editForm[bet.id]?.event_date || ''}
                                      onChange={(e) => handleGroupInputChange(group, 'event_date', e.target.value)}
                                      className="flex-1 min-w-0 p-1 text-xs border rounded bg-gray-50 dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-1 focus:ring-blue-500"
                                      autoFocus
                                    />
                                    <input 
                                      type="time"
                                      value={editForm[bet.id]?.event_time || ''}
                                      onChange={(e) => handleGroupInputChange(group, 'event_time', e.target.value)}
                                      className="w-[60px] p-1 text-xs border rounded bg-gray-50 dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-white dark:text-white font-medium">
                                      {formatDateTime(mainBet.event_date, mainBet.event_time)}
                                    </span>
                                    {/* LÁPIS DA DATA: Só aparece se o GRUPO estiver sendo editado */}
                                    {isEditingThisGroup && (
                                      <button 
                                        onClick={() => toggleSubEdit('date')} 
                                        className="text-blue-500 hover:text-blue-400 opacity-60 hover:opacity-100 transition-opacity"
                                        title="Editar Data/Hora"
                                      >
                                        <PenLine className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="text-xs space-y-1">
                                <div className="font-medium"><span className="text-white dark:text-white">Lucro:</span> <span className={calculateGroupProfit(group) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{formatCurrency(calculateGroupProfit(group))}</span></div>
                                <div className="font-medium"><span className="text-white dark:text-white">ROI:</span> <span className={calculateGroupROI(group) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{calculateGroupROI(group).toFixed(2)}%</span></div>
                                
                                {/* MERCADO */}
                                <div className="font-medium flex items-center gap-2">
                                  <span className="text-white dark:text-white whitespace-nowrap">Mercado:</span>
                                  {isEditingThisGroup && activeSubEdits['market'] ? (
                                    <input 
                                      type="text"
                                      value={editForm[bet.id]?.market || ''}
                                      onChange={(e) => handleGroupInputChange(group, 'market', e.target.value)}
                                      className="w-full p-1 text-xs border rounded bg-gray-50 dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-1 focus:ring-blue-500 animate-fade-in"
                                      placeholder="Ex: Handicap"
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-blue-400 dark:text-blue-300 truncate max-w-[120px]">
                                        {bet.market || 'Não especificado'}
                                      </span>
                                      {/* LÁPIS DO MERCADO: Só aparece se o GRUPO estiver sendo editado */}
                                      {isEditingThisGroup && (
                                        <button 
                                          onClick={() => toggleSubEdit('market')} 
                                          className="text-blue-500 hover:text-blue-400 opacity-60 hover:opacity-100 transition-opacity"
                                          title="Editar Mercado"
                                        >
                                          <PenLine className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        )}
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 align-middle">
                          <div className="flex items-center gap-2">
                            {/* NOME DA CASA */}
                            {isEditingThisGroup && activeSubEdits[`house_${bet.id}`] ? (
                              <input 
                                type="text"
                                value={editForm[bet.id]?.house_name || ''}
                                onChange={(e) => handleInputChange(bet.id, 'house_name', e.target.value)}
                                className="w-32 p-1.5 text-sm border rounded bg-gray-50 dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-1 focus:ring-blue-500 animate-fade-in"
                                autoFocus
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>{bet.house_type === 'A' ? bet.house_a : bet.house_b}</span>
                                {/* LÁPIS DA CASA: Só aparece se o GRUPO estiver sendo editado */}
                                {isEditingThisGroup && (
                                  <button 
                                    onClick={() => toggleSubEdit(`house_${bet.id}`)} 
                                    className="text-blue-500 hover:text-blue-400 opacity-60 hover:opacity-100 transition-opacity"
                                    title="Editar Casa"
                                  >
                                    <PenLine className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                            
                            {bet.is_freebet && <span title="Aposta Grátis"><Gift className="w-4 h-4 text-green-500" /></span>}
                            {bet.bet_mode === 'lay' && <span title="Aposta Lay"><RefreshCw className="w-4 h-4 text-pink-500" /></span>}
                          </div>
                        </td>

                        {/* COLUNAS DE EDIÇÃO DIRETA (ODDS E STAKE) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-white align-middle">
                          {isEditingThisGroup ? (
                            <input
                              type="number"
                              value={editForm[bet.id]?.odds || bet.odds}
                              onChange={(e) => handleInputChange(bet.id, 'odds', e.target.value)}
                              step="0.001" min="1"
                              className="w-20 p-1 text-right border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-1 focus:ring-blue-500"
                            />
                          ) : formatOdds(bet.odds)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-white align-middle">
                          {isEditingThisGroup && bet.bet_mode !== 'lay' ? (
                            <input
                              type="number"
                              value={editForm[bet.id]?.increase_percentage !== undefined ? editForm[bet.id].increase_percentage : (bet.increase_percentage || 0)}
                              onChange={(e) => handleInputChange(bet.id, 'increase_percentage', e.target.value)}
                              step="1" min="0"
                              className="w-16 p-1 text-right border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            (bet.increase_percentage && bet.increase_percentage > 0) ? <span className="text-purple-400 font-medium">{bet.increase_percentage}%</span> : <span className="text-gray-500">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-white align-middle">
                          {isEditingThisGroup ? (
                            <input
                              type="number"
                              value={editForm[bet.id]?.investment || getDisplayStake(bet)}
                              onChange={(e) => handleInputChange(bet.id, 'investment', e.target.value)}
                              step="0.01" min="0"
                              className="w-24 p-1 text-right border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-1 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {formatCurrency(getDisplayStake(bet))}
                              {bet.bet_mode === 'lay' && <div className="group relative flex items-center"><span title={`Responsabilidade: ${formatCurrency(bet.investment)}`}><HelpCircle className="w-4 h-4 text-gray-400 cursor-help" /></span></div>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-white align-middle">
                          {formatCurrency(calculateBetReturn(bet))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center align-middle">
                          {isEditingThisGroup ? (
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
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bet.status)}`}>{getStatusText(bet.status)}</span>
                          )}
                        </td>
                        {showCashoutColumn && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center align-middle">
                            {isEditingThisGroup ? (
                              (editForm[bet.id]?.status === 'cashout') ? (
                                <input
                                  type="number"
                                  value={editForm[bet.id]?.cashout_amount !== undefined ? editForm[bet.id]?.cashout_amount : ''}
                                  onChange={(e) => handleInputChange(bet.id, 'cashout_amount', e.target.value)}
                                  step="0.01" min="0"
                                  className="w-24 p-1 text-center border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white text-xs focus:ring-1 focus:ring-blue-500"
                                />
                              ) : <span className="text-gray-400">-</span>
                            ) : (
                              bet.status === 'cashout' ? <span className="text-purple-600 dark:text-purple-400 font-medium">{formatCurrency(bet.cashout_amount || 0)}</span> : <span className="text-gray-400">-</span>
                            )}
                          </td>
                        )}
                        {index === 0 && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right align-middle" rowSpan={allBets.length}>
                            <div className="flex items-center justify-end space-x-2">
                              {isEditingThisGroup ? (
                                <>
                                  <button onClick={() => handleSave(group)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="Salvar"><Save className="w-5 h-5" /></button>
                                  <button onClick={() => { setEditingGroupKey(null); setEditForm({}); setActiveSubEdits({}); }} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300" title="Cancelar"><X className="w-5 h-5" /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleEdit(group)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Editar"><Edit2 className="w-5 h-5" /></button>
                                  <button onClick={() => handleDelete(group)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Excluir"><Trash2 className="w-5 h-5" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                    <tr className="h-2 bg-gray-50 dark:bg-dark-900"><td colSpan={showCashoutColumn ? 9 : 8}></td></tr>
                  </React.Fragment>
                );
              })
              )}
            </tbody>
          </table>
          
          {hasMoreBets && (
             <div className="p-4 text-center border-t border-gray-200 dark:border-dark-700">
               <button onClick={loadMore} className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
                 Carregar mais... <span className="ml-2 text-xs opacity-70">({visibleCount} de {groupedBets.length})</span>
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
