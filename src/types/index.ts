// Auth types
export interface AuthContextType {
  session: any; // Using any to avoid dependency on @supabase/supabase-js in types
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any | null }>;
}

// Bet types
export interface Bet {
  id: string;
  house_a: string;
  house_b: string;
  odds: number;
  investment: number;
  dutching_investment: number;
  event_date: string;
  event_time: string;
  status: 'pending' | 'won' | 'lost' | 'returned' | 'cashout';
  house_type: 'A' | 'B' | 'C' | 'D' | 'E';
  group_id: string;
  created_at: string;
  market: string;
  cashout_amount?: number;
  // --- NOVOS CAMPOS ADICIONADOS ---
  is_freebet?: boolean;
  bet_mode?: 'back' | 'lay';
  // --------------------------------
}

export interface GroupedBet {
  betA: Bet;
  betB: Bet | null;
  betC: Bet | null;
  betD: Bet | null;
  betE: Bet | null;
  key: string;
}

export interface BetStats {
  totalBets: number;
  resolvedBets: number;
  pendingBets: number;
  pendingInvestment: number;
}

// Chart types
export interface ChartData {
  date: string;
  lucro: number;
  resultado: number;
  investimento: number;
}

export interface MonthlyProfitData {
  date: string;
  profit: number;
  cumulativeProfit: number;
}