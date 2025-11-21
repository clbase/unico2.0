import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  error?: string;
}

export const EmailModal: React.FC<EmailModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  error 
}) => {
  const [email, setEmail] = useState('');
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Autorizar Novo Email
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              placeholder="exemplo@email.com"
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setEmail('');
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};