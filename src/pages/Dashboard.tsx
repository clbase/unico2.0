import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay, subDays, startOfWeek, endOfWeek, startOfToday, eachHourOfInterval, startOfHour, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Target, Calculator, Clock, CheckCircle2, Gift, Trophy, Settings, Shield, Calendar } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Earning } from '../types/earnings';
import { formatCurrency } from '../utils/currency';
import { ProfitConfigModal } from '../components/dashboard/ProfitConfigModal';
import { MetaConfigModal } from '../components/dashboard/MetaConfigModal';
import { PeriodConfigModal, PeriodConfig } from '../components/dashboard/PeriodConfigModal';

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
  odds: number;
  created_at: string;
  market: string;
  cashout_amount?: number;
}

interface ChartData {
  date: string;
  lucro: number;
  resultado: number;
  investimento: number;
}

interface GroupedBet {
  betA: Bet;
  betB: Bet | null;
  betC: Bet | null;
  betD: Bet | null;
  betE: Bet | null;
  key: string;
}

interface ProfitConfig {
  showSureProfit: boolean;
  showEarningsProfit: boolean;
}

interface MetaConfig {
  type: 'month';
  value: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-purple-500/20">
        <p className="text-sm font-semibold text-white mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-purple-300">
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard: React.FC = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7days' | '14days' | '30days'>('7days');
  const [showProfitConfigModal, setShowProfitConfigModal] = useState(false);
  const [showMetaConfigModal, setShowMetaConfigModal] = useState(false);
  const [showPeriodConfigModal, setShowPeriodConfigModal] = useState(false);
  const [periodConfig, setPeriodConfig] = useState<PeriodConfig>({
    type: 'general'
  });
  const [profitConfig, setProfitConfig] = useState<ProfitConfig>({
    showSureProfit: true,
    showEarningsProfit: false
  });
  const [metaConfig, setMetaConfig] = useState<MetaConfig>({
    type: 'month',
    value: 10000
  });
  const { isDark } = useTheme();

  useEffect(() => {
    fetchData();
    loadProfitConfig();
    loadMetaConfig();
    loadPeriodConfigFromDB();
  }, []);

  const loadProfitConfig = () => {
    const saved = localStorage.getItem('dashboard-profit-config');
    if (saved) {
      try {
        setProfitConfig(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading profit config:', error);
      }
    }
  };

  const loadMetaConfig = () => {
    const saved = localStorage.getItem('dashboard-meta-config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        // Ensure it's always month type
        setMetaConfig({ type: 'month', value: config.value || 10000 });
      } catch (error) {
        console.error('Error loading meta config:', error);
      }
    }
  };

  const loadPeriodConfigFromDB = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('get_user_preferences');

      if (error) {
        console.error('Error loading period config:', error);
        return;
      }

