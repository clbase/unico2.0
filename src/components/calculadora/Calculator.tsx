import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calculator, Loader2, HelpCircle, LayoutDashboard, Send } from 'lucide-react';
import { DutchingCalculator } from './dutching/DutchingCalculator';
import { LimitationCalculator } from './limitation/LimitationCalculator';
import { AumentadaCalculator } from './aumentada/AumentadaCalculator';
import { LinkBanners } from './shared/LinkBanners';
import { AdBanner } from './shared/AdBanner';
import { Footer } from './shared/Footer';
import { Bet, LimitationBet, AumentadaBet, CalculatorType, LimitationCalcResult } from './types';
import { useTheme } from '../../contexts/ThemeContext';
import { useTabsColor } from '../../hooks/useTabsColor';
import { AppTour } from './shared/AppTour';
import { ShareButton } from './shared/ShareButton';

interface CalculatorComponentProps {
  initialState?: {
    type: CalculatorType;
    bets: Bet[] | LimitationBet[] | AumentadaBet[];
    totalStake?: number;
  } | null;
}

function CalculatorComponent({ initialState }: CalculatorComponentProps) {
  const { isDark, toggleTheme } = useTheme();
  const { tabsColor, isCustomColorActive, isLoading: isTabsLoading } = useTabsColor();
  
  const [isTourActive, setIsTourActive] = useState(false);

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
      <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
    </div>
  );

  const [activeTab, setActiveTab] = useState<CalculatorType>('dutching');
  const [totalStake, setTotalStake] = useState<number>(100);
  const [aumentadaTotalStake, setAumentadaTotalStake] = useState<number>(100);
  const [bets, setBets] = useState<Bet[]>([
    { odds: 0, stake: 0 },
    { odds: 0, stake: 0 },
  ]);
  const [limitationBets, setLimitationBets] = useState<LimitationBet[]>([
    { odds: 0, stake: 0, isEditing: true, isFreebet: false, betMode: 'back' },
    { odds: 0, stake: 0, isEditing: false, isFreebet: false, betMode: 'back' },
  ]);
  const [aumentadaBets, setAumentadaBets] = useState<AumentadaBet[]>([
    { odds: 0, stake: 0, increase: 0, isFixed: false },
    { odds: 0, stake: 0, increase: 0, isFixed: false },
  ]);

  const [isAutoCalculate, setIsAutoCalculate] = useState(true);
  
  // ----- FUNÇÕES DE CÁLCULO -----

  const calculateDutching = useCallback(() => {
    const validBets = bets.filter(bet => bet.odds > 0);
    if (validBets.length === 0 || totalStake <= 0) {
      if (bets.some(b => b.stake !== 0)) {
        setBets(bets.map(b => ({ ...b, stake: 0 })));
      }
      return;
    }
    let sumInverse = validBets.reduce((sum, bet) => sum + (1 / bet.odds), 0);
    const newBets = bets.map(bet => {
      if (bet.odds <= 0) return { ...bet, stake: 0 };
      const preciseStake = totalStake / (bet.odds * sumInverse);
      const roundedStake = Math.round(preciseStake * 100) / 100;
      return { ...bet, stake: roundedStake };
    });
    const totalCalculatedStake = newBets.reduce((sum, bet) => sum + bet.stake, 0);
    const difference = totalStake - totalCalculatedStake;
    if (difference !== 0) {
      const lastValidBetIndex = newBets.map(bet => bet.odds > 0).lastIndexOf(true);
      if (lastValidBetIndex >= 0) {
        newBets[lastValidBetIndex].stake = +(newBets[lastValidBetIndex].stake + difference).toFixed(2);
      }
    }
    if (JSON.stringify(bets) !== JSON.stringify(newBets)) {
      setBets(newBets);
    }
  }, [bets, totalStake]);

  const calculateAumentada = useCallback(() => {
    const validBets = aumentadaBets.filter(bet => bet.odds > 0);
    if (validBets.length === 0) {
      if (aumentadaBets.some(b => b.stake !== 0)) {
        setAumentadaBets(aumentadaBets.map(b => ({ ...b, stake: 0 })));
      }
      return;
    }
    const fixedBet = validBets.find(bet => bet.isFixed);
    if (fixedBet) {
      const fixedReturn = (fixedBet.stake || 0) * (fixedBet.odds + (fixedBet.odds - 1) * (fixedBet.increase / 100));
      if (fixedReturn <= 0) {
        setAumentadaBets(aumentadaBets.map(b => ({ ...b, stake: (b.isFixed ? b.stake : 0) })));
        return;
      }
      const newBets = aumentadaBets.map(bet => {
        if (bet === fixedBet || bet.odds <= 0) return bet;
        const finalOdds = bet.odds + (bet.odds - 1) * (bet.increase / 100);
        if (finalOdds <= 0) return { ...bet, stake: 0 };
        const stake = +(fixedReturn / finalOdds).toFixed(2);
        return { ...bet, stake };
      });
      if (JSON.stringify(aumentadaBets) !== JSON.stringify(newBets)) {
        setAumentadaBets(newBets);
      }
    } else {
      if (aumentadaTotalStake <= 0) {
        if (aumentadaBets.some(b => b.stake !== 0)) {
          setAumentadaBets(aumentadaBets.map(b => ({ ...b, stake: 0 })));
        }
        return;
      }
      const stakePerBet = aumentadaTotalStake / validBets.length;
      const newBets = aumentadaBets.map(bet => {
        if (bet.odds <= 0) return { ...bet, stake: 0 };
        return { ...bet, stake: stakePerBet };
      });
      if (JSON.stringify(aumentadaBets) !== JSON.stringify(newBets)) {
        setAumentadaBets(newBets);
      }
    }
  }, [aumentadaBets, aumentadaTotalStake]);
  
  const limitationCalculator = useCallback((): { newBets: LimitationBet[], calcResult: LimitationCalcResult } => {
    const bets = JSON.parse(JSON.stringify(limitationBets)) as LimitationBet[];
    const editingBet = bets.find(bet => bet.isEditing);

    let calcResult: LimitationCalcResult = {
      stakes: bets.map(b => b.stake),
      returns: bets.map(b => 0),
      totalReturn: 0,
      profit: 0,
      totalInvestment: 0,
      roi: 0,
      liability: 0
    };
    
    const totalInvestment = bets.reduce((sum, bet) => {
      const stakeVal = Number(bet.stake) || 0;
      return (bet.isFreebet || bet.betMode === 'lay') ? sum : sum + stakeVal;
    }, 0);
    calcResult.totalInvestment = totalInvestment;

    if (!isAutoCalculate) {
      const returns = bets.map(bet => {
        const stakeVal = Number(bet.stake) || 0;
        if (!bet.odds || stakeVal <= 0) return 0;
        
        if (bet.betMode === 'lay') {
          return stakeVal; 
        } else {
          return bet.isFreebet ? (bet.odds - 1) * stakeVal : bet.odds * stakeVal;
        }
      });

      const liability = bets.reduce((sum, bet) => {
        const stakeVal = Number(bet.stake) || 0;
        if (bet.betMode === 'lay' && stakeVal > 0 && (bet.layOdd || 0) > 0) {
          return sum + (stakeVal * ((bet.layOdd || 0) - 1));
        }
        return sum;
      }, 0);

      calcResult.stakes = bets.map(b => b.stake); 
      calcResult.returns = returns;
      calcResult.liability = liability;
      
      const possibleProfits = bets.map((_, index) => {
         return returns[index] - totalInvestment;
      });
      
      const validProfits = possibleProfits.filter((_, i) => bets[i].odds > 0);
      const minProfit = validProfits.length > 0 ? Math.min(...validProfits) : 0;
      
      calcResult.profit = minProfit;
      calcResult.totalReturn = minProfit + totalInvestment;
      calcResult.roi = totalInvestment > 0 ? (minProfit / totalInvestment) * 100 : 0;

      return { newBets: bets, calcResult };
    }

    if (!editingBet || !editingBet.stake || (editingBet.betMode === 'back' && editingBet.odds <= 0) || (editingBet.betMode === 'lay' && (editingBet.layOdd || 0) <= 0)) {
      const newBets = bets.map(b => b.isEditing ? b : { ...b, stake: 0 });
      return { newBets, calcResult };
    }

    const isExtractionMode = bets.some(b => b.betMode === 'lay');

    if (isExtractionMode) {
      const backBet = bets.find(b => b.betMode === 'back');
      const layBet = bets.find(b => b.betMode === 'lay');
      
      if (!backBet || !layBet) return { newBets: bets, calcResult };

      let backStake = Number(backBet.stake) || 0;
      let backOdd = backBet.odds;
      let layStake = Number(layBet.stake) || 0;
      let layOdd = (layBet.layOdd || 0);
      
      if (editingBet === backBet) {
        if (layOdd <= 0) return { newBets: bets, calcResult };
        if (backBet.isFreebet) {
          layStake = (backStake * (backOdd - 1)) / layOdd;
        } else {
          layStake = (backStake * backOdd) / layOdd;
        }
        layBet.stake = +layStake.toFixed(2);
      } else { 
        if (backOdd <= 0) return { newBets: bets, calcResult };
        if (backBet.isFreebet) {
          if (backOdd <= 1) return { newBets: bets, calcResult };
          backStake = (layStake * layOdd) / (backOdd - 1);
        } else {
          backStake = (layStake * layOdd) / backOdd;
        }
        backBet.stake = +backStake.toFixed(2);
      }
      
      const grossReturnBack = backStake * backOdd;
      const liability = layStake * (layOdd - 1);
      
      const totalInvestmentCalc = backBet.isFreebet ? 0 : backStake;
      
      let profitIfBackWins = 0;
      if (backBet.isFreebet) {
        profitIfBackWins = (grossReturnBack - backStake) - liability;
      } else {
        profitIfBackWins = grossReturnBack - backStake - liability;
      }
      
      const profitIfLayWins = layStake - totalInvestmentCalc;
      
      const profit = Math.min(profitIfBackWins, profitIfLayWins);
      const roi = totalInvestmentCalc > 0 ? (profit / totalInvestmentCalc) * 100 : 0;

      calcResult = {
        stakes: bets.map(b => b.stake),
        returns: [profitIfBackWins, profitIfLayWins],
        totalReturn: profit,
        profit: profit,
        totalInvestment: totalInvestmentCalc,
        roi: roi,
        liability: liability
      };
      
    } else {
      let editingStake = Number(editingBet.stake) || 0;
      let targetValue;
      if (editingBet.isFreebet) {
        targetValue = (editingBet.odds - 1) * editingStake;
      } else {
        targetValue = editingBet.odds * editingStake;
      }
      
      let totalInvestmentCalc = 0;
      const stakes: number[] = [];
      const returns: number[] = [];

      for (let i = 0; i < bets.length; i++) {
        const bet = bets[i];
        if (targetValue <= 0 || bet.odds <= 0) {
          bet.stake = (bet.isEditing ? bet.stake : 0);
        } else {
          let divisor = bet.isFreebet ? (bet.odds - 1) : bet.odds;
          if (divisor <= 0) {
            bet.stake = 0;
          } else {
            bet.stake = (bet === editingBet) ? bet.stake : +(targetValue / divisor).toFixed(2);
          }
        }
        
        stakes.push(bet.stake);
        if (!bet.isFreebet) {
          totalInvestmentCalc += (Number(bet.stake) || 0);
        }
        
        returns.push(bet.isFreebet ? (bet.odds - 1) * (Number(bet.stake) || 0) : bet.odds * (Number(bet.stake) || 0));
      }
      
      const validReturns = returns.filter(r => r > 0);
      const totalReturn = validReturns.length > 0 ? Math.min(...validReturns) : 0;
      const profit = totalReturn - totalInvestmentCalc;
      const roi = totalInvestmentCalc > 0 ? (profit / totalInvestmentCalc) * 100 : 0;
      
      calcResult = { stakes, returns, totalReturn, profit, totalInvestment: totalInvestmentCalc, roi, liability: 0 };
    }

    const newBets = bets.map((bet, i) => ({
      ...bet,
      stake: calcResult.stakes[i] || 0,
      isEditing: bet === editingBet
    }));

    return { newBets, calcResult };
    
  }, [limitationBets, isAutoCalculate]);
  
  useEffect(() => {
    if (activeTab === 'dutching') {
      calculateDutching();
    } else if (activeTab === 'aumentada') {
      calculateAumentada();
    }
  }, [activeTab, calculateDutching, calculateAumentada]);
  
  const { newBets: calculatedLimitationBets, calcResult: limitationResult } = useMemo(() => {
    if (activeTab !== 'limitation') {
      return { 
        newBets: limitationBets, 
        calcResult: { stakes: [], returns: [], totalReturn: 0, profit: 0, totalInvestment: 0, roi: 0, liability: 0 } 
      };
    }
    return limitationCalculator();
  }, [limitationBets, activeTab, limitationCalculator]);

  useEffect(() => {
    if (activeTab === 'limitation') {
      if (JSON.stringify(limitationBets) !== JSON.stringify(calculatedLimitationBets)) {
        setLimitationBets(calculatedLimitationBets);
      }
    }
  }, [activeTab, calculatedLimitationBets, limitationBets]);

  useEffect(() => {
    if (!initialState) return;
    setActiveTab(initialState.type);
    switch (initialState.type) {
      case 'dutching':
        setBets(initialState.bets as Bet[]);
        if (initialState.totalStake) setTotalStake(initialState.totalStake);
        break;
      case 'limitation':
        setLimitationBets((initialState.bets as LimitationBet[]).map(bet => ({
          ...bet,
          isEditing: false,
          isFreebet: bet.isFreebet || false,
          betMode: bet.betMode || 'back'
        })));
        break;
      case 'aumentada':
        const augBets = initialState.bets as AumentadaBet[];
        const fixedBet = augBets.find(b => b.isFixed);
        if (fixedBet) {
          const fixedReturn = (fixedBet.stake || 0) * (fixedBet.odds + (fixedBet.odds - 1) * (fixedBet.increase / 100));
          const recalculatedBets = augBets.map(bet => {
            if (bet === fixedBet || bet.odds <= 0) return bet;
            const finalOdds = bet.odds + (bet.odds - 1) * (bet.increase / 100);
            const stake = finalOdds > 0 ? +(fixedReturn / finalOdds).toFixed(2) : 0;
            return { ...bet, stake };
          });
          setAumentadaBets(recalculatedBets);
        } else {
          setAumentadaBets(augBets);
          if (initialState.totalStake) setAumentadaTotalStake(initialState.totalStake);
        }
        break;
    }
  }, [initialState]);

  const formatOddsInput = (input: string, autoPunctuate: boolean = true): string => {
    if (!autoPunctuate) {
      const cleaned = input.replace(/[^\d.]/g, '');
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        return parts[0] + '.' + parts.slice(1).join('');
      }
      return cleaned;
    }
    if (input.endsWith('.')) {
      const numbers = input.slice(0, -1).replace(/[^\d]/g, '');
      return numbers + '.';
    }
    const numbers = input.replace(/[^\d]/g, '');
    if (numbers.length <= 2) return numbers;
    return numbers.slice(0, -2) + '.' + numbers.slice(-2);
  };

  const updateBet = (index: number, inputValue: string) => {
    const autoPunctuate = bets[index]?.autoPunctuate !== false;
    const formattedValue = formatOddsInput(inputValue, autoPunctuate);
    const numericValue = parseFloat(formattedValue) || 0;
    const newBets = [...bets];
    newBets[index] = { ...newBets[index], odds: numericValue, oddsInput: formattedValue };
    setBets(newBets);
  };

  const updateLimitationBet = (index: number, field: 'odds' | 'stake' | 'layOdd', value: string) => {
    const autoPunctuate = limitationBets[index]?.autoPunctuate !== false;
    const formattedValue = formatOddsInput(value, autoPunctuate);
    const numericValue = parseFloat(formattedValue) || 0;

    const newBets = [...limitationBets];
    newBets.forEach((bet, i) => bet.isEditing = (i === index));

    if (field === 'stake') {
      if (value === '') {
        newBets[index] = { ...newBets[index], stake: 0, stakeInput: '' };
      } else {
         const numericValueStake = parseFloat(value);
         newBets[index] = { ...newBets[index], stake: isNaN(numericValueStake) ? 0 : numericValueStake, stakeInput: value };
      }
    } else {
      if (field === 'odds') {
        newBets[index] = { ...newBets[index], odds: numericValue, oddsInput: formattedValue };
      } else if (field === 'layOdd') {
        newBets[index] = { ...newBets[index], layOdd: numericValue, layOddInput: formattedValue };
      }
    }
    
    setLimitationBets(newBets);
  };

  const updateAumentadaBet = (index: number, field: 'odds' | 'increase' | 'stake' | 'isFixed', value: string | boolean) => {
    const newBets = [...aumentadaBets];
    if (field === 'isFixed') {
      if (value === true && !newBets[index].isFixed) {
        const currentCalculatedStake = newBets[index].stake;
        newBets[index].stake = currentCalculatedStake;
      }
      newBets[index] = { ...newBets[index], [field]: value as boolean };
      if (value === true) {
        for (let i = 0; i < newBets.length; i++) {
          if (i !== index) newBets[i].isFixed = false;
        }
      }
    } else if (field === 'odds') {
      const autoPunctuate = aumentadaBets[index]?.autoPunctuate !== false;
      const formattedValue = formatOddsInput(value as string, autoPunctuate);
      newBets[index] = { ...newBets[index], odds: parseFloat(formattedValue) || 0, oddsInput: formattedValue };
    } else {
      newBets[index] = { ...newBets[index], [field]: parseFloat(value as string) || 0 };
    }
    setAumentadaBets(newBets);
  };

  const addNewBet = () => {
    if (activeTab === 'dutching' && bets.length < 5) {
      setBets([...bets, { odds: 0, stake: 0 }]);
    } else if (activeTab === 'limitation' && limitationBets.length < 5) {
      setLimitationBets([...limitationBets, { odds: 0, stake: 0, isEditing: false, isFreebet: false, betMode: 'back' }]);
    } else if (activeTab === 'aumentada' && aumentadaBets.length < 5) {
      setAumentadaBets([...aumentadaBets, { odds: 0, stake: 0, increase: 0, isFixed: false }]);
    }
  };

  const removeBet = (index: number) => {
    if (activeTab === 'dutching' && bets.length > 2) {
      const newBets = bets.filter((_, i) => i !== index);
      setBets(newBets);
    } else if (activeTab === 'limitation' && limitationBets.length > 2) {
      const newBets = limitationBets.filter((_, i) => i !== index);
      if (limitationBets[index].isEditing && newBets.length > 0) {
        newBets[0].isEditing = true;
      }
      setLimitationBets(newBets);
    } else if (activeTab === 'aumentada' && aumentadaBets.length > 2) {
      const newBets = aumentadaBets.filter((_, i) => i !== index);
      setAumentadaBets(newBets);
    }
  };

  const copyToClipboard = (value: number) => {
    navigator.clipboard.writeText(value.toFixed(2));
  };

  const resetCalculator = () => {
    if (activeTab === 'dutching') {
      setBets([ { odds: 0, stake: 0 }, { odds: 0, stake: 0 } ]);
      setTotalStake(0);
    } else if (activeTab === 'limitation') {
      setLimitationBets([
        { odds: 0, stake: 0, isEditing: true, isFreebet: false, betMode: 'back' },
        { odds: 0, stake: 0, isEditing: false, isFreebet: false, betMode: 'back' },
      ]);
    } else if (activeTab === 'aumentada') {
      setAumentadaBets([ { odds: 0, stake: 0, increase: 0, isFixed: false }, { odds: 0, stake: 0, increase: 0, isFixed: false } ]);
      setAumentadaTotalStake(0);
    }
  };

  const toggleAutoPunctuate = (index: number) => {
    if (activeTab === 'dutching') {
      const newBets = [...bets];
      newBets[index] = { ...newBets[index], autoPunctuate: newBets[index].autoPunctuate === false ? true : false };
      setBets(newBets);
    } else if (activeTab === 'limitation') {
      const newBets = [...limitationBets];
      newBets[index] = { ...newBets[index], autoPunctuate: newBets[index].autoPunctuate === false ? true : false };
      setLimitationBets(newBets);
    } else if (activeTab === 'aumentada') {
      const newBets = [...aumentadaBets];
      newBets[index] = { ...newBets[index], autoPunctuate: newBets[index].autoPunctuate === false ? true : false };
      setAumentadaBets(newBets);
    }
  };

  const toggleFreebet = (index: number) => {
    if (activeTab === 'limitation') {
      const newBets = [...limitationBets];
      newBets[index] = { ...newBets[index], isFreebet: !newBets[index].isFreebet };
      setLimitationBets(newBets);
    }
  };
  
  const toggleBetMode = (index: number) => {
    if (activeTab === 'limitation') {
      const newBets = [...limitationBets];
      const currentMode = newBets[index].betMode;
      
      newBets[index] = {
        ...newBets[index],
        betMode: currentMode === 'back' ? 'lay' : 'back',
      };
      
      if (newBets[index].betMode === 'lay') {
        for (let i = 0; i < newBets.length; i++) {
          if (i !== index) {
            newBets[i].betMode = 'back';
          }
        }
      }
      setLimitationBets(newBets);
    }
  };
  
  const toggleAutoCalculate = () => {
    setIsAutoCalculate(!isAutoCalculate);
  };

  const generatePlanilhaUrl = () => {
    let betsToExport: any[] = [];

    if (activeTab === 'dutching') {
      betsToExport = bets;
    } else if (activeTab === 'limitation') {
      // --- CORREÇÃO AQUI: ADICIONAR NOVOS PARÂMETROS ---
      betsToExport = limitationBets
        .filter(bet => bet.betMode === 'back' || bet.betMode === 'lay') // Pega todos
        .map(bet => ({
           // Mapeia para o formato que a planilha entende
           // Para Lay, usamos layOdd. Para Back, odds.
           odds: bet.betMode === 'lay' ? bet.layOdd : bet.odds,
           stake: bet.stake,
           // Envia os metadados extras
           is_freebet: bet.isFreebet,
           bet_mode: bet.betMode
        }));
    } else if (activeTab === 'aumentada') {
      betsToExport = aumentadaBets;
    } else {
      return '/planilha/new-bet';
    }

    const params = new URLSearchParams();
    const houseKeys: ('a' | 'b' | 'c' | 'd' | 'e')[] = ['a', 'b', 'c', 'd', 'e'];

    betsToExport.slice(0, 5).forEach((bet, index) => {
      const key = houseKeys[index];
      // Envia os dados básicos
      if (bet.odds && bet.odds > 0) {
        params.append(`odds_${key}`, bet.odds.toString());
      }
      if (bet.stake && bet.stake > 0) {
        params.append(`investment_${key}`, bet.stake.toFixed(2));
      }
      // --- NOVOS PARÂMETROS ---
      if (bet.is_freebet) {
        params.append(`is_freebet_${key}`, 'true');
      }
      if (bet.bet_mode === 'lay') {
        params.append(`bet_mode_${key}`, 'lay');
      }
    });

    return `/planilha/new-bet?${params.toString()}`;
  };

  const renderBottomButtons = () => {
    let shareBets: any;
    let shareStake: number | undefined;

    if (activeTab === 'dutching') {
      shareBets = bets;
      shareStake = totalStake;
    } else if (activeTab === 'limitation') {
      shareBets = limitationBets;
      shareStake = undefined;
    } else if (activeTab === 'aumentada') {
      shareBets = aumentadaBets;
      shareStake = aumentadaTotalStake;
    } else {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-6">
        <button onClick={addNewBet} className={`px-4 py-2 rounded-md transition-colors ${isDark ? 'text-gray-300 border border-gray-600 hover:bg-[#111112]' : 'text-gray-700 border border-gray-400 hover:bg-gray-100'}`}>Adicionar Linha</button>
        <button onClick={resetCalculator} className={`px-4 py-2 rounded-md transition-colors ${isDark ? 'text-gray-300 border border-gray-600 hover:bg-[#111112]' : 'text-gray-700 border border-gray-400 hover:bg-gray-100'}`}>Limpar</button>
        <button onClick={toggleTheme} className={`px-4 py-2 rounded-md transition-colors ${isDark ? 'text-gray-300 border border-gray-600 hover:bg-[#111112]' : 'text-gray-700 border border-gray-400 hover:bg-gray-100'}`}>{isDark ? 'Tema Claro' : 'Tema Escuro'}</button>
        <div id="tour-share-btn" className="flex flex-wrap gap-2 ml-auto">
          <a href={generatePlanilhaUrl()} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors text-xs sm:text-base ${isDark ? 'text-green-400 border border-green-500 hover:bg-[#111112]' : 'text-green-600 border border-green-600 hover:bg-green-50'}`}>
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Enviar p/ Planilha</span>
            <span className="sm:hidden">Planilha</span>
          </a>
          <ShareButton isDarkMode={isDark} calculatorType={activeTab} bets={shareBets} totalStake={shareStake} />
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-3 sm:p-8 ${isDark ? 'bg-dark-900' : 'bg-gray-100'} flex flex-col`}>
      <AppTour isTourActive={isTourActive} setIsTourActive={setIsTourActive} isDarkMode={isDark} />
      <main className="flex-grow">
        <LinkBanners isDarkMode={isDark} />
        <AdBanner isDarkMode={isDark} />
        <div id="calculator-card" className={`max-w-xl sm:max-w-4xl mx-auto rounded-xl shadow-2xl p-4 sm:p-8 text-sm sm:text-base ${isDark ? 'bg-dark-800 text-gray-100' : 'bg-white text-gray-900'}`}>
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <Calculator className="w-6 h-6 sm:w-10 sm:h-10 text-blue-500" />
              <h1 className="text-xl sm:text-3xl font-bold">Calculadora</h1>
            </div>
            <div className="flex items-center gap-2">
              <a href="/planilha" target="_blank" rel="noopener noreferrer" title="Ir para Planilha (Nova Aba)" className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-sm ${isDark ? 'text-gray-300 bg-dark-900 hover:bg-dark-700' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}>
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden sm:inline">Planilha</span>
              </a>
              <button onClick={() => { setActiveTab('dutching'); setIsTourActive(true); }} title="Iniciar Tour de Ajuda" className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:bg-dark-900 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                <HelpCircle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div id="tour-tabs" className="flex flex-wrap gap-2 mb-6">
            {isTabsLoading ? (
              <>
                <div className={`px-4 py-2 rounded-md h-10 w-24 ${isDark ? 'bg-dark-900' : 'bg-gray-200'} animate-pulse`}></div>
                <div className={`px-4 py-2 rounded-md h-10 w-24 ${isDark ? 'bg-dark-900' : 'bg-gray-200'} animate-pulse`}></div>
                <div className={`px-4 py-2 rounded-md h-10 w-24 ${isDark ? 'bg-dark-900' : 'bg-gray-200'} animate-pulse`}></div>
              </>
            ) : (
              <>
                <button onClick={() => setActiveTab('dutching')} className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'dutching' ? isCustomColorActive ? 'text-white' : (isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white') : (isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-dark-800' : 'text-gray-600 hover:text-gray-800')}`} style={activeTab === 'dutching' && isCustomColorActive ? { backgroundColor: tabsColor } : {}}>Dutching</button>
                <button onClick={() => setActiveTab('limitation')} className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'limitation' ? isCustomColorActive ? 'text-white' : (isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white') : (isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-dark-800' : 'text-gray-600 hover:text-gray-800')}`} style={activeTab === 'limitation' && isCustomColorActive ? { backgroundColor: tabsColor } : {}}>Avançada</button>
                <button onClick={() => setActiveTab('aumentada')} className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'aumentada' ? isCustomColorActive ? 'text-white' : (isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white') : (isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-dark-800' : 'text-gray-600 hover:text-gray-800')}`} style={activeTab === 'aumentada' && isCustomColorActive ? { backgroundColor: tabsColor } : {}}>Aumentada</button>
              </>
            )}
          </div>
          
          {activeTab === 'dutching' && <DutchingCalculator bets={bets} isDarkMode={isDark} totalStake={totalStake} setTotalStake={setTotalStake} updateBet={updateBet} copyToClipboard={copyToClipboard} removeBet={removeBet} toggleAutoPunctuate={toggleAutoPunctuate} />}
          {activeTab === 'limitation' && <LimitationCalculator bets={limitationBets} calcResult={limitationResult} isDarkMode={isDark} updateBet={updateLimitationBet} copyToClipboard={copyToClipboard} removeBet={removeBet} toggleAutoPunctuate={toggleAutoPunctuate} toggleFreebet={toggleFreebet} toggleBetMode={toggleBetMode} isAutoCalculate={isAutoCalculate} toggleAutoCalculate={toggleAutoCalculate} />}
          {activeTab === 'aumentada' && <AumentadaCalculator bets={aumentadaBets} isDarkMode={isDark} totalStake={aumentadaTotalStake} setTotalStake={setAumentadaTotalStake} updateBet={updateAumentadaBet} copyToClipboard={copyToClipboard} removeBet={removeBet} toggleAutoPunctuate={toggleAutoPunctuate} />}
          
          {renderBottomButtons()}
        </div>
      </main> 
      <Footer isDarkMode={isDark} />
    </div>
  );
}

export default CalculatorComponent;