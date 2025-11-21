import React, { useEffect, useState } from 'react';
import CalculatorComponent from '../components/calculadora/Calculator';
import { AdminAuth } from '../components/calculadora/admin/AdminAuth';
import { AdminPanel } from '../components/calculadora/admin/AdminPanel';
import { getShare } from '../lib/supabase';
import { Bet, LimitationBet, AumentadaBet, CalculatorType } from '../components/calculadora/types';
import { useTheme } from '../contexts/ThemeContext';

function CalculadoraPage() {
  const { isDark } = useTheme();
  const [calculatorState, setCalculatorState] = useState<{
    type: CalculatorType;
    bets: Bet[] | LimitationBet[] | AumentadaBet[];
    totalStake?: number;
  } | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    // Rota de admin da calculadora agora é /admin-calculadora
    const newAdminRoute = path === '/admin-calculadora';
    setIsAdminRoute(newAdminRoute);

    if (newAdminRoute) {
      const isAuth = sessionStorage.getItem('adminAuth') === 'true';
      setIsAdminAuthenticated(isAuth);
    }
  }, []);

  useEffect(() => {
    if (isAdminRoute) return;

    const loadSharedCalculation = async () => {
      const params = new URLSearchParams(window.location.search);
      const shareCode = params.get('share');

      if (!shareCode) return;

      try {
        const share = await getShare(shareCode);

        if (share.data && (Array.isArray(share.data) || typeof share.data === 'object')) {
          if (share.type === 'aumentada') {
            const aumentadaBets = share.data as AumentadaBet[];
            const fixedBet = aumentadaBets.find(bet => bet.isFixed);

            if (fixedBet) {
              const totalStake = aumentadaBets.reduce((sum, bet) => sum + (bet.stake || 0), 0);
              setCalculatorState({
                type: share.type,
                bets: aumentadaBets,
                totalStake
              });
            } else {
              setCalculatorState({
                type: share.type,
                bets: aumentadaBets,
                totalStake: share.total_stake
              });
            }
          } else {
            setCalculatorState({
              type: share.type,
              bets: share.data as any, // Corrigido para aceitar ExtracaoBetState
              totalStake: share.total_stake
            });
          }
        }
      } catch (error) {
        console.error('Error loading share:', error);
        alert('Este link de compartilhamento é inválido ou expirou.');
      }
    };

    loadSharedCalculation();
  }, [isAdminRoute]);

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminId');
    setIsAdminAuthenticated(false);
    // Redireciona para a home da calculadora
    window.location.href = '/calculadora';
  };

  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return <AdminAuth onAuthSuccess={() => setIsAdminAuthenticated(true)} isDarkMode={isDark} />;
    }
    return <AdminPanel isDarkMode={isDark} onLogout={handleAdminLogout} />;
  }

  return <CalculatorComponent initialState={calculatorState} />;
}

export default CalculadoraPage;