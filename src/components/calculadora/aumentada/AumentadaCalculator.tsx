import React from 'react';
import { Copy, Trash2, Lock, Unlock, HelpCircle } from 'lucide-react';
import { AumentadaBet } from '../types';
import { AumentadaTableHeader } from './AumentadaTableHeader';
import { MobileAumentadaTableHeader } from './MobileAumentadaTableHeader';
import { TableHeader } from '../shared/TableHeader';
import { CalculatorStats } from '../shared/CalculatorStats';
import { PunctuateToggleButton } from '../shared/PunctuateToggleButton';

interface AumentadaCalculatorProps {
  bets: AumentadaBet[];
  isDarkMode: boolean;
  totalStake: number;
  setTotalStake: (value: number) => void;
  updateBet: (index: number, field: 'odds' | 'increase' | 'stake' | 'isFixed', value: string | boolean) => void;
  copyToClipboard: (value: number) => void;
  removeBet: (index: number) => void;
  toggleAutoPunctuate?: (index: number) => void;
}

export function AumentadaCalculator({
  bets,
  isDarkMode,
  totalStake,
  setTotalStake,
  updateBet,
  copyToClipboard,
  removeBet,
  toggleAutoPunctuate
}: AumentadaCalculatorProps) {
  const calculateStakesAndReturns = () => {
    const validBets = bets.filter(bet => bet.odds > 0);
    if (validBets.length === 0) return { stakes: [], returns: [], calculatedTotalStake: 0 };

    const fixedBet = validBets.find(bet => bet.isFixed);

    if (fixedBet) {
      const fixedReturn = (fixedBet.stake || 0) * (fixedBet.odds + (fixedBet.odds - 1) * (fixedBet.increase / 100));

      const stakes = validBets.map(bet => {
        if (bet === fixedBet) return bet.stake;
        
        const finalOdds = bet.odds + (bet.odds - 1) * (bet.increase / 100);
        if (finalOdds <= 0) return 0;
        return +(fixedReturn / finalOdds).toFixed(2);
      });

      const returns = validBets.map((bet, i) => {
        const finalOdds = bet.odds + (bet.odds - 1) * (bet.increase / 100);
        return +(finalOdds * (stakes[i] || 0)).toFixed(2);
      });

      const calculatedTotalStake = stakes.reduce((sum, stake) => sum + (stake || 0), 0);

      return { stakes, returns, calculatedTotalStake };
    } else {
      if (totalStake <= 0) {
        return { stakes: Array(validBets.length).fill(0), returns: Array(validBets.length).fill(0), calculatedTotalStake: 0 };
      }
      
      const stakePerBet = totalStake / validBets.length;
      
      const stakes = validBets.map(() => stakePerBet);
      
      const returns = validBets.map((bet, i) => {
        const finalOdds = bet.odds + (bet.odds - 1) * (bet.increase / 100);
        return +(finalOdds * (stakes[i] || 0)).toFixed(2);
      });

      return { stakes, returns, calculatedTotalStake: totalStake };
    }
  };

  const { stakes, returns, calculatedTotalStake } = calculateStakesAndReturns();
  const totalReturn = returns.length > 0 ? returns[0] : 0;
  
  // O lucro só é calculado se houver um retorno, senão é 0.
  const profit = totalReturn > 0 ? +(totalReturn - calculatedTotalStake).toFixed(2) : 0;


  const handleFixToggle = (index: number) => {
    const bet = bets[index];
    const validBetIndex = bets.filter(b => b.odds > 0).findIndex(b => b === bet);
    const stake = validBetIndex !== -1 ? (stakes[validBetIndex] || 0) : 0;
    
    if (!bet.isFixed) {
      updateBet(index, 'stake', stake.toString());
    }
    
    updateBet(index, 'isFixed', !bet.isFixed);
    
    bets.forEach((_, i) => {
      if (i !== index && bets[i].isFixed) {
        updateBet(i, 'isFixed', false);
      }
    });
  };

  const handleStakeChange = (index: number, value: string) => {
    if (bets[index].isFixed) {
      updateBet(index, 'stake', value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
        <div>
          <label className="block text-xs sm:text-base font-medium mb-1 sm:mb-2">
            Investimento Total (R$)
          </label>
          <input
            type="number"
            value={bets.some(bet => bet.isFixed) ? calculatedTotalStake.toFixed(2) : (totalStake || '')}
            onChange={(e) => setTotalStake(Number(e.target.value))}
            disabled={bets.some(bet => bet.isFixed)}
            autoComplete="off"
            translate="no"
            className={`w-full px-2 sm:px-4 py-1.5 sm:py-3 text-base sm:text-xl border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isDarkMode 
                ? 'bg-[#111112] border-gray-800 text-gray-100' 
                : 'bg-white border-gray-300 text-gray-900'
            } ${bets.some(bet => bet.isFixed) ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>
        {/* ----- CORREÇÃO AQUI ----- */}
        {/* Adicionado totalInvestment={calculatedTotalStake} */}
        <CalculatorStats 
          profit={profit} 
          totalReturn={totalReturn} 
          totalInvestment={calculatedTotalStake} 
        />
        {/* ----- FIM DA CORREÇÃO ----- */}
      </div>

      <div className="mb-4 sm:mb-8">
        <MobileAumentadaTableHeader isDarkMode={isDarkMode} />
        <div className="hidden sm:block">
          <TableHeader isDarkMode={isDarkMode} showIncrease={true} />
        </div>
        {bets.map((bet, index) => {
          const finalOdds = bet.odds + (bet.odds - 1) * (bet.increase / 100);
          const validBetIndex = bets.filter(b => b.odds > 0).findIndex(b => b === bet);
          const stake = bet.isFixed ? bet.stake : (bet.odds > 0 && validBetIndex !== -1 ? (stakes[validBetIndex] || 0) : 0);
          const return_ = +(finalOdds * (stake || 0)).toFixed(2);

          return (
            <div key={index} className={`grid grid-cols-12 gap-1 sm:gap-4 px-2 sm:px-4 py-1.5 sm:py-3 items-center border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="col-span-1 text-xs sm:text-base font-medium">{index + 1}º</div>
              <div className="col-span-3 sm:col-span-2">
                <input
                  type="text"
                  translate="no"
                  value={bet.oddsInput || ''}
                  onChange={(e) => updateBet(index, 'odds', e.target.value)}
                  autoComplete="off"
                  className={`w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} text-sm sm:text-lg`}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2 sm:col-span-2">
                <div className="relative flex items-center">
                  <input
                    type="number"
                    translate="no"
                    value={bet.increase || ''}
                    onChange={(e) => updateBet(index, 'increase', e.target.value)}
                    autoComplete="off"
                    className={`w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} text-sm sm:text-lg`}
                    placeholder="0"
                    step="1"
                  />
                  {bet.increase > 0 && bet.odds > 0 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 group">
                      <HelpCircle className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <div className={`absolute bottom-full right-0 mb-1 sm:mb-2 px-1 sm:px-2 py-0.5 sm:py-1 text-[9px] sm:text-xs rounded shadow-sm sm:shadow-lg whitespace-nowrap border-[0.5px] sm:border ${
                        isDarkMode ? 'bg-dark-700 text-gray-200 border-gray-600' : 'bg-white text-gray-800 border-gray-200'
                      }`} translate="no">
                        Odd Final: {finalOdds.toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-5 sm:col-span-3 flex items-center gap-1 sm:gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="number"
                    translate="no"
                    value={bet.isFixed ? (bet.stake || '') : stake.toFixed(2)}
                    onChange={(e) => handleStakeChange(index, e.target.value)}
                    disabled={!bet.isFixed}
                    autoComplete="off"
                    className={`w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
                    } text-sm sm:text-lg ${!bet.isFixed ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <button
                    onClick={() => handleFixToggle(index)}
                    className={`p-1 rounded-md transition-colors ${
                      isDarkMode
                        ? bet.isFixed ? 'text-blue-400 bg-blue-900/20' : 'text-gray-400 hover:text-blue-400'
                        : bet.isFixed ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-blue-600'
                    }`}
                    title={bet.isFixed ? 'Desbloquear valor' : 'Fixar valor'}
                  >
                    {bet.isFixed ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => copyToClipboard(stake)}
                  className={`p-0.5 sm:p-1.5 rounded transition-colors ${isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-[#111112]' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'}`}
                >
                  <Copy className="w-3 h-3 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="col-span-1 sm:col-span-2 hidden sm:block text-xs sm:text-base">
                <span translate="no">R$ {return_.toFixed(2)}</span>
              </div>
              <div className="col-span-1 sm:col-span-2 flex items-center gap-1">
                {toggleAutoPunctuate && (
                  <PunctuateToggleButton
                    isEnabled={bet.autoPunctuate !== false}
                    onToggle={() => toggleAutoPunctuate(index)}
                    isDarkMode={isDarkMode}
                  />
                )}
                {bets.length > 2 && (
                  <button
                    onClick={() => removeBet(index)}
                    className={`p-0.5 sm:p-1.5 rounded transition-colors ${isDarkMode ? 'text-red-500 hover:text-red-400 hover:bg-[#111112]' : 'text-red-500 hover:text-red-600 hover:bg-gray-100'}`}
                  >
                    <Trash2 className="w-3 h-3 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}