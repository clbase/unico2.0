import React from 'react';
import { Copy, X } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  onCopy: () => void;
  isDarkMode: boolean;
}

export function ShareModal({ isOpen, onClose, shareUrl, onCopy, isDarkMode }: ShareModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`w-full max-w-sm rounded-lg shadow-xl ${isDarkMode ? 'bg-dark-800' : 'bg-white'} p-4`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Link Gerado
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-opacity-10 ${
              isDarkMode ? 'hover:bg-white' : 'hover:bg-gray-100'
            }`}
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>
        
        <div className={`mb-4 p-3 rounded-md break-all text-sm ${
          isDarkMode ? 'bg-dark-900 text-gray-300' : 'bg-gray-100 text-gray-700'
        }`}>
          {shareUrl}
        </div>
        
        <button
          onClick={onCopy}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
            isDarkMode 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Copy className="w-4 h-4" />
          <span>Copiar Link</span>
        </button>
      </div>
    </div>
  );
}