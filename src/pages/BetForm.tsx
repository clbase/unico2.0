import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronLeft, ChevronRight, ChevronDown, Gift, RefreshCw, TrendingUp } from 'lucide-react';

export const BetForm: React.FC = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Referência para controlar o carregamento inicial via URL
  const isPreFilled = useRef(searchParams.has('odds_a'));

  const [houseCount, setHouseCount] = useState<2 | 3 | 4 | 5>(2);
  const [currentHouse, setCurrentHouse] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [showHouseSelector, setShowHouseSelector] = useState(false);
  const [autoPunctuation, setAutoPunctuation] = useState(true);

  // Estado para detalhes avançados (Freebet, Lay e NOVO: Increase)
  const [betDetails, setBetDetails] = useState({
    is_freebet_a: false, bet_mode_a: 'back', increase_a: '',
    is_freebet_b: false, bet_mode_b: 'back', increase_b: '',
    is_freebet_c: false, bet_mode_c: 'back', increase_c: '',
    is_freebet_d: false, bet_mode_d: 'back', increase_d: '',
    is_freebet_e: false, bet_mode_e: 'back', increase_e: '',
  });

  const [formData, setFormData] = useState({
    house_a: '', house_b: '', house_c: '', house_d: '', house_e: '',
    odds_a: '', odds_b: '', odds_c: '', odds_d: '', odds_e: '',
    investment_a: '', investment_b: '', investment_c: '', investment_d: '', investment_e: '',
    event_date: '', event_time: '', market: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // --- LER DADOS DA URL ---
  useEffect(() => {
    if (isPreFilled.current) {
      const newFormData = {
        ...formData,
        odds_a: searchParams.get('odds_a') || '',
        odds_b: searchParams.get('odds_b') || '',
        odds_c: searchParams.get('odds_c') || '',
        odds_d: searchParams.get('odds_d') || '',
        odds_e: searchParams.get('odds_e') || '',
        investment_a: searchParams.get('investment_a') || '',
        investment_b: searchParams.get('investment_b') || '',
        investment_c: searchParams.get('investment_c') || '',
        investment_d: searchParams.get('investment_d') || '',
        investment_e: searchParams.get('investment_e') || '',
        house_a: searchParams.get('house_a') || '',
        house_b: searchParams.get('house_b') || '',
      };

      const newDetails = {
        is_freebet_a: searchParams.get('is_freebet_a') === 'true',
        bet_mode_a: searchParams.get('bet_mode_a') === 'lay' ? 'lay' : 'back',
        increase_a: searchParams.get('increase_a') || '',
        
        is_freebet_b: searchParams.get('is_freebet_b') === 'true',
        bet_mode_b: searchParams.get('bet_mode_b') === 'lay' ? 'lay' : 'back',
        increase_b: searchParams.get('increase_b') || '',

        is_freebet_c: searchParams.get('is_freebet_c') === 'true',
        bet_mode_c: searchParams.get('bet_mode_c') === 'lay' ? 'lay' : 'back',
        increase_c: searchParams.get('increase_c') || '',

        is_freebet_d: searchParams.get('is_freebet_d') === 'true',
        bet_mode_d: searchParams.get('bet_mode_d') === 'lay' ? 'lay' : 'back',
        increase_d: searchParams.get('increase_d') || '',

        is_freebet_e: searchParams.get('is_freebet_e') === 'true',
        bet_mode_e: searchParams.get('bet_mode_e') === 'lay' ? 'lay' : 'back',
        increase_e: searchParams.get('increase_e') || '',
      };
      
      setFormData(newFormData);
      // @ts-ignore
      setBetDetails(prev => ({ ...prev, ...newDetails }));

      if (searchParams.has('odds_e') || searchParams.has('investment_e')) setHouseCount(5);
      else if (searchParams.has('odds_d') || searchParams.has('investment_d')) setHouseCount(4);
      else if (searchParams.has('odds_c') || searchParams.has('investment_c')) setHouseCount(3);
      else setHouseCount(2);

      // Trava para não recarregar e limpar os dados
      isPreFilled.current = false;
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Toggles manuais
  const toggleFreebet = (houseKey: string) => {
    const key = `is_freebet_${houseKey.toLowerCase()}` as keyof typeof betDetails;
    setBetDetails(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleBetMode = (houseKey: string) => {
    const key = `bet_mode_${houseKey.toLowerCase()}` as keyof typeof betDetails;
    setBetDetails(prev => ({ ...prev, [key]: prev[key] === 'back' ? 'lay' : 'back' }));
  };

  const handleIncreaseChange = (houseKey: string, value: string) => {
    const key = `increase_${houseKey.toLowerCase()}` as keyof typeof betDetails;
    setBetDetails(prev => ({ ...prev, [key]: value }));
  };

  const formatOddsInput = (input: string): string => {
    if (!autoPunctuation) return input;
    const numbers = input.replace(/[^\d]/g, '');
    if (numbers.length <= 2) return numbers;
    return numbers.slice(0, -2) + '.' + numbers.slice(-2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('odds_')) {
      const formattedValue = formatOddsInput(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- LÓGICA DE SALVAMENTO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const [year, month, day] = formData.event_date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const formattedDate = date.toISOString().split('T')[0];

      // Função para calcular o Custo Real (o que sai do bolso/banca)
      const getRealCost = (investment: string, odds: string, betMode: string, isFreebet: boolean) => {
         const stake = Number(investment);
         const odd = Number(odds);
         if (betMode === 'lay') {
            return stake * (odd - 1); // Lay: Custo é a Responsabilidade
         }
         if (isFreebet) {
            return 0; // Freebet: Custo é zero (bônus)
         }
         return stake; // Back Normal: Custo é o Stake
      };

      // Calcular total investido (para a porcentagem)
      const betInputs = [
        { inv: formData.investment_a, odd: formData.odds_a, mode: betDetails.bet_mode_a, free: betDetails.is_freebet_a, active: true },
        { inv: formData.investment_b, odd: formData.odds_b, mode: betDetails.bet_mode_b, free: betDetails.is_freebet_b, active: true },
        { inv: formData.investment_c, odd: formData.odds_c, mode: betDetails.bet_mode_c, free: betDetails.is_freebet_c, active: houseCount >= 3 },
        { inv: formData.investment_d, odd: formData.odds_d, mode: betDetails.bet_mode_d, free: betDetails.is_freebet_d, active: houseCount >= 4 },
        { inv: formData.investment_e, odd: formData.odds_e, mode: betDetails.bet_mode_e, free: betDetails.is_freebet_e, active: houseCount >= 5 },
      ];

      const totalInvestment = betInputs.reduce((sum, bet) => {
         if (!bet.active) return sum;
         return sum + getRealCost(bet.inv, bet.odd, bet.mode, bet.free);
      }, 0);

      const group_id = crypto.randomUUID();
      const marketValue = formData.market.trim() || 'Não especificado';
      const betsToInsert = [];

      const createBetObject = (houseLetter: string, houseName: string, oddsStr: string, investmentStr: string) => {
        const lower = houseLetter.toLowerCase();
        // @ts-ignore
        const isFreebet = betDetails[`is_freebet_${lower}`];
        // @ts-ignore
        const betMode = betDetails[`bet_mode_${lower}`];
        // @ts-ignore
        const increaseStr = betDetails[`increase_${lower}`];
        const increase = Number(increaseStr) || 0;

        const odds = Number(oddsStr);
        const inputStake = Number(investmentStr);
        
        // Lógica de conversão para o Banco de Dados
        let realInvestment = 0; // O que será salvo como 'investment' (sai da banca)
        let potentialReturn = 0; // O que será salvo como 'dutching_investment' (entra na banca se ganhar)

        if (betMode === 'lay') {
           // LAY
           realInvestment = inputStake * (odds - 1); // Responsabilidade
           potentialReturn = realInvestment + inputStake; // Responsabilidade + Stake
        } else {
           // BACK
           if (isFreebet) {
              realInvestment = 0; 
              potentialReturn = (odds - 1) * inputStake; // Lucro da freebet
           } else {
              realInvestment = inputStake;
              
              // CÁLCULO DA AUMENTADA PARA A PLANILHA
              // FinalOdd = Odd + (Odd - 1) * (Aumento / 100)
              // Retorno = Stake * FinalOdd
              const finalOdds = odds + (odds - 1) * (increase / 100);
              potentialReturn = inputStake * finalOdds; 
           }
        }

        return {
          house_a: houseLetter === 'A' ? houseName : formData.house_a,
          house_b: houseLetter === 'B' ? houseName : (houseLetter === 'A' ? formData.house_b : houseName),
          odds: odds,
          investment: realInvestment, 
          dutching_investment: potentialReturn,
          event_date: formattedDate,
          event_time: formData.event_time,
          market: marketValue,
          house_type: houseLetter,
          user_id: session?.user.id,
          percentage: totalInvestment > 0 ? (realInvestment / totalInvestment) * 100 : 0,
          group_id: group_id,
          is_freebet: isFreebet,
          bet_mode: betMode,
          increase_percentage: increase // Salva a porcentagem no banco
        };
      };

      if (Number(formData.investment_a) > 0) betsToInsert.push(createBetObject('A', formData.house_a, formData.odds_a, formData.investment_a));
      if (Number(formData.investment_b) > 0) betsToInsert.push(createBetObject('B', formData.house_b, formData.odds_b, formData.investment_b));
      if (houseCount >= 3 && Number(formData.investment_c) > 0) betsToInsert.push(createBetObject('C', formData.house_c, formData.odds_c, formData.investment_c));
      if (houseCount >= 4 && Number(formData.investment_d) > 0) betsToInsert.push(createBetObject('D', formData.house_d, formData.odds_d, formData.investment_d));
      if (houseCount >= 5 && Number(formData.investment_e) > 0) betsToInsert.push(createBetObject('E', formData.house_e, formData.odds_e, formData.investment_e));
      
      const { error } = await supabase.from('bets').insert(betsToInsert);
      if (error) throw error;

      navigate('/bets');
    } catch (error) {
      console.error('Error creating bet:', error);
      setError('Erro ao salvar aposta. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleHouseCountSelect = (count: 2 | 3 | 4 | 5) => {
    setHouseCount(count);
    setShowHouseSelector(false);
    if (currentHouse >= String.fromCharCode('A'.charCodeAt(0) + count)) {
      setCurrentHouse('A');
    }
  };
  
  const nextHouse = () => {
    const houses: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];
    const currentIndex = houses.indexOf(currentHouse);
    if (currentIndex < houseCount - 1) setCurrentHouse(houses[currentIndex + 1]);
  };
  const previousHouse = () => {
    const houses: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E'];
    const currentIndex = houses.indexOf(currentHouse);
    if (currentIndex > 0) setCurrentHouse(houses[currentIndex - 1]);
  };

  const inputStyle = `w-full p-2 border rounded dark:bg-dark-900 dark:border-dark-700 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`;
  const disabledInputStyle = `bg-gray-100 dark:bg-dark-800 opacity-50 cursor-not-allowed`;
  
  const renderHouseForm = (house: 'A' | 'B' | 'C' | 'D' | 'E') => {
    const isDisabled = house === 'C' ? houseCount < 3 : 
                      house === 'D' ? houseCount < 4 : 
                      house === 'E' ? houseCount < 5 : false;

    if (isDisabled) return null;

    const houseLower = house.toLowerCase();
    const oddsKey = `odds_${houseLower}` as keyof typeof formData;
    const investmentKey = `investment_${houseLower}` as keyof typeof formData;
    
    // @ts-ignore
    const isFreebet = betDetails[`is_freebet_${houseLower}`];
    // @ts-ignore
    const betMode = betDetails[`bet_mode_${houseLower}`];
    // @ts-ignore
    const increase = betDetails[`increase_${houseLower}`];

    return (
      <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg relative">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            Casa {house}
            {increase > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <TrendingUp className="w-3 h-3 mr-1" />
                {increase}%
              </span>
            )}
            {isFreebet && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Gift className="w-3 h-3 mr-1" />
                Freebet
              </span>
            )}
            {betMode === 'lay' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200">
                <RefreshCw className="w-3 h-3 mr-1" />
                Lay (Contra)
              </span>
            )}
          </h3>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toggleFreebet(house)}
              className={`p-1.5 rounded-md transition-colors border ${
                isFreebet
                  ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700'
                  : 'bg-gray-50 text-gray-400 border-gray-200 dark:bg-dark-800 dark:text-gray-500 dark:border-gray-700 hover:bg-gray-100'
              }`}
              title={isFreebet ? "Freebet Ativa" : "Ativar Freebet"}
            >
              <Gift className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => toggleBetMode(house)}
              className={`p-1.5 rounded-md transition-colors border flex items-center gap-1 ${
                betMode === 'lay'
                  ? 'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-900 dark:text-pink-300 dark:border-pink-700'
                  : 'bg-blue-50 text-blue-400 border-blue-200 dark:bg-dark-800 dark:text-blue-500 dark:border-blue-900/30 hover:bg-blue-100'
              }`}
              title={betMode === 'lay' ? "Modo Lay (Contra)" : "Modo Back (A Favor)"}
            >
              <RefreshCw className="w-3 h-3" />
              <span className="text-xs font-bold">{betMode === 'lay' ? 'Lay' : 'Back'}</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            Nome da Casa
          </label>
          <input
            type="text"
            name={`house_${houseLower}`}
            value={formData[`house_${houseLower}` as keyof typeof formData]}
            onChange={handleChange}
            className={inputStyle}
            required
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
              {betMode === 'lay' ? 'Odd Lay' : 'Odd Back'}
            </label>
            <input
              type="text"
              name={oddsKey}
              value={formData[oddsKey]}
              onChange={handleChange}
              placeholder={autoPunctuation ? "0.00" : "Ex: 2.795"}
              className={inputStyle}
              required
            />
          </div>
          
          {/* NOVO CAMPO: Aumento % (Apenas se não for Lay) */}
          {betMode !== 'lay' && (
            <div className="w-1/3">
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                Aumento %
              </label>
              <input
                type="number"
                value={increase}
                onChange={(e) => handleIncreaseChange(house, e.target.value)}
                placeholder="0"
                className={inputStyle}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            {betMode === 'lay' ? 'Investimento (Lay Stake)' : 'Investimento (R$)'}
            {betMode === 'lay' && <span className="text-xs font-normal text-gray-500 ml-1">(A Responsabilidade será calculada)</span>}
          </label>
          <input
            type="number"
            name={investmentKey}
            value={formData[investmentKey]}
            onChange={handleChange}
            step="0.01"
            min="0"
            className={inputStyle}
            required
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Nova Aposta</h1>
        <button
          onClick={() => navigate('/bets')}
          className={`px-4 py-2 rounded transition-colors ${
            isDark 
              ? 'bg-[#2e2e33] text-[#b0b0b5] hover:bg-[#3a3a3f]' 
              : 'bg-gray-800 text-white hover:bg-gray-900'
          }`}
        >
          Voltar
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative">
          <button
            onClick={() => setShowHouseSelector(!showHouseSelector)}
            className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 rounded transition-colors ${
              isDark 
                ? 'bg-[#2e2e33] text-[#b0b0b5] hover:bg-[#3a3a3f]' 
                : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            <span>{houseCount} Casas</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showHouseSelector ? 'rotate-180' : ''}`} />
          </button>

          {showHouseSelector && (
            <div className="absolute z-10 mt-2 w-full sm:w-48 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700">
              {[2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => handleHouseCountSelect(count as 2 | 3 | 4 | 5)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-700 first:rounded-t-lg last:rounded-b-lg"
                >
                  {count} Casas
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoPunctuation}
              onChange={(e) => setAutoPunctuation(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Pontuação Automática
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-800 shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 gap-6">
          <div className="hidden md:grid gap-8" style={{
            gridTemplateColumns: `repeat(${houseCount > 2 ? 2 : houseCount}, minmax(0, 1fr))`
          }}>
            {['A', 'B', 'C', 'D', 'E'].map((house) => (
              <div key={house} className={house >= String.fromCharCode('A'.charCodeAt(0) + houseCount) ? 'hidden' : ''}>
                {renderHouseForm(house as 'A' | 'B' | 'C' | 'D' | 'E')}
              </div>
            ))}
          </div>

          <div className="md:hidden">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={previousHouse}
                disabled={currentHouse === 'A'}
                className="p-2 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-lg font-medium">
                Casa {currentHouse}
              </span>
              <button
                type="button"
                onClick={nextHouse}
                disabled={currentHouse === String.fromCharCode('A'.charCodeAt(0) + houseCount - 1)}
                className="p-2 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            {renderHouseForm(currentHouse)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                Data do Evento
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                Horário do Evento
              </label>
              <input
                type="time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                Mercado <span className="text-gray-500 text-xs">(Opcional)</span>
              </label>
              <input
                type="text"
                name="market"
                value={formData.market}
                onChange={handleChange}
                placeholder="Ex: Handicap, Pontos, Over/Under..."
                className={inputStyle}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-6 space-x-4">
          <button
            type="button"
            onClick={() => navigate('/bets')}
            className={`px-4 py-2 rounded transition-colors ${
              isDark 
                ? 'bg-[#2e2e33] text-[#b0b0b5] hover:bg-[#3a3a3f]' 
                : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              isDark 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            {loading ? 'Salvando...' : 'Salvar Aposta'}
          </button>
        </div>
      </form>
    </div>
  );
};