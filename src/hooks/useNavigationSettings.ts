import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 1. Interface atualizada para incluir a nova configuração
interface NavigationSettings {
  calculator: boolean;
  earnings: boolean;
  bankroll: boolean;
  login_preview: boolean; // <-- ADICIONADO
}

export const useNavigationSettings = () => {
  // 2. Estado inicial atualizado com o padrão 'false'
  const [settings, setSettings] = useState<NavigationSettings>({
    calculator: true,
    earnings: true,
    bankroll: true,
    login_preview: false, // <-- ADICIONADO
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.rpc('get_navigation_settings');
      
      if (error) throw error;
      
      // 3. O código de conversão agora funciona dinamicamente
      // Começa com os padrões, caso algo falhe
      const settingsObj = { ...settings };

      if (data) {
        data.forEach((setting: { setting_key: string; is_enabled: boolean }) => {
          if (setting.setting_key in settingsObj) {
            settingsObj[setting.setting_key as keyof NavigationSettings] = setting.is_enabled;
          }
        });
      }

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching navigation settings:', error);
      // Mantém os padrões em caso de erro
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchSettings };
};