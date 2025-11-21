import React, { useState } from 'react';
import { X, Users, Crown, FileSpreadsheet, Shield } from 'lucide-react';

interface UserCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, category: string) => Promise<void>;
  error?: string;
}

export const UserCategoryModal: React.FC<UserCategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  error 
}) => {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('assinatura_planilha');
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email, category);
    setEmail('');
    setCategory('assinatura_planilha');
  };

  const categories = [
    { value: 'administradores', label: 'Administradores', icon: Shield, color: 'text-red-600' },
    { value: 'membros_vip', label: 'Membros VIP', icon: Crown, color: 'text-yellow-600' },
    { value: 'assinatura_planilha', label: 'Assinatura Planilha', icon: FileSpreadsheet, color: 'text-blue-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Adicionar Usuário
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              placeholder="exemplo@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria
            </label>
            <div className="space-y-2">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <label
                    key={cat.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      category === cat.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={category === cat.value}
                      onChange={(e) => setCategory(e.target.value)}
                      className="sr-only"
                    />
                    <IconComponent className={`w-5 h-5 mr-3 ${cat.color}`} />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {cat.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                setEmail('');
                setCategory('assinatura_planilha');
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};