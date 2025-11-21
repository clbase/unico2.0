export interface Bet {
  odds: number;
  stake: number;
  autoPunctuate?: boolean;
  oddsInput?: string;
  stakeInput?: string; // <-- ADICIONADO
}

export interface LimitationBet extends Bet {
  isEditing: boolean;
  isFreebet?: boolean;
  betMode: 'back' | 'lay'; 
  layOdd?: number; 
  layOddInput?: string;
}

export interface AumentadaBet extends Bet {
  increase: number;
  isFixed?: boolean;
  fixedStake?: number;
}

export type CalculatorType = 'dutching' | 'limitation' | 'aumentada' | 'extracao';

export interface ExtracaoBetState {
  betType: 'freebet' | 'normal';
  stake: number;
  backOdd: number;
  layOdd: number;
  commission: number;
}

export interface LimitationCalcResult {
  stakes: number[];
  returns: number[];
  totalReturn: number;
  profit: number;
  totalInvestment: number; 
  roi: number;
  liability: number; 
}