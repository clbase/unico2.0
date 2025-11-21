import React from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { AumentadaBet } from '../types';

interface AumentadaCalculatorProps {
  bets: AumentadaBet[];
  isDarkMode: boolean;
  updateBet: (index: number, value: string) => void;
  copyToClipboard: (value: number) => void;
  removeBet: (index: number) => void;
}

export function AumentadaCalculator({
  bets,
  isDarkMode,
  updateBet,
  copyToClipboard,
  removeBet
}: AumentadaCalculatorProps) {
  return (
    <>
      {bets.map((bet, index) => (
        <div key={index} className={`grid grid-cols-12 gap-1 sm:gap-4 px-2 sm:px-4 py-1.5 sm:py-3 items-center border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="col-span-1 text-xs sm:text-base font-medium">{index + 1}º</div>
          <div className="col-span-3 sm:col-span-2">
            <input
              type="text"
              value={bet.oddsInput ?? (bet.odds > 0 ? bet.odds.toString() : '')}
              onChange={(e) => updateBet(index, e.target.value)}
              className={`w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-black border-gray-800 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} text-sm sm:text-lg`}
              placeholder="0.00"
            />
          </div>
          <div className="col-span-4 flex items-center gap-1 sm:gap-3 text-xs sm:text-base">
            <span>R$ {bet.stake.toFixed(2)}</span>
            <button
              onClick={() => copyToClipboard(bet.stake)}
              className={`p-0.5 sm:p-1.5 rounded transition-colors ${isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-black' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'}`}
            >
              <Copy className="w-3 h-3 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="col-span-3 sm:col-span-4 text-xs sm:text-base">
            R$ {(bet.odds * bet.stake).toFixed(2)}
          </div>
          <div className="col-span-1">
            {bets.length > 2 && (
              <button
                onClick={() => removeBet(index)}
                className={`p-0.5 sm:p-1.5 rounded transition-colors ${isDarkMode ? 'text-red-500 hover:text-red-400 hover:bg-black' : 'text-red-500 hover:text-red-600 hover:bg-gray-100'}`}
              >
                <Trash2 className="w-3 h-3 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  );
}