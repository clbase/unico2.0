import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { STATUS_COLORS, STATUS_TEXT } from './constants';

export const formatDateTime = (date: string, time: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const dateObj = new Date(year, month - 1, day, hours, minutes);
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export const getStatusColor = (status: string) => {
  if (status === 'pending') {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.active;
};

export const getStatusText = (status: string) => {
  if (status === 'pending') {
    return 'Pendente';
  }
  return STATUS_TEXT[status as keyof typeof STATUS_TEXT] || STATUS_TEXT.active;
};