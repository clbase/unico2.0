import React, { useState, useEffect } from 'react';
import { format, parseISO, addMonths, subMonths, set, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: string) => void;
  accessStart?: string;
  accessEnd?: string;
}

export const TimeModal: React.FC<TimeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  accessStart, 
  accessEnd 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('23:59');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      if (accessEnd) {
        const endDate = zonedTimeToUtc(parseISO(accessEnd), 'America/Sao_Paulo');
        setSelectedDate(endDate);
        setCurrentMonth(endDate);
        setSelectedTime(format(endDate, 'HH:mm'));
      } else {
        const defaultDate = addMonths(new Date(), 1);
        setSelectedDate(defaultDate);
        setCurrentMonth(defaultDate);
        setSelectedTime('23:59');
      }
    }
  }, [isOpen, accessEnd]);

  if (!isOpen) return null;

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const formatDateTimeBrasilia = (dateString: string) => {
    return formatInTimeZone(
      parseISO(dateString),
      'America/Sao_Paulo',
      "dd/MM/yyyy 'às' HH:mm",
      { locale: ptBR }
    );
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  const handleSave = () => {
    // Combine selected date and time
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const combinedDate = set(selectedDate, {
      hours,
      minutes,
      seconds: 59,
      milliseconds: 0
    });

    // Convert to ISO string
    const dateString = combinedDate.toISOString();
    onSave(dateString);
  };

  const handleQuickSelect = (days: number) => {
    const now = new Date();
    const endDate = set(addMonths(now, 0), {
      date: now.getDate() + days,
      hours: 23,
      minutes: 59,
      seconds: 59,
      milliseconds: 0
    });
    onSave(endDate.toISOString());
  };

  const days = generateCalendarDays();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Gerenciar Acesso Temporário
        </h2>
        
        {accessStart && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Início do acesso: {formatDateTimeBrasilia(accessStart)}
          </p>
        )}
        
        {accessEnd && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Fim do acesso: {formatDateTimeBrasilia(accessEnd)}
          </p>
        )}

        {/* Quick Selection Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => handleQuickSelect(7)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            7 dias
          </button>
          <button
            onClick={() => handleQuickSelect(14)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            14 dias
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            30 dias
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 rounded hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
              </button>
            </div>
            <div className="flex-1">
              <div className="relative flex items-center">
                <Clock className="w-4 h-4 absolute left-3 text-gray-500 dark:text-gray-400" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => handleTimeSelect(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-700 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {showCalendar && (
            <div className="mt-4 bg-white dark:bg-dark-700 rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePreviousMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-full"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-full"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="p-2" />
                ))}
                {days.map((date) => {
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      className={`p-2 text-sm rounded-full ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : isToday
                          ? 'bg-gray-200 dark:bg-dark-600'
                          : 'hover:bg-gray-100 dark:hover:bg-dark-600'
                      }`}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};