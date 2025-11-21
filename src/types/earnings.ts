export interface Earning {
  id: string;
  user_id: string;
  type: 'profit' | 'loss';
  house_name: string;
  amount: number;
  observation?: string;
  event_date: string;
  event_time: string;
  created_at: string;
}

export interface EarningFormData {
  type: 'profit' | 'loss';
  house_name: string;
  amount: string;
  observation: string;
  event_date: string;
  event_time: string;
}