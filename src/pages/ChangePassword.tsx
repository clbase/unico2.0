import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield } from 'lucide-react';

export const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkPasswordStatus();
  }, []);

  const checkPasswordStatus = async () => {
    try {
      const { data: needsChange, error } = await supabase.rpc('is_temporary_password');
      
      if (error) throw error;
      
      if (!needsChange) {
        navigate('/planilha'); // ATUALIZADO
      }
    } catch (error) {
      console.error('Error checking password status:', error);
      navigate('/planilha'); // ATUALIZADO
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // First update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // Then update user metadata to remove needs_password_change flag
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { needs_password_change: false }
      });

      if (metadataError) throw metadataError;

      // Sign out to force a new login with the new password
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Error updating password:', error);
      setError(error.message || 'Erro ao atualizar senha');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-dark-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Alterar Senha
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Por favor, escolha uma nova senha para sua conta
            </p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border rounded dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-500 text-white py-3 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-dark-800 transition-colors ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Alterando senha...
                </span>
              ) : (
                'Alterar Senha'
              )}
            </button>
          </form>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <div className="flex flex-col items-center text-center space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Escolha uma senha forte que você não use em outros sites
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};