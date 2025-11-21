import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDateTime = (date: string, time: string) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const dateObj = new Date(year, month - 1, day, hours, minutes);
  return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export const formatDate = (date: string) => {
  return format(parseISO(date), 'dd/MM/yyyy', { locale: ptBR });
};