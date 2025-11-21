/**
 * VDS - Regras de Cálculo Unificadas
 * Este arquivo contém toda a lógica matemática para garantir consistência
 * entre a Calculadora e a Planilha.
 */

// --- TIPOS BÁSICOS ---
type BetMode = 'back' | 'lay';

interface BetInput {
  stake: number;
  odds: number;
  isFreebet: boolean;
  betMode: BetMode;
}

// --- REGRAS DE CUSTO (INVESTIMENTO REAL) ---

/**
 * Calcula quanto sai do bolso do usuário (Custo Real).
 * - Back Normal: O valor da aposta (Stake).
 * - Back Freebet: Zero (0), pois é grátis.
 * - Lay: A Responsabilidade (Liability) = Stake * (Odd - 1).
 */
export const calculateRealCost = (stake: number, odds: number, isFreebet: boolean, mode: BetMode): number => {
  if (mode === 'lay') {
    // No Lay, o custo é a responsabilidade
    return stake * (odds - 1);
  }
  
  if (isFreebet) {
    // Freebet não tem custo inicial
    return 0;
  }

  // Back Normal
  return stake;
};

// --- REGRAS DE RETORNO (VALOR QUE VOLTA) ---

/**
 * Calcula o valor bruto que retorna para a conta se a aposta vencer.
 * - Back Normal: Stake * Odd.
 * - Back Freebet: (Odd - 1) * Stake (Lucro líquido da freebet).
 * - Lay: Stake + Responsabilidade (Valor total segurado).
 */
export const calculatePotentialReturn = (stake: number, odds: number, isFreebet: boolean, mode: BetMode): number => {
  if (mode === 'lay') {
    // Se a aposta Lay ganha (o evento não acontece), você recebe de volta
    // a responsabilidade (que travou) + o stake do outro apostador.
    const liability = stake * (odds - 1);
    return stake + liability;
  }

  if (isFreebet) {
    // Na freebet, a casa paga apenas o lucro
    return (odds - 1) * stake;
  }

  // Back Normal
  return stake * odds;
};

// --- REGRAS DE LUCRO E ROI ---

/**
 * Calcula o Lucro Líquido.
 * Lucro = Retorno - Custo Real.
 */
export const calculateProfit = (returnVal: number, cost: number): number => {
  return returnVal - cost;
};

/**
 * Calcula o ROI (Retorno sobre Investimento).
 * ROI = (Lucro / Custo Real) * 100.
 * Retorna 0 se o custo for 0 (evita divisão por zero).
 */
export const calculateROI = (profit: number, cost: number): number => {
  if (cost <= 0) return 0;
  return (profit / cost) * 100;
};

// --- REGRAS ESPECÍFICAS DE DUTCHING/LIMITAÇÃO ---

/**
 * Calcula o Stake necessário para uma aposta Lay cobrir uma aposta Back (Extração).
 * Usado na Calculadora Avançada.
 */
export const calculateExtractionStake = (
  targetBackStake: number, 
  backOdd: number, 
  layOdd: number, 
  isBackFreebet: boolean
): number => {
  if (layOdd <= 0) return 0;

  if (isBackFreebet) {
    // Lucro da Freebet / Odd Lay
    return (targetBackStake * (backOdd - 1)) / layOdd;
  } else {
    // Retorno do Back / Odd Lay
    return (targetBackStake * backOdd) / layOdd;
  }
};

/**
 * Calcula a Responsabilidade de uma aposta Lay.
 * Liability = Stake * (Odd - 1).
 */
export const calculateLiability = (stake: number, odds: number): number => {
  return stake * (odds - 1);
};

// --- HELPER PARA A PLANILHA (BET LIST) ---

/**
 * Helper para calcular o status financeiro de uma aposta salva no banco.
 * Útil para o componente BetList.tsx.
 */
export const getBetFinancials = (bet: { 
  investment: number; // No banco, isso já deve ser o Custo Real
  dutching_investment: number; // No banco, isso é o Retorno Potencial
  status: string;
  cashout_amount?: number;
}) => {
  let finalReturn = 0;

  switch (bet.status) {
    case 'won':
      finalReturn = bet.dutching_investment;
      break;
    case 'returned':
      finalReturn = bet.investment;
      break;
    case 'cashout':
      finalReturn = bet.cashout_amount || 0;
      break;
    case 'lost':
    case 'pending':
    default:
      finalReturn = 0;
  }

  // Se pendente, lucro é 0 para visualização, ou -investimento se quiser projetar perda
  const profit = bet.status === 'pending' ? 0 : finalReturn - bet.investment;

  return {
    invested: bet.investment,
    returned: finalReturn,
    profit: profit
  };
};