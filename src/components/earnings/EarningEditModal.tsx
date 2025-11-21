import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Earning, EarningFormData } from '../../types/earnings';
import { useTheme } from '../../contexts/ThemeContext';

interface EarningEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EarningFormData) => Promise<void>;
  earning: Earning | null;
  error?: string;
}

export const EarningEditModal: React.FC<EarningEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  earning,
  error,
}) => {
  const [formData, setFormData] = useState<EarningFormData>({
    type: 'profit',
    house_name: '',
    amount: '',
    observation: '',
    event_date: '',
    event_time: '',
  });
  const { isDark } = useTheme();

  useEffect(() => {
    if (earning) {
      setFormData({
        type: earning.type,
        house_name: earning.house_name,
        amount: earning.amount.toString(),
        observation: earning.observation || '',
        event_date: earning.event_date,
        event_time: earning.event_time,
      });
    }
  }, [earning]);

  if (!isOpen || !earning) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Editar Ganho/Perda
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'profit' }))}
                className={`flex items-center justify-center gap-2 p-2 rounded ${
                  formData.type === 'profit'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-dark-700 dark:text-gray-300'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Lucro
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'loss' }))}
                className={`flex items-center justify-center gap-2 p-2 rounded ${
                  formData.type === 'loss'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-dark-700 dark:text-gray-300'
                }`}
              >
                <TrendingDown className="w-5 h-5" />
                Perda
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Casa de Apostas
            </label>
            <input
              type="text"
              name="house_name"
              value={formData.house_name}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor (R$)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observação (Opcional)
            </label>
            <textarea
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hora
              </label>
              <input
                type="time"
                name="event_time"
                value={formData.event_time}
                onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded transition-colors ${
                isDark 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-800 text-white hover:bg-gray-900'
              }`}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};