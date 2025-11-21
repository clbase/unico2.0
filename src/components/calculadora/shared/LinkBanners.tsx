import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase'; // <-- CAMINHO CORRIGIDO

interface LinkBannersProps {
  isDarkMode: boolean;
}

interface BannerSettings {
  title: string;
  link_url: string;
  is_active: boolean;
}

// Estilo de card (agora único)
const cardStyle = (isDarkMode: boolean) => 
  `block rounded-xl shadow-2xl p-3 sm:p-4 transition-colors ${
    isDarkMode
      ? 'bg-dark-800 text-gray-100 hover:bg-dark-700'
      : 'bg-white text-gray-900 hover:bg-gray-50'
  }`;

export function LinkBanners({ isDarkMode }: LinkBannersProps) {
  const [whatsappSettings, setWhatsappSettings] = useState<BannerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Busca apenas a configuração do WhatsApp
      const { data, error } = await supabase
        .from('whatsapp_banner_settings')
        .select('title, link_url, is_active')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) setWhatsappSettings(data);

    } catch (error) {
      console.error('Error loading banner settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isWhatsappActive = whatsappSettings?.is_active;
  
  // Esqueleto de carregamento
  const Skeleton = () => (
    <div className={`rounded-xl shadow-2xl p-3 sm:p-4 h-14 ${
      isDarkMode
        ? 'bg-dark-800'
        : 'bg-white'
    } animate-pulse`} />
  );
  
  if (isLoading) {
    return (
      <div className="max-w-xl sm:max-w-4xl mx-auto mb-4 sm:mb-6">
        <Skeleton />
      </div>
    );
  }

  // Se estiver inativo, não mostra nada
  if (!isWhatsappActive) return null;

  return (
    <div className="max-w-xl sm:max-w-4xl mx-auto mb-4 sm:mb-6">
      {/* Mostra apenas o banner do WhatsApp, ocupando 100% da largura */}
      <a
        href={whatsappSettings!.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className={cardStyle(isDarkMode)}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <span className="text-sm sm:text-lg font-medium">{whatsappSettings!.title}</span>
        </div>
      </a>
    </div>
  );
}