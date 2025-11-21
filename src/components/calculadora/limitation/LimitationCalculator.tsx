import React from 'react';
import { Copy, Trash2, HelpCircle, Zap, Edit3 } from 'lucide-react';
import { LimitationBet, LimitationCalcResult } from '../types';
import { CalculatorStats } from '../shared/CalculatorStats';
import { PunctuateToggleButton } from '../shared/PunctuateToggleButton';
import { FreebetToggleButton } from '../shared/FreebetToggleButton';
import { BackLayToggle } from '../shared/BackLayToggle';

interface LimitationCalculatorProps {
  bets: LimitationBet[];
  calcResult: LimitationCalcResult;
  isDarkMode: boolean;
  updateBet: (index: number, field: 'odds' | 'stake' | 'layOdd', value: string) => void;
  copyToClipboard: (value: number) => void;
  removeBet: (index: number) => void;
  toggleAutoPunctuate: (index: number) => void;
  toggleFreebet: (index: number) => void;
  toggleBetMode: (index: number) => void;
  isAutoCalculate: boolean;
  toggleAutoCalculate: () => void;
}

const LimitationTableHeader: React.FC<{ isDarkMode: boolean; isExtractionMode: boolean }> = ({ isDarkMode, isExtractionMode }) => (
  <div className={`grid grid-cols-12 gap-1 sm:gap-4 mb-2 px-2 sm:px-4 py-3 sm:py-4 rounded-t-lg ${isDarkMode ? 'bg-dark-900' : 'bg-gray-100'} h-12 sm:h-14`}>
    <div className="col-span-1 text-xs sm:text-base font-medium flex items-center h-full"></div>
    <div className="col-span-3 sm:col-span-2 text-xs sm:text-base font-medium flex items-center h-full">Odds</div>
    <div className="col-span-4 text-xs sm:text-base font-medium flex items-center h-full">Investimento</div>
    <div className="col-span-2 sm:col-span-3 text-xs sm:text-base font-medium flex items-center h-full">Retorno</div>
    <div className="col-span-2"></div>
  </div>
);

export function LimitationCalculator({
  bets,
  calcResult,
  isDarkMode,
  updateBet,
  copyToClipboard,
  removeBet,
  toggleAutoPunctuate,
  toggleFreebet,
  toggleBetMode,
  isAutoCalculate,
  toggleAutoCalculate
}: LimitationCalculatorProps) {

  const isExtractionMode = bets.some(b => b.betMode === 'lay');
  const { totalInvestment, profit, totalReturn, liability } = calcResult;

  const inputStyle = `w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} text-sm sm:text-lg`;
  const disabledInputStyle = `opacity-50 cursor-not-allowed bg-gray-100 dark:bg-dark-800`;
  const isAnyFreebetActive = bets.some(b => b.isFreebet);

  return (
    <div className="space-y-4 relative">
      
      {/* Button Positioned Absolutely at Top Right */}
      <div className="absolute -top-12 right-0 sm:-top-14">
         <button
            onClick={toggleAutoCalculate}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-xs sm:text-sm ${
               isAutoCalculate
                  ? 'bg-[#3c3c3c] text-white hover:bg-[#2b2b2b]' 
                  : (isDarkMode ? 'bg-dark-700 text-gray-300 border border-gray-600 hover:bg-dark-600' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50')
            }`}
            title={isAutoCalculate ? "Modo Automático (Dutching)" : "Modo Manual (Livre)"}
         >
            {isAutoCalculate ? <Zap className="w-3 h-3 sm:w-4 sm:h-4" /> : <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />}
            {isAutoCalculate ? "Automático" : "Manual"}
         </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8 mt-2">
        <div>
          <label className="block text-xs sm:text-base font-medium mb-1 sm:mb-2">
            {isExtractionMode ? "Custo Real (Stake Back)" : "Investimento Total"}
          </label>
          <input
            type="number"
            value={totalInvestment.toFixed(2)}
            disabled
            autoComplete="off"
            className={`w-full px-2 sm:px-4 py-1.5 sm:py-3 text-base sm:text-xl border rounded-md bg-opacity-75 cursor-not-allowed ${
              isDarkMode
                ? 'bg-[#111112] border-gray-800 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>
        
        <CalculatorStats 
          profit={profit} 
          totalReturn={totalReturn} 
          totalInvestment={totalInvestment}
          hideResults={!isAutoCalculate}
        />
      </div>

      <div className="mb-4 sm:mb-8">
        <LimitationTableHeader isDarkMode={isDarkMode} isExtractionMode={isExtractionMode} />
        {bets.map((bet, index) => {
          
          const isLay = bet.betMode === 'lay';
          const oddLabel = isLay ? "Odd Lay" : "Odds";
          const stakeLabel = isLay ? "Investimento (Lay)" : "Investimento";
          const returnLabel = "Retorno";
          
          // Display Logic: Use stakeInput if available/editing, else calculated stake
          let displayStake: string | number = 0;

          if (isAutoCalculate) {
             if (bet.isEditing) {
               displayStake = bet.stakeInput ?? bet.stake;
             } else {
               displayStake = (calcResult.stakes[index] || 0).toFixed(2);
             }
          } else {
             displayStake = bet.stakeInput ?? bet.stake;
          }
          
          let displayReturn = 0;
          if (isAutoCalculate) {
              if (isLay) displayReturn = bet.stake;
              else displayReturn = calcResult.returns[index] || 0;
          } else {
             if (isLay) {
                 displayReturn = bet.stake;
             } else {
                 displayReturn = bet.isFreebet ? (bet.odds - 1) * bet.stake : bet.odds * bet.stake;
             }
          }
          
          let lineRoi = 0;
          let lineProfit = 0;
          if (!isAutoCalculate && totalInvestment > 0) {
             lineProfit = displayReturn - totalInvestment;
             lineRoi = (lineProfit / totalInvestment) * 100;
          }
          
          const returnColor = isLay ? 'text-blue-500' : (isDarkMode ? 'text-white' : 'text-gray-700');
          
          const isStakeDisabled = isAutoCalculate ? (isAnyFreebetActive ? !bet.isFreebet : false) : false;

          // Cálculo da responsabilidade individual para exibição
          const currentLineLiability = isLay ? (Number(displayStake) * ((bet.layOdd || 0) - 1)) : 0;

          return (
            <div key={index} className={`grid grid-cols-12 gap-1 sm:gap-4 px-2 sm:px-4 py-1.5 sm:py-3 items-start border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="col-span-1 text-xs sm:text-base font-medium pt-2 sm:pt-3">{index + 1}º</div>
              
              {/* Column 1: Odds */}
              <div className="col-span-3 sm:col-span-2 pt-1 sm:pt-0">
                <label className="sm:hidden text-[10px] font-medium text-gray-500">{oddLabel}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={isLay ? (bet.layOddInput ?? '') : (bet.oddsInput || '')}
                    onChange={(e) => updateBet(index, isLay ? 'layOdd' : 'odds', e.target.value)}
                    autoComplete="off"
                    className={`${inputStyle}`}
                    placeholder="0.00"
                    onFocus={() => updateBet(index, 'stake', bet.stakeInput ?? bet.stake.toString())}
                  />
                  {bet.isFreebet && bet.odds > 1 && !isLay && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 group">
                      <HelpCircle className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <div className={`absolute bottom-full right-0 mb-1 px-2 py-1 text-xs rounded shadow-lg whitespace-nowrap border z-10 ${
                        isDarkMode ? 'bg-dark-900 text-gray-200 border-gray-700' : 'bg-white text-gray-800 border-gray-200'
                      } opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}>
                        Odd Real: {(bet.odds - 1).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Column 2: Investment */}
              <div className="col-span-4 flex items-start gap-1 sm:gap-3 text-xs sm:text-base pt-1 sm:pt-0">
                <div className="w-full relative">
                  <label className="sm:hidden text-[10px] font-medium text-gray-500">{stakeLabel}</label>
                  <input
                    type="number"
                    value={displayStake}
                    onChange={(e) => updateBet(index, 'stake', e.target.value)}
                    autoComplete="off"
                    disabled={isStakeDisabled}
                    // Removido o 'pr-8' que era usado para o ícone de ajuda
                    className={`${inputStyle} ${isStakeDisabled ? disabledInputStyle : ''}`}
                    placeholder="0.00"
                    step="0.01"
                  />
                  
                  {/* Nova Exibição de Responsabilidade abaixo do input (apenas LAY) */}
                  {isLay && currentLineLiability > 0 && (
                    <div className="text-[10px] sm:text-xs text-red-500 mt-1 font-medium">
                      Responsabilidade: R$ {currentLineLiability.toFixed(2)}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => copyToClipboard(Number(displayStake) || 0)}
                  className={`p-0.5 sm:p-1.5 rounded transition-colors mt-1 ${isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-[#111112]' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'}`}
                >
                  <Copy className="w-3 h-3 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              {/* Column 3: Return */}
              <div className="col-span-2 sm:col-span-3 text-xs sm:text-base pt-2 sm:pt-3">
                <label className="sm:hidden text-[10px] font-medium text-gray-500">{returnLabel}</label>
                <div>
                   <span className={returnColor}>
                     R$ {displayReturn.toFixed(2)}
                   </span>
                   {!isAutoCalculate && totalInvestment > 0 && (
                       <div className={`text-[10px] sm:text-xs ${lineProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {lineProfit > 0 ? '+' : ''}{lineProfit.toFixed(2)} ({lineRoi.toFixed(2)}%)
                       </div>
                   )}
                </div>
              </div>
              
              {/* Column 4: Actions */}
              <div className="col-span-2 flex items-center gap-1 pt-2 sm:pt-3">
                <BackLayToggle
                  betMode={bet.betMode}
                  onToggle={() => toggleBetMode(index)}
                  isDarkMode={isDarkMode}
                />
                <PunctuateToggleButton
                  isEnabled={bet.autoPunctuate !== false}
                  onToggle={() => toggleAutoPunctuate(index)}
                  isDarkMode={isDarkMode}
                />
                <FreebetToggleButton
                  isEnabled={bet.isFreebet === true}
                  onToggle={() => toggleFreebet(index)}
                  isDarkMode={isDarkMode}
                />
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