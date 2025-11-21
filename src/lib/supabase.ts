import { createClient } from '@supabase/supabase-js';
// Importações de types da Calculadora (adicionadas)
import { Bet, LimitationBet, AumentadaBet, CalculatorType, ExtracaoBetState } from '../components/calculadora/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL is required');
if (!supabaseAnonKey) throw new Error('VITE_SUPABASE_ANON_KEY is required');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções da Calculadora (adicionadas)

export async function createShare(type: CalculatorType, data: Bet[] | LimitationBet[] | AumentadaBet[] | ExtracaoBetState, totalStake?: number) {
  const prefix = {
    'dutching': 'dutch',
    'limitation': 'limit',
    'aumentada': 'aument',
    'extracao': 'extr'
  }[type];
  
  const randomCode = Math.random().toString(36).substring(2, 15);
  const code = `${prefix}-${randomCode}`;
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 5);

  const { error } = await supabase
    .from('shares')
    .insert({
      code,
      type,
      data,
      total_stake: totalStake,
      expires_at: expiresAt.toISOString()
    });

  if (error) {
    throw error;
  }

  return code;
}

export async function getShare(code: string) {
  const { data, error } = await supabase
    .from('shares')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Share not found');
  }

  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  
  if (now > expiresAt) {
    throw new Error('Share has expired');
  }

  // Ensure the data is properly formatted based on the calculator type
  switch (data.type) {
    case 'dutching':
      data.data = (data.data as Bet[]).map((bet: any) => ({
        odds: Number(bet.odds) || 0,
        stake: Number(bet.stake) || 0,
        // --- CORREÇÃO ADICIONADA AQUI ---
        oddsInput: bet.oddsInput || (Number(bet.odds) || 0).toString()
      }));
      break;
    case 'limitation':
      data.data = (data.data as LimitationBet[]).map((bet: any) => ({
        odds: Number(bet.odds) || 0,
        stake: Number(bet.stake) || 0,
        isEditing: false,
        // --- CORREÇÃO ADICIONADA AQUI ---
        oddsInput: bet.oddsInput || (Number(bet.odds) || 0).toString()
      }));
      break;
    case 'aumentada':
      data.data = (data.data as AumentadaBet[]).map((bet: any) => ({
        odds: Number(bet.odds) || 0,
        stake: Number(bet.stake) || 0,
        increase: Number(bet.increase) || 0,
        // --- CORREÇÃO ADICIONADA AQUI ---
        oddsInput: bet.oddsInput || (Number(bet.odds) || 0).toString()
      }));
      break;
    case 'extracao':
      data.data = {
        betType: data.data.betType || 'freebet',
        stake: Number(data.data.stake) || 0,
        backOdd: Number(data.data.backOdd) || 0,
        layOdd: Number(data.data.layOdd) || 0,
        commission: Number(data.data.commission) || 6.5
      } as ExtracaoBetState;
      break;
  }

  // Ensure total_stake is a number
  if (data.total_stake) {
    data.total_stake = Number(data.total_stake);
  }

  return data;
}