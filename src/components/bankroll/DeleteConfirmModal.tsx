import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {title}
          </h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};