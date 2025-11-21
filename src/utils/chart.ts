import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay } from 'date-fns';
import { ChartData, Bet, GroupedBet } from '../types';
import { groupBets, calculateGroupProfit } from './bet';

export const prepareChartData = (bets: Bet[], days: number): ChartData[] => {
  const dailyProfits = new Map<string, number>();
  
  const today = startOfDay(new Date());
  const startDate = startOfDay(new Date(today));
  startDate.setDate(startDate.getDate() - (days - 1));
  
  const dates = eachDayOfInterval({ start: startDate, end: today });

  dates.forEach(date => {
    dailyProfits.set(format(date, 'yyyy-MM-dd'), 0);
  });

  const groupedBets = groupBets(bets);
  groupedBets.forEach(group => {
    if (group.betA && group.betB && 
        group.betA.status !== 'pending' && 
        group.betB.status !== 'pending') {
      const profit = calculateGroupProfit(group.betA, group.betB);
      if (dailyProfits.has(group.betA.event_date)) {
        dailyProfits.set(
          group.betA.event_date, 
          (dailyProfits.get(group.betA.event_date) || 0) + profit
        );
      }
    }
  });

  return dates.map(date => ({
    date: format(date, 'dd/MM'),
    lucro: dailyProfits.get(format(date, 'yyyy-MM-dd')) || 0,
    resultado: 0,
    investimento: 0
  }));
};