import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => (
  <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded flex items-center gap-2">
    <CheckCircle className="w-5 h-5 flex-shrink-0" />
    {message}
  </div>
);