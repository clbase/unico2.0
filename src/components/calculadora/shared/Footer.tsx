import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase'; // <-- CAMINHO CORRIGIDO
import { 
  InstagramLogo, 
  WhatsappLogo, 
  DiscordLogo, 
  TelegramLogo
  // FileText foi removido desta linha
} from '@phosphor-icons/react'; 

interface LinkSettings {
  title: string;
  link_url: string;
  is_active: boolean;
}

interface FooterProps {
  isDarkMode: boolean;
}

export function Footer({ isDarkMode }: FooterProps) {
  const [spreadsheetSettings, setSpreadsheetSettings] = useState<LinkSettings | null>(null);
  const [whatsappSettings, setWhatsappSettings] = useState<LinkSettings | null>(null);
  
  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const [spreadRes, whatsRes] = await Promise.all([
        supabase
          .from('spreadsheet_button_settings')
          .select('title, link_url, is_active')
          .limit(1)
          .maybeSingle(),
        supabase
          .from('whatsapp_banner_settings')
          .select('link_url, is_active')
          .limit(1)
          .maybeSingle()
      ]);

      if (spreadRes.data) setSpreadsheetSettings(spreadRes.data as LinkSettings);
      if (whatsRes.data) setWhatsappSettings(whatsRes.data as LinkSettings);

    } catch (error) {
      console.error('Error loading footer links:', error);
    }
  };

  const currentYear = new Date().getFullYear();
  
  const titleStyle = `text-sm font-semibold mb-3 ${
    isDarkMode ? 'text-gray-200' : 'text-gray-900'
  }`;
  
  const linkStyle = `text-sm ${
    isDarkMode 
      ? 'text-gray-400 hover:text-gray-200' 
      : 'text-gray-600 hover:text-gray-900'
  } transition-colors`;
  
  const iconWrapperStyle = `p-2 rounded-full ${
    isDarkMode 
      ? 'bg-dark-950 hover:bg-dark-700' 
      : 'bg-gray-200 hover:bg-gray-300'
  } transition-colors`;

  const iconColor = isDarkMode ? "#ffffff" : "#374151"; 
  const iconSize = 24;

  return (
    <footer className={`w-full ${
      isDarkMode 
        ? 'bg-dark-900 border-gray-800' 
        : 'bg-white border-gray-200'
      } border-t mt-16`}
    >
      <div className="max-w-xl sm:max-w-4xl mx-auto py-4 px-4 sm:px-8">
    
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-left">
          
          {/* Coluna 1: Logo e Copyright */}
          <div className="flex flex-col gap-4 items-start">
            <img 
              src="/lg-vds.png" 
              alt="Logo Vivendo de Sure" 
              className="h-10 w-auto"
            />
            <p className="text-xs text-gray-500">
              © 2023 - {currentYear} Vivendo de Sure.
              <br />
              Todos os direitos reservados.
            </p>
          </div>
          
          {/* Coluna 2: Links Úteis */}
          <div className="flex flex-col items-start">
            <h3 className={titleStyle}>Links Úteis</h3>
            <ul className="space-y-2">
              {spreadsheetSettings && spreadsheetSettings.is_active && (
                <li>
                  <a
                    href={spreadsheetSettings.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkStyle}
                  >
                    {spreadsheetSettings.title}
                  </a>
                </li>
              )}
              <li>
                <a
                  href="/planilha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkStyle}
                >
                    Planilha de Lucros
                  </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Redes Sociais */}
          <div className="flex flex-col items-start">
            <h3 className={titleStyle}>Nossas redes sociais</h3>
            <div className="flex items-center gap-3">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/vivendodesure"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className={iconWrapperStyle}
              >
                <InstagramLogo size={iconSize} weight="fill" color={iconColor} />
              </a>
              
              {/* WhatsApp (link do admin) */}
              {whatsappSettings && whatsappSettings.is_active && (
                <a
                  href={whatsappSettings.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  className={iconWrapperStyle}
                >
                  <WhatsappLogo size={iconSize} weight="fill" color={iconColor} />
                </a>
              )}
              {/* Discord */}
              <a
                href="https://discord.gg/vivendodesure"
                target="_blank"
                rel="noopener noreferrer"
                title="Discord"
                className={iconWrapperStyle}
              >
                <DiscordLogo size={iconSize} weight="fill" color={iconColor} />
              </a>
              {/* Telegram */}
              <a
                href="https://t.me/vivendodesure"
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram"
                className={iconWrapperStyle}
              >
                <TelegramLogo size={iconSize} weight="fill" color={iconColor} />
              </a>
            </div>
          </div>
          
        </div>
      </div>
    </footer>
  );
}