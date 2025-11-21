export interface BettingHouse {
  id: string;
  name: string;
  balance: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  betting_house_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  created_at: string;
  betting_house: BettingHouse;
}

export interface BankrollStats {
  totalInvestment: number;
  roi: number;
  profitLoss: number;
  totalBets: number;
  resolvedBets: number;
  pendingBets: number;
  pendingInvestment: number;
}