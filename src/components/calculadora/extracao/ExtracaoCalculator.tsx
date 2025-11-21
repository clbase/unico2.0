import React from 'react';
import { ExtracaoBetState } from '../types';
import { Percent, ArrowRightLeft } from 'lucide-react';
import { ShareButton } from '../shared/ShareButton';

interface ExtracaoCalculatorProps {
  isDarkMode: boolean;
  state: ExtracaoBetState;
  setState: (state: ExtracaoBetState) => void;
  resetCalculator: () => void;
  toggleTheme: () => void;
}

export function ExtracaoCalculator({
  isDarkMode,
  state,
  setState,
  resetCalculator,
  toggleTheme
}: ExtracaoCalculatorProps) {

  // --- Funções de Cálculo ---
  const calculateExtracao = () => {
    const { betType, stake, backOdd, layOdd, commission } = state;
    if (!stake || !backOdd || !layOdd) {
      return { layStake: 0, liability: 0, profit: 0, retention: 0 };
    }

    const commissionRate = commission / 100;
    
    let layStake = 0;
    let profit = 0;

    if (betType === 'freebet') {
      // Fórmula para Aposta Grátis (Stake Não Retornada)
      layStake = (stake * (backOdd - 1)) / (layOdd - commissionRate);
      profit = layStake * (1 - commissionRate);
    } else {
      // Fórmula para Bônus Normal (Stake Retornada)
      layStake = (stake * backOdd) / (layOdd - commissionRate);
      profit = (layStake * (1 - commissionRate)) - stake;
    }

    const liability = layStake * (layOdd - 1);
    const retentionBase = (betType === 'freebet' ? stake : stake + liability);
    const retention = (retentionBase > 0) ? (profit / retentionBase) * 100 : 0;

    return { layStake, liability, profit, retention };
  };

  const { layStake, liability, profit, retention } = calculateExtracao();

  const handleUpdate = (field: keyof ExtracaoBetState, value: string | number) => {
    let numericValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) || 0 : value;
    
    // Evita valores negativos
    if (numericValue < 0) numericValue = 0;

    setState({
      ...state,
      [field]: numericValue
    });
  };

  const handleTypeChange = (betType: 'freebet' | 'normal') => {
    setState({ ...state, betType });
  };

  const inputStyle = `w-full px-2 sm:px-4 py-1.5 sm:py-3 text-base sm:text-xl border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    isDarkMode
      ? 'bg-[#111112] border-gray-800 text-gray-100'
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  const buttonStyle = (isActive: boolean) =>
    `flex-1 py-3 text-sm sm:text-base rounded-md border transition-colors ${
      isDarkMode
        ? `border-gray-700 ${isActive ? 'bg-blue-500 text-white' : 'bg-dark-900 text-gray-300 hover:bg-dark-800'}`
        : `border-gray-300 ${isActive ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`
    }`;

  return (
    <div className="space-y-4">
      
      {/* --- Seletor de Tipo --- */}
      <div className="space-y-2">
        <label className="block text-xs sm:text-base font-medium mb-1 sm:mb-2">
          Tipo de Bônus
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleTypeChange('freebet')}
            className={buttonStyle(state.betType === 'freebet')}
          >
            Aposta Grátis (Stake não retorna)
          </button>
          <button
            onClick={() => handleTypeChange('normal')}
            className={buttonStyle(state.betType === 'normal')}
          >
            Bônus Normal (Stake retorna)
          </button>
        </div>
      </div>

      {/* --- Inputs Principais --- */}
      <div className="grid grid-cols-2 gap-4 sm:gap-8">
        <div>
          <label className="block text-xs sm:text-base font-medium mb-1 sm:mb-2">
            Valor da Aposta (R$)
          </label>
          <input
            type="number"
            value={state.stake || ''}
            onChange={(e) => handleUpdate('stake', e.target.value)}
            autoComplete="off" // <-- CORREÇÃO AQUI
            className={inputStyle}
            placeholder="100.00"
          />
        </div>
        <div>
          <label className="block text-xs sm:text-base font-medium mb-1 sm:mb-2">
            Comissão da Bolsa (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={state.commission || ''}
              onChange={(e) => handleUpdate('commission', e.target.value)}
              autoComplete="off" // <-- CORREÇÃO AQUI
              className={inputStyle}
              placeholder="6.5"
            />
            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 sm:gap-8 items-end">
        {/* Odd Back */}
        <div className="col-span-5">
          <label className="block text-xs sm:text-base font-medium mb-1 sm:mb-2">
            Odd A Favor (Back)
          </label>
          <input
            type="number"
            value={state.backOdd || ''}
            onChange={(e) => handleUpdate('backOdd', e.target.value)}
            autoComplete="off" // <-- CORREÇÃO AQUI
            className={inputStyle}
            placeholder="2.50"
          />
        </div>

        {/* Ícone */}
        <div className="col-span-2 flex justify-center pb-2 sm:pb-3">
          <ArrowRightLeft className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        </div>

        {/* Odd Lay */}
        <div className="col-span-5">
          <label className="block text-xs sm:text-base font-medium mb-1 sm:mb-2">
            Odd Contra (Lay)
          </label>
          <input
            type="number"
            value={state.layOdd || ''}
            onChange={(e) => handleUpdate('layOdd', e.target.value)}
            autoComplete="off" // <-- CORREÇÃO AQUI
            className={inputStyle}
            placeholder="2.55"
          />
        </div>
      </div>

      {/* --- Resultados --- */}
      <div className="pt-4 space-y-3">
        <h3 className={`text-lg sm:text-xl font-semibold border-b pb-2 mb-3 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          Resultados
        </h3>
        
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-[#111112] border-gray-800' : 'bg-white border-gray-300'} space-y-3`}>
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-medium">Apostar Contra (Lay):</span>
            <span className="text-base sm:text-xl font-semibold text-blue-500">
              R$ {layStake.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-medium">Responsabilidade (Liability):</span>
            <span className="text-base sm:text-xl font-semibold text-red-500">
              R$ {liability.toFixed(2)}
            </span>
          </div>
        </div>

        <div className={`p-4 rounded-lg ${profit >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border space-y-3`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm sm:text-base font-medium ${profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>Lucro/Prejuízo:</span>
            <span className={`text-base sm:text-xl font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              R$ {profit.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm sm:text-base font-medium ${profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {state.betType === 'freebet' ? 'Retenção do Bônus:' : 'Margem da Aposta:'}
            </span>
            <span className={`text-base sm:text-xl font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {retention.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* --- Botões de Ação --- */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={resetCalculator}
          className={`px-4 py-2 rounded-md transition-colors ${
            isDarkMode
              ? 'text-gray-300 border border-gray-600 hover:bg-[#111112]'
              : 'text-gray-700 border border-gray-400 hover:bg-gray-100'
          }`}
        >
          Limpar
        </button>
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-md transition-colors ${
            isDarkMode
              ? 'text-gray-300 border border-gray-600 hover:bg-[#111112]'
              : 'text-gray-700 border border-gray-400 hover:bg-gray-100'
          }`}
        >
          {isDarkMode ? 'Tema Claro' : 'Tema Escuro'}
        </button>
        <ShareButton
          isDarkMode={isDarkMode}
          calculatorType="extracao"
          bets={state}
        />
      </div>
    </div>
  );
}