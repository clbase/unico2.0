import React from 'react';
import { X, Mail, Phone, Clock, Infinity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose }) => {
  const { session } = useAuth();

  if (!isOpen) return null;

  const userMetadata = session?.user?.user_metadata || {};
  const status = userMetadata.status || 'active';
  const accessEnd = userMetadata.access_end;
  const phone = userMetadata.phone || 'Não informado';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Minha Conta
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-gray-900 dark:text-white">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Telefone
              </p>
              <p className="text-gray-900 dark:text-white">
                {phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status do Acesso
              </p>
              <div className="flex items-center gap-2">
                {status === 'active' ? (
                  <>
                    <span className="text-green-600 dark:text-green-400">Ativo</span>
                    <Infinity className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </>
                ) : status === 'temporary' ? (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {accessEnd ? `Expira em ${new Date(accessEnd).toLocaleDateString()}` : 'Temporário'}
                  </span>
                ) : status === 'expired' ? (
                  <span className="text-red-600 dark:text-red-400">Expirado</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">Suspenso</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};