import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TabsSettings {
  active_color: string;
  is_active: boolean;
}

export function useTabsColor() {
  const [tabsColor, setTabsColor] = useState<string>('');
  const [isCustomColorActive, setIsCustomColorActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // <-- ADICIONADO

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('calculator_tabs_settings')
        .select('active_color, is_active')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setTabsColor(data.active_color);
        setIsCustomColorActive(data.is_active);
      }
    } catch (error) {
      console.error('Error loading tabs color:', error);
    } finally {
      setIsLoading(false); // <-- ADICIONADO
    }
  };

  return { tabsColor, isCustomColorActive, isLoading }; // <-- ADICIONADO 'isLoading'
}