import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { Bet } from '../types';
import { DutchingTableHeader } from './DutchingTableHeader';
import { CalculatorStats } from '../shared/CalculatorStats';
import { PunctuateToggleButton } from '../shared/PunctuateToggleButton';

interface DutchingCalculatorProps {
  bets: Bet[];
  isDarkMode: boolean;
  totalStake: number;
  setTotalStake: (value: number) => void;
  updateBet: (index: number, value: string) => void;
  copyToClipboard: (value: number) => void;
  removeBet: (index: number) => void;
  toggleAutoPunctuate?: (index: number) => void;
}

export function DutchingCalculator({
  bets,
  isDarkMode,
  totalStake,
  setTotalStake,
  updateBet,
  copyToClipboard,
  removeBet,
  toggleAutoPunctuate
}: DutchingCalculatorProps) {
  const calculateReturns = () => {
    return bets.filter(bet => bet.odds > 0 && bet.stake > 0).map(bet => +(bet.odds * bet.stake).toFixed(2));
  };

  const returns = calculateReturns();
  const totalReturn = returns.length > 0 ? returns[0] : 0;
  const profit = totalReturn > 0 ? +(totalReturn - totalStake).toFixed(2) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
        <div id="tour-investment">
          <label className="block text-xs sm:text-base font-medium mb-1 sm:mb-2">
            Investimento Total (R$)
          </label>
          <input
            type="number"
            value={totalStake || ''}
            onChange={(e) => setTotalStake(Number(e.target.value))}
            autoComplete="off"
            className={`w-full px-2 sm:px-4 py-1.5 sm:py-3 text-base sm:text-xl border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isDarkMode
                ? 'bg-[#111112] border-gray-800 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        <div id="tour-stats">
          <CalculatorStats 
            profit={profit} 
            totalReturn={totalReturn} 
            totalInvestment={totalStake}
          />
        </div>
      </div>

      <div className="mb-4 sm:mb-8">
        <DutchingTableHeader isDarkMode={isDarkMode} />
        {bets.map((bet, index) => (
          <div key={index} className={`grid grid-cols-12 gap-1 sm:gap-4 px-2 sm:px-4 py-1.5 sm:py-3 items-center border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="col-span-1 text-xs sm:text-base font-medium">{index + 1}º</div>
            <div className="col-span-3 sm:col-span-2">
              <input
                type="text"
                value={bet.oddsInput || ''}
                onChange={(e) => updateBet(index, e.target.value)}
                autoComplete="off"
                className={`w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} text-sm sm:text-lg`}
                placeholder="0.00"
                id={index === 0 ? 'tour-odds-input' : undefined}
              />
            </div>
            <div className="col-span-4 flex items-center gap-1 sm:gap-3 text-xs sm:text-base">
              <span>R$ {bet.stake.toFixed(2)}</span>
              <button
                onClick={() => copyToClipboard(bet.stake)}
                className={`p-0.5 sm:p-1.5 rounded transition-colors ${isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-[#111112]' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'}`}
              >
                <Copy className="w-3 h-3 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="col-span-2 sm:col-span-3 text-xs sm:text-base">
              R$ {(bet.odds * bet.stake).toFixed(2)}
            </div>
            <div className="col-span-2 flex items-center gap-1">
              {toggleAutoPunctuate && (
                <div id={index === 0 ? 'tour-punctuate-btn' : undefined}>
                  <PunctuateToggleButton
                    isEnabled={bet.autoPunctuate !== false}
                    onToggle={() => toggleAutoPunctuate(index)}
                    isDarkMode={isDarkMode}
                  />
                </div>
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
        ))}
      </div>
    </div>
  );
}