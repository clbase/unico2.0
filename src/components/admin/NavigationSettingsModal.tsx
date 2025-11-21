import React, { useState, useEffect } from 'react';
// 1. Importar o ícone 'Eye'
import { X, Settings, Calculator, TrendingUp, Wallet, Save, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NavigationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationSetting {
  setting_key: string;
  is_enabled: boolean;
}

// 2. Adicionar o novo item 'login_preview' à lista
const navigationItems = [
  {
    key: 'calculator',
    label: 'Calculadora',
    icon: Calculator,
    description: 'Link externo para a calculadora de surebets'
  },
  {
    key: 'earnings',
    label: 'Ganhos',
    icon: TrendingUp,
    description: 'Página para registrar lucros e perdas externos'
  },
  {
    key: 'bankroll',
    label: 'Banca',
    icon: Wallet,
    description: 'Gerenciamento de saldo das casas de apostas'
  },
  { // <-- NOVO ITEM ADICIONADO AQUI
    key: 'login_preview',
    label: 'Demo na Tela de Login',
    icon: Eye,
    description: 'Exibe um preview da planilha na tela de login'
  }
];

export const NavigationSettingsModal: React.FC<NavigationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<NavigationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_navigation_settings');
      
      if (error) throw error;
      
      setSettings(data || []);
    } catch (error: any) {
      console.error('Error fetching navigation settings:', error);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = (key: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.setting_key === key 
          ? { ...setting, is_enabled: !setting.is_enabled }
          : setting
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      for (const setting of settings) {
        const { error } = await supabase.rpc('update_navigation_setting', {
          key: setting.setting_key,
          enabled: setting.is_enabled
        });

        if (error) throw error;
      }

      setSuccess('Configurações salvas com sucesso!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error saving navigation settings:', error);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Configurações de Navegação
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 3. O restante do código renderiza o novo item automaticamente */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Configure quais itens da navegação ficam visíveis para todos os usuários. 
            Itens desabilitados não aparecerão no menu lateral.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded">
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {navigationItems.map((item) => {
                const setting = settings.find(s => s.setting_key === item.key);
                // 4. Garante que o padrão seja 'false' se não for encontrado (para o novo item)
                const isEnabled = setting?.is_enabled ?? false;
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isEnabled 
                          ? 'bg-blue-100 dark:bg-blue-900/30' 
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          isEnabled 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${
                          isEnabled 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {item.label}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleSetting(item.key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                saving || loading
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              } bg-blue-500 text-white hover:bg-blue-600`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};