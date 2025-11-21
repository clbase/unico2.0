import React, { useState } from 'react';
import { X, Settings, Calendar } from 'lucide-react';

interface DaysFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDays: number;
  onSave: (days: number) => Promise<void>;
}

export const DaysFilterModal: React.FC<DaysFilterModalProps> = ({
  isOpen,
  onClose,
  currentDays,
  onSave,
}) => {
  const [selectedDays, setSelectedDays] = useState(currentDays);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(selectedDays);
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const options = [
    { value: 3, label: '3 dias' },
    { value: 5, label: '5 dias' },
    { value: 7, label: '7 dias' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Período de Análise
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Escolha quantos dias você deseja visualizar no card de lucros recentes:
        </p>

        <div className="space-y-3 mb-6">
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedDays === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="radio"
                name="days"
                value={option.value}
                checked={selectedDays === option.value}
                onChange={(e) => setSelectedDays(Number(e.target.value))}
                className="sr-only"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {option.label}
                </span>
                {selectedDays === option.value && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            } bg-gray-800 dark:bg-blue-500 text-white hover:bg-gray-900 dark:hover:bg-blue-600`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};