      if (data && data.length > 0) {
        const prefs = data[0];
        const config: PeriodConfig = {
          type: prefs.period_type || 'general',
          month: prefs.period_month || undefined,
          year: prefs.period_year || undefined
        };
        setPeriodConfig(config);
      }
    } catch (error) {
      console.error('Error loading period config:', error);
    }
  };

  const saveProfitConfig = (config: ProfitConfig) => {
    setProfitConfig(config);
    localStorage.setItem('dashboard-profit-config', JSON.stringify(config));
  };

  const saveMetaConfig = (config: MetaConfig) => {
    setMetaConfig(config);
    localStorage.setItem('dashboard-meta-config', JSON.stringify(config));
  };

  const savePeriodConfig = async (config: PeriodConfig) => {
    try {
      setPeriodConfig(config);

      const { error } = await supabase
        .rpc('update_period_config', {
          p_type: config.type,
          p_month: config.month || null,
          p_year: config.year || null
        });

      if (error) {
        console.error('Error saving period config:', error);
        alert('Erro ao salvar configuração de período. Tente novamente.');
      }
    } catch (error) {
      console.error('Error saving period config:', error);
      alert('Erro ao salvar configuração de período. Tente novamente.');
    }
  };

  const fetchData = async () => {
    try {
      // Fetch bets
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select('*')
        .order('event_date', { ascending: false })
        .order('event_time', { ascending: false })
        .order('created_at', { ascending: true });

      if (betsError) throw betsError;

      // Fetch earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('earnings')
        .select('*')
        .order('event_date', { ascending: false })
        .order('event_time', { ascending: false });

      if (earningsError) throw earningsError;

      setBets(betsData || []);
      setEarnings(earningsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBetReturn = (bet: Bet): number => {
    switch (bet.status) {
      case 'won':
        return bet.dutching_investment;
      case 'returned':
        return bet.investment;
      case 'cashout':
        return bet.cashout_amount || 0;
      case 'lost':
        return 0;
      default:
        return 0;
    }
  };

  const calculateGroupProfit = (group: GroupedBet): number => {
    const bets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
    
    if (bets.some(bet => bet.status === 'pending')) {
      return 0;
    }
    
    const totalInvestment = bets.reduce((sum, bet) => sum + bet.investment, 0);
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

  const getFilteredDateRange = () => {
    const now = new Date();
    switch (periodConfig.type) {
      case 'current_month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'last_30':
        return {
          start: subDays(now, 30),
          end: now
        };
      case 'specific_month':
        if (periodConfig.month && periodConfig.year) {
          const date = new Date(periodConfig.year, periodConfig.month - 1, 1);
          return {
            start: startOfMonth(date),
            end: endOfMonth(date)
          };
        }
        return null;
      case 'general':
      default:
        return null;
    }
  };

  const isDateInRange = (dateStr: string): boolean => {
    const dateRange = getFilteredDateRange();
    if (!dateRange) return true;

    // Parse date as YYYY-MM-DD in local timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    // Get start and end dates in local timezone (start of day)
    const startDate = startOfDay(dateRange.start);
    const endDate = startOfDay(dateRange.end);
    const checkDate = startOfDay(date);

    return checkDate >= startDate && checkDate <= endDate;
  };

  const calculateStats = () => {
    const groupedBets = groupBets(bets);
    let totalInvestment = 0;
    let totalReturn = 0;
    let resolvedCount = 0;
    let totalCount = groupedBets.length;
    let pendingInvestment = 0;

    groupedBets.forEach((group) => {
      if (!isDateInRange(group.betA.event_date)) return;

      const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
      const allResolved = allBets.every(bet => bet.status !== 'pending');
      const groupInvestment = allBets.reduce((sum, bet) => sum + bet.investment, 0);

      if (allResolved) {
        resolvedCount++;
        totalInvestment += groupInvestment;
        totalReturn += allBets.reduce((sum, bet) => sum + calculateBetReturn(bet), 0);
      } else {
        pendingInvestment += groupInvestment;
      }
    });

    // Calculate earnings separately (not included in ROI)
    const earningsProfit = earnings
      .filter(e => e.type === 'profit' && isDateInRange(e.event_date))
      .reduce((sum, e) => sum + e.amount, 0);

    const earningsLoss = earnings
      .filter(e => e.type === 'loss' && isDateInRange(e.event_date))
      .reduce((sum, e) => sum + e.amount, 0);

    const earningsNetProfit = earningsProfit - earningsLoss;

    // ROI calculation only for bets (not including earnings)
    const betsProfitLoss = totalReturn - totalInvestment;
    const roi = totalInvestment > 0 ? (betsProfitLoss / totalInvestment) * 100 : 0;

    // Calculate combined profit based on config
    let combinedProfit = 0;
    if (profitConfig.showSureProfit) combinedProfit += betsProfitLoss;
    if (profitConfig.showEarningsProfit) combinedProfit += earningsNetProfit;

    return {
      totalInvestment,
      roi,
      betsProfitLoss, // Only from bets
      totalBets: totalCount,
      resolvedBets: resolvedCount,
      pendingBets: totalCount - resolvedCount,
      pendingInvestment,
      earningsNetProfit, // Net profit from earnings tab
      combinedProfit
    };
  };

  const calculateMetaProgress = () => {
    const dateRange = getFilteredDateRange();
    const now = new Date();
    const startDate = dateRange?.start || startOfMonth(now);
    const endDate = dateRange?.end || endOfMonth(now);

    // Calculate profit for the selected period from bets
    const groupedBets = groupBets(bets);
    let monthProfit = 0;

    groupedBets.forEach((group) => {
      const [year, month, day] = group.betA.event_date.split('-').map(Number);
      const betDate = startOfDay(new Date(year, month - 1, day));
      const checkStartDate = startOfDay(startDate);
      const checkEndDate = startOfDay(endDate);

      if (betDate >= checkStartDate && betDate <= checkEndDate) {
        const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
        const allResolved = allBets.every(bet => bet.status !== 'pending');

        if (allResolved) {
          monthProfit += calculateGroupProfit(group);
        }
      }
    });

    // Add earnings for the selected period
    earnings.forEach(earning => {
      const [year, month, day] = earning.event_date.split('-').map(Number);
      const earningDate = startOfDay(new Date(year, month - 1, day));
      const checkStartDate = startOfDay(startDate);
      const checkEndDate = startOfDay(endDate);

      if (earningDate >= checkStartDate && earningDate <= checkEndDate) {
        monthProfit += earning.type === 'profit' ? earning.amount : -earning.amount;
      }
    });

    const progress = metaConfig.value > 0 ? Math.max(0, Math.min(100, (monthProfit / metaConfig.value) * 100)) : 0;

    let monthName = '';
    if (periodConfig.type === 'specific_month' && periodConfig.month && periodConfig.year) {
      const date = new Date(periodConfig.year, periodConfig.month - 1, 1);
      monthName = format(date, 'MMMM', { locale: ptBR });
    } else {
      monthName = format(startDate, 'MMMM', { locale: ptBR });
    }

    return {
      current: Math.max(0, monthProfit),
      target: metaConfig.value,
      progress,
      monthName,
      year: periodConfig.type === 'specific_month' && periodConfig.year ? periodConfig.year : new Date().getFullYear()
    };
  };

  const getPeriodDays = (period: string): number => {
    switch (period) {
      case 'today': return 1;
      case '7days': return 7;
      case '14days': return 14;
      case '30days': return 30;
      default: return 7;
    }
  };

  const prepareChartData = (days: number): ChartData[] => {
    // Para "hoje", mostrar por hora
    if (selectedPeriod === 'today') {
      return prepareHourlyChartData();
    }

    // Para outros períodos, mostrar por dia
    const dailyProfits = new Map<string, number>();

    const dateRange = getFilteredDateRange();
    let startDate: Date;
    let endDate: Date;

    if (dateRange) {
      startDate = dateRange.start;
      endDate = dateRange.end;
    } else {
      const today = startOfDay(new Date());
      endDate = today;
      startDate = startOfDay(new Date(today));
      startDate.setDate(startDate.getDate() - (days - 1));
    }

    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    dates.forEach(date => {
      dailyProfits.set(format(date, 'yyyy-MM-dd'), 0);
    });

    // Add bet profits
    const groupedBets = groupBets(bets);
    groupedBets.forEach(group => {
      const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
      const allResolved = allBets.every(bet => bet.status !== 'pending');

      if (allResolved) {
        const profit = calculateGroupProfit(group);
        if (dailyProfits.has(group.betA.event_date)) {
          dailyProfits.set(
            group.betA.event_date, 
            (dailyProfits.get(group.betA.event_date) || 0) + profit
          );
        }
      }
    });

    // Add earnings profits
    earnings.forEach(earning => {
      if (dailyProfits.has(earning.event_date)) {
        const profit = earning.type === 'profit' ? earning.amount : -earning.amount;
        dailyProfits.set(
          earning.event_date,
          (dailyProfits.get(earning.event_date) || 0) + profit
        );
      }
    });

    return dates.map(date => ({
      date: format(date, 'dd/MM'),
      lucro: dailyProfits.get(format(date, 'yyyy-MM-dd')) || 0,
      resultado: 0,
      investimento: 0
    }));
  };

  const prepareHourlyChartData = (): ChartData[] => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const hourlyProfits = new Map<string, number>();
    
    // Criar todas as horas do dia (00:00 a 23:00)
    for (let hour = 0; hour < 24; hour++) {
      const hourKey = hour.toString().padStart(2, '0');
      hourlyProfits.set(hourKey, 0);
    }

    // Calcular lucros das apostas por hora
    const groupedBets = groupBets(bets);
    groupedBets.forEach(group => {
      if (group.betA.event_date === today) {
        const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
        const allResolved = allBets.every(bet => bet.status !== 'pending');

        if (allResolved) {
          const profit = calculateGroupProfit(group);
          const hour = group.betA.event_time.split(':')[0];
          hourlyProfits.set(hour, (hourlyProfits.get(hour) || 0) + profit);
        }
      }
    });

    // Adicionar lucros dos earnings por hora
    earnings.forEach(earning => {
      if (earning.event_date === today) {
        const profit = earning.type === 'profit' ? earning.amount : -earning.amount;
        const hour = earning.event_time.split(':')[0];
        hourlyProfits.set(hour, (hourlyProfits.get(hour) || 0) + profit);
      }
    });

    // Converter para array ordenado
    return Array.from({ length: 24 }, (_, index) => {
      const hour = index.toString().padStart(2, '0');
      return {
        date: `${hour}:00`,
        lucro: hourlyProfits.get(hour) || 0,
        resultado: 0,
        investimento: 0
      };
    });
  };

  const formatDateTime = (date: string, time: string) => {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const dateObj = new Date(year, month - 1, day, hours, minutes);
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getBetStatus = (group: GroupedBet): string => {
    const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
    return allBets.every(bet => bet.status !== 'pending') ? 'resolvido' : 'pending';
  };

  const getStatusText = (status: string) => {
    return status === 'resolvido' ? 'Resolvido' : 'Pendente';
  };

  const getProfitCardTitle = () => {
    if (profitConfig.showSureProfit && profitConfig.showEarningsProfit) {
      return 'Lucro Total (Sure + Extras)';
    } else if (profitConfig.showSureProfit) {
      return 'Lucro Total - Sure';
    } else if (profitConfig.showEarningsProfit) {
      return 'Lucro Total - Extras';
    }
    return 'Lucro Total';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const stats = calculateStats();
  const chartData = prepareChartData(getPeriodDays(selectedPeriod));
  const groupedBets = groupBets(bets);
  const metaProgress = calculateMetaProgress();

  // Combine recent bets and earnings for display
  const recentItems = [
    ...groupedBets.map(group => ({
      type: 'bet' as const,
      date: group.betA.event_date,
      time: group.betA.event_time,
      description: `${group.betA.house_a} X ${group.betB?.house_b || ''} ${group.betC ? `X ${group.betC.house_b}` : ''}`,
      amount: [group.betA, group.betB, group.betC, group.betD, group.betE]
        .filter(Boolean)
        .reduce((sum, bet) => sum + bet!.investment, 0),
      status: getBetStatus(group),
      market: group.betA.market,
    })),
    ...earnings.map(earning => ({
      type: 'earning' as const,
      date: earning.event_date,
      time: earning.event_time,
      description: `${earning.house_name}`,
      amount: earning.amount,
      status: 'resolvido',
      market: null,
      earningType: earning.type,
    }))
  ].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return b.time.localeCompare(a.time);
  }).slice(0, 10);

  const periodButtons = [
    { key: 'today', label: 'Hoje' },
    { key: '7days', label: '7 dias' },
    { key: '14days', label: '14 dias' },
    { key: '30days', label: '30 dias' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className={`text-2xl sm:text-3xl font-bold ${
          isDark
            ? 'bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent'
            : 'text-gray-800'
        }`}>
          Dashboard
        </h1>
        <button
          onClick={() => setShowPeriodConfigModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isDark
              ? 'bg-[#7200C9] hover:bg-[#8514db] text-white'
              : 'bg-purple-500 hover:bg-purple-600 text-white'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-sm font-medium">
            {periodConfig.type === 'general'
              ? 'Geral'
              : periodConfig.type === 'current_month'
              ? 'Mês Atual'
              : periodConfig.type === 'last_30'
              ? 'Últimos 30D'
              : periodConfig.month && periodConfig.year
              ? `${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][periodConfig.month - 1]}/${periodConfig.year}`
              : 'Mês Específico'
            }
          </span>
        </button>
      </div>

      {/* Top Cards Row - Main Stats - Altura Reduzida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Investido Card */}
        <div className={`p-3 sm:p-4 rounded-2xl border shadow-xl h-[100px] sm:h-[120px] ${
          isDark 
            ? 'bg-[#1a1a1d] backdrop-blur-sm border-gray-700/50' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-[#7200C9]/20 rounded-lg">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-[#7200C9]" />
            </div>
            <h3 className={`text-sm sm:text-lg font-semibold truncate ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              Total Investido
            </h3>
          </div>
          <p className={`text-lg sm:text-2xl font-bold truncate ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            {formatCurrency(stats.totalInvestment)}
          </p>
        </div>

        {/* ROI Card */}
        <div className={`p-3 sm:p-4 rounded-2xl border shadow-xl h-[100px] sm:h-[120px] ${
          isDark 
            ? 'bg-[#1a1a1d] backdrop-blur-sm border-gray-700/50' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-[#7200C9]/20 rounded-lg">
              {stats.roi >= 0 ? (
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#7200C9]" />
              ) : (
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#7200C9]" />
              )}
            </div>
            <h3 className={`text-sm sm:text-lg font-semibold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              ROI
            </h3>
          </div>
          <p className={`text-lg sm:text-2xl font-bold ${
            stats.roi >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {stats.roi.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
          </p>
        </div>

        {/* Lucro Total Card with Config - Layout melhorado */}
        <div className={`p-3 sm:p-4 rounded-2xl border shadow-xl h-[100px] sm:h-[120px] ${
          isDark 
            ? 'bg-[#1a1a1d] backdrop-blur-sm border-gray-700/50' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="p-1.5 sm:p-2 bg-[#7200C9]/20 rounded-lg flex-shrink-0">
                {stats.combinedProfit >= 0 ? (
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#7200C9]" />
                ) : (
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#7200C9]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`text-xs sm:text-sm font-semibold leading-tight ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Lucro Total
                </h3>
                <p className={`text-xs leading-tight ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {profitConfig.showSureProfit && profitConfig.showEarningsProfit 
                    ? 'Sure + Extras'
                    : profitConfig.showSureProfit 
                    ? 'Sure'
                    : profitConfig.showEarningsProfit
                    ? 'Extras'
                    : 'Configurar'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowProfitConfigModal(true)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0 ${
                isDark 
                  ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              title="Configurar lucro total"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          <p className={`text-lg sm:text-2xl font-bold truncate ${
            stats.combinedProfit >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {formatCurrency(stats.combinedProfit)}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
        {/* Chart Section */}
        <div className="xl:col-span-3">
          <div className={`p-4 sm:p-6 rounded-2xl border shadow-xl h-[400px] sm:h-[500px] ${
            isDark 
              ? 'bg-[#1a1a1d] backdrop-blur-sm border-gray-700/50' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <h2 className={`text-lg sm:text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {selectedPeriod === 'today' ? 'Lucro por Hora (Hoje)' : 'Lucro por Período'}
              </h2>
              <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                {periodConfig.type === 'general' && periodButtons.map((button) => (
                  <button
                    key={button.key}
                    onClick={() => setSelectedPeriod(button.key as any)}
                    className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      selectedPeriod === button.key
                        ? 'bg-[#7200C9] text-white shadow-lg'
                        : isDark
                        ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7200C9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#7200C9" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10, fill: isDark ? '#9CA3AF' : '#6B7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: isDark ? '#9CA3AF' : '#6B7280' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatCurrency(value)}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="lucro"
                    stroke="#7200C9"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Side Cards - Alinhados com a altura exata do gráfico */}
        <div className="xl:col-span-1 flex flex-col h-[400px] sm:h-[500px] gap-6">
          {/* Meta Card - Altura proporcional (50% da altura total) */}
          <div className={`p-4 rounded-2xl border shadow-xl flex-1 flex flex-col ${
            isDark 
              ? 'bg-[#1a1a1d] backdrop-blur-sm border-gray-700/50' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#7200C9]/20 rounded-lg">
                  <Target className="w-5 h-5 text-[#7200C9]" />
                </div>
                <h3 className={`text-sm font-semibold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  Meta do Mês
                </h3>
              </div>
              <button
                onClick={() => setShowMetaConfigModal(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-700/50 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                title="Configurar meta"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {/* Progresso */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Progresso
                  </span>
                  <span className={`text-xs font-medium ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    {metaProgress.progress.toFixed(1)}%
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${metaProgress.progress}%`,
                      background: '#7200C9'
                    }}
                  ></div>
                </div>
              </div>

              {/* Valores */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Atual
                  </span>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    {formatCurrency(metaProgress.current)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Meta
                  </span>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    {formatCurrency(metaProgress.target)}
                  </span>
                </div>
              </div>

              {/* Mês */}
              <div className={`pt-3 border-t ${
                isDark ? 'border-gray-700/50' : 'border-gray-200'
              }`}>
                <p className={`text-xs text-center ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {metaProgress.monthName} de {metaProgress.year}
                </p>
              </div>
            </div>
          </div>

          {/* Recompensas Card - Coming Soon - Altura proporcional (50% da altura total) */}
          <div className={`relative p-4 rounded-2xl border shadow-xl overflow-hidden flex-1 flex flex-col ${
            isDark 
              ? 'bg-[#1a1a1d] backdrop-blur-sm border-gray-700/50' 
              : 'bg-white border-gray-200'
          }`}>
            {/* Heavy blur overlay - Desfoque muito mais intenso com cores adaptáveis ao tema */}
            <div className={`absolute inset-0 backdrop-blur-[12px] z-10 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-black/60' : 'bg-white/80'
            }`}>
              <div className="text-center">
                <Shield className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <h3 className={`text-sm sm:text-lg font-bold mb-1 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Em Breve
                </h3>
                <p className={`text-xs sm:text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Sistema de Prêmios
                </p>
              </div>
            </div>

            {/* Blurred content */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Gift className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className={`text-sm font-semibold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Recompensas
              </h3>
            </div>
            
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Progresso
                  </span>
                  <span className={`font-medium ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    R$ 0 / R$ 10.000
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  <div 
                    className="bg-gradient-to-r from-[#7200C9] to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: '0%' }}
                  ></div>
                </div>
              </div>
              
              <div className={`pt-3 border-t ${
                isDark ? 'border-gray-700/50' : 'border-gray-200'
              }`}>
                <p className={`text-xs text-center ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  0% para próxima recompensa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className={`rounded-2xl border shadow-xl overflow-hidden ${
        isDark 
          ? 'bg-[#1a1a1d] backdrop-blur-sm border-gray-700/50' 
          : 'bg-white border-gray-200'
      }`}>
        <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${
          isDark ? 'border-gray-700/50' : 'border-gray-200'
        }`}>
          <h2 className={`text-lg sm:text-xl font-bold text-center ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Atividades Recentes
          </h2>
        </div>
        <div className={`divide-y ${
          isDark ? 'divide-gray-700/50' : 'divide-gray-200'
        }`}>
          {recentItems.map((item, index) => (
            <div 
              key={`${item.type}-${index}`}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700/20' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col mb-2 sm:mb-0 min-w-0 flex-1">
                <span className={`text-xs sm:text-sm font-medium truncate ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  {formatDateTime(item.date, item.time)}
                </span>
                <span className={`text-xs sm:text-sm mt-1 truncate ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {item.description}
                </span>
                {item.market && (
                  <div className="flex items-center gap-1 mt-1">
                    <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#7200C9] flex-shrink-0" />
                    <span className="text-xs text-[#7200C9] truncate">
                      {item.market}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                <span className={`text-xs sm:text-sm font-medium truncate ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  {item.type === 'bet' ? (
                    `Investimento: ${formatCurrency(item.amount)}`
                  ) : (
                    `${(item as any).earningType === 'profit' ? 'Lucro:' : 'Perda:'} ${formatCurrency(item.amount)}`
                  )}
                </span>
                <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  item.status === 'resolvido'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {getStatusText(item.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <ProfitConfigModal
        isOpen={showProfitConfigModal}
        onClose={() => setShowProfitConfigModal(false)}
        currentConfig={profitConfig}
        onSave={saveProfitConfig}
      />

      <MetaConfigModal
        isOpen={showMetaConfigModal}
        onClose={() => setShowMetaConfigModal(false)}
        currentConfig={metaConfig}
        onSave={saveMetaConfig}
      />

      <PeriodConfigModal
        isOpen={showPeriodConfigModal}
        onClose={() => setShowPeriodConfigModal(false)}
        currentConfig={periodConfig}
        onSave={savePeriodConfig}
      />
    </div>
  );
};