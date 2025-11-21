import { Bet, GroupedBet } from '../types';

export const calculateBetReturn = (bet: Bet): number => {
  switch (bet.status) {
    case 'won':
      return bet.dutching_investment;
    case 'returned':
      return bet.investment;
    case 'cashout':
      return bet.cashout_amount || 0;
    case 'lost':
      return 0;
    default:
      return 0;
  }
};

export const calculateGroupProfit = (group: GroupedBet): number => {
  const allBets = [group.betA, group.betB, group.betC, group.betD, group.betE].filter(Boolean) as Bet[];
  
  if (allBets.some(bet => bet.status === 'pending')) {
    return 0;
  }
  
  const totalInvestment = allBets.reduce((sum, bet) => sum + bet.investment, 0);
  const totalReturn = allBets.reduce((sum, bet) => sum + calculateBetReturn(bet), 0);
  
  return totalReturn - totalInvestment;
};

export const groupBets = (bets: Bet[]): GroupedBet[] => {
  const grouped: { [key: string]: GroupedBet } = {};

  bets.forEach((bet) => {
    const key = `${bet.event_date}-${bet.event_time}-${bet.group_id}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        betA: bet.house_type === 'A' ? bet : null as any,
        betB: bet.house_type === 'B' ? bet : null,
        betC: bet.house_type === 'C' ? bet : null,
        betD: bet.house_type === 'D' ? bet : null,
        betE: bet.house_type === 'E' ? bet : null,
        key,
      };
    } else {
      if (bet.house_type === 'A') {
        grouped[key].betA = bet;
      } else if (bet.house_type === 'B') {
        grouped[key].betB = bet;
      } else if (bet.house_type === 'C') {
        grouped[key].betC = bet;
      } else if (bet.house_type === 'D') {
        grouped[key].betD = bet;
      } else if (bet.house_type === 'E') {
        grouped[key].betE = bet;
      }
    }
  });

  return Object.values(grouped);
};