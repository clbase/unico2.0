import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook para verificar se a calculadora de Extração está ativa.
 * Começa como 'loading' e 'inactive'.
 */
export function useExtracaoStatus() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('extracao_feature_settings')
        .select('is_active')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setIsActive(data.is_active);
      } else {
        // Se a tabela falhar ou estiver vazia, mantenha desativado por segurança
        setIsActive(false);
      }
    } catch (error) {
      console.error('Erro ao carregar status da feature Extração:', error);
      setIsActive(false); // Padrão é desativado em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  return { isActive, isLoading };
}