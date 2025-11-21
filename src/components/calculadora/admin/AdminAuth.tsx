import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { supabase } from '../../../lib/supabase'; // <-- CAMINHO CORRIGIDO

interface AdminAuthProps {
  onAuthSuccess: () => void;
  isDarkMode: boolean;
}

export function AdminAuth({ onAuthSuccess, isDarkMode }: AdminAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        sessionStorage.setItem('adminAuth', 'true');
        sessionStorage.setItem('adminId', data.user.id);
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else {
        setError('Erro ao autenticar. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // --- CORREÇÃO DE TONALIDADE ---
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-100'}`}>
      <div className={`w-full max-w-md rounded-xl shadow-2xl p-8 ${isDarkMode ? 'bg-dark-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <Lock className="w-10 h-10 text-blue-500" />
          <h1 className="text-2xl font-bold">Acesso Admin</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode
                  ? 'bg-[#111112] border-gray-800 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="admin@vivendodesurebet.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode
                  ? 'bg-[#111112] border-gray-800 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-3 rounded-md transition-colors ${
              isDarkMode
                ? 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'
            }`}
          >
            {isLoading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Acesso restrito a administradores</p>
        </div>
      </div>
    </div>
  );
}