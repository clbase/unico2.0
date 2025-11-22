import React, { useState, useRef, useEffect } from 'react';
import { Copy, Trash2, HelpCircle, Zap, Edit3, Settings } from 'lucide-react';
import { LimitationBet, LimitationCalcResult } from '../types';
import { CalculatorStats } from '../shared/CalculatorStats';
import { PunctuateToggleButton } from '../shared/PunctuateToggleButton';
import { FreebetToggleButton } from '../shared/FreebetToggleButton';
import { BackLayToggle } from '../shared/BackLayToggle';
import { LimitationTableHeader } from './LimitationTableHeader';

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
  const { totalInvestment, profit, totalReturn } = calcResult;
  const isAnyFreebetActive = bets.some(b => b.isFreebet);

  // Estado para controlar qual menu de configurações está aberto (índice da linha)
  // Usado apenas no Mobile
  const [openSettingsIndex, setOpenSettingsIndex] = useState<number | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setOpenSettingsIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Estilos
  const inputStyle = `w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} text-sm sm:text-lg`;
  const disabledInputStyle = `opacity-50 cursor-not-allowed bg-gray-100 dark:bg-dark-800`;

  return (
    <div className="space-y-4 relative">
      
      {/* Botão de Modo Automático/Manual - OCULTO NO MOBILE (hidden sm:flex) */}
      <div className="hidden sm:flex absolute -top-14 right-0">
         <button
            onClick={toggleAutoCalculate}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${
               isAutoCalculate
                  ? 'bg-[#3c3c3c] text-white hover:bg-[#2b2b2b]' 
                  : (isDarkMode ? 'bg-dark-700 text-gray-300 border border-gray-600 hover:bg-dark-600' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50')
            }`}
            title={isAutoCalculate ? "Modo Automático (Dutching)" : "Modo Manual (Livre)"}
         >
            {isAutoCalculate ? <Zap className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{isAutoCalculate ? "Automático" : "Manual"}</span>
         </button>
      </div>

      {/* Resumo do Investimento e Stats */}
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
            translate="no"
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
        <LimitationTableHeader isDarkMode={isDarkMode} />
        
        {bets.map((bet, index) => {
          
          const isLay = bet.betMode === 'lay';
          
          // Display Logic
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
          const currentLineLiability = isLay ? (Number(displayStake) * ((bet.layOdd || 0) - 1)) : 0;

          return (
            <div key={index} className={`grid grid-cols-12 gap-1 sm:gap-4 px-2 sm:px-4 py-2 sm:py-3 items-center border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="col-span-1 text-xs sm:text-base font-medium">{index + 1}º</div>
              
              {/* Column 1: Odds */}
              <div className="col-span-3 sm:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    translate="no"
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
                      } opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} translate="no">
                        Odd Real: {(bet.odds - 1).toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Column 2: Investment */}
              <div className="col-span-4 flex flex-col justify-center">
                 <div className="flex items-center gap-1 sm:gap-3">
                    <div className="w-full relative">
                      <input
                        type="number"
                        translate="no"
                        value={displayStake}
                        onChange={(e) => updateBet(index, 'stake', e.target.value)}
                        autoComplete="off"
                        disabled={isStakeDisabled}
                        className={`${inputStyle} ${isStakeDisabled ? disabledInputStyle : ''}`}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <button
                      onClick={() => copyToClipboard(Number(displayStake) || 0)}
                      className={`p-1.5 rounded transition-colors ${isDarkMode ? 'text-gray-500 hover:text-blue-400 hover:bg-[#111112]' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                 </div>
                 
                 {/* Liability Message (Lay) */}
                 {isLay && currentLineLiability > 0 && (
                    <div className="text-[9px] sm:text-xs text-red-500 font-medium mt-0.5" translate="no">
                      Resp: R$ {currentLineLiability.toFixed(2)}
                    </div>
                  )}
              </div>
              
              {/* Column 3: Return */}
              <div className="col-span-2 sm:col-span-3 text-xs sm:text-base flex flex-col justify-center">
                <div>
                   <span className={returnColor} translate="no">
                     R$ {displayReturn.toFixed(2)}
                   </span>
                   {!isAutoCalculate && totalInvestment > 0 && (
                       <div className={`text-[9px] sm:text-xs ${lineProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} translate="no">
                          {lineProfit > 0 ? '+' : ''}{lineProfit.toFixed(2)} ({lineRoi.toFixed(2)}%)
                       </div>
                   )}
                </div>
              </div>
              
              {/* Column 4: Actions (Gear/Buttons + Delete) */}
              <div className="col-span-2 flex items-center justify-end gap-1 relative">
                
                {/* --- DESKTOP: Botões visíveis (hidden sm:flex) --- */}
                <div className="hidden sm:flex items-center gap-1">
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
                </div>

                {/* --- MOBILE: Engrenagem (sm:hidden) --- */}
                <div className="sm:hidden relative">
                  <button
                    onClick={() => setOpenSettingsIndex(openSettingsIndex === index ? null : index)}
                    className={`p-1.5 rounded transition-colors ${
                      openSettingsIndex === index 
                        ? 'bg-[#7200C9] text-white' 
                        : (isDarkMode ? 'text-gray-400 hover:bg-dark-800' : 'text-gray-500 hover:bg-gray-100')
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {/* Popover Menu (Só abre no mobile) */}
                  {openSettingsIndex === index && (
                    <div 
                      ref={settingsRef}
                      className={`absolute right-0 top-8 z-50 p-2 rounded-lg shadow-2xl border flex gap-2 items-center animate-fade-in ${
                        isDarkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}
                      style={{ minWidth: '140px' }}
                    >
                       {/* Arrow pointing up */}
                       <div className={`absolute -top-1.5 right-2.5 w-3 h-3 rotate-45 border-l border-t ${
                          isDarkMode ? 'bg-dark-800 border-gray-700' : 'bg-white border-gray-200'
                       }`}></div>

                      <div className="flex gap-2 relative z-10">
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
                      </div>
                    </div>
                  )}
                </div>

                {/* Botão Deletar (Visível em ambos se houver mais de 2 apostas) */}
                {bets.length > 2 && (
                  <button
                    onClick={() => removeBet(index)}
                    className={`p-1.5 rounded transition-colors ${isDarkMode ? 'text-red-500 hover:text-red-400 hover:bg-[#111112]' : 'text-red-500 hover:text-red-600 hover:bg-gray-100'}`}
                  >
                    <Trash2 className="w-4 h-4" />
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