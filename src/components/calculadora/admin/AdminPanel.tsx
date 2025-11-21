import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, LogOut, MessageCircle, Eye, Image, FileSpreadsheet, Palette, ToggleLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase'; // <-- CAMINHO CORRIGIDO

interface Ad {
  id: string;
  title: string;
  content: string;
  link_url: string | null;
  image_url: string | null;
  display_duration_seconds: number;
  is_active: boolean;
  created_at: string;
}

interface WhatsAppBannerSettings {
  id: string;
  title: string;
  link_url: string;
  is_active: boolean;
}

interface SpreadsheetButtonSettings {
  id: string;
  title: string;
  link_url: string;
  is_active: boolean;
}

interface CalculatorTabsSettings {
  id: string;
  active_color: string;
  is_active: boolean;
}

interface ExtracaoFeatureSettings {
  id: string;
  is_active: boolean;
}

interface AdminPanelProps {
  isDarkMode: boolean;
  onLogout: () => void;
}

export function AdminPanel({ isDarkMode, onLogout }: AdminPanelProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link_url: '',
    image_url: '',
    display_duration_seconds: 10,
    is_active: true
  });
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppBannerSettings | null>(null);
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false);
  const [spreadsheetSettings, setSpreadsheetSettings] = useState<SpreadsheetButtonSettings | null>(null);
  const [isEditingSpreadsheet, setIsEditingSpreadsheet] = useState(false);
  const [tabsSettings, setTabsSettings] = useState<CalculatorTabsSettings | null>(null);
  const [isEditingTabs, setIsEditingTabs] = useState(false);
  
  const [extracaoSettings, setExtracaoSettings] = useState<ExtracaoFeatureSettings | null>(null);

  useEffect(() => {
    loadAds();
    loadWhatsAppSettings();
    loadSpreadsheetSettings();
    loadTabsSettings();
    loadExtracaoSettings();
  }, []);

  const loadAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('id, title, content, link_url, image_url, display_duration_seconds, is_active, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error loading ads:', error);
      alert('Erro ao carregar anúncios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = sessionStorage.getItem('adminId');

    try {
      const { error } = await supabase
        .from('ads')
        .insert({
          ...formData,
          created_by: adminId,
          link_url: formData.link_url || null,
          image_url: formData.image_url || null
        });

      if (error) throw error;

      alert('Anúncio criado com sucesso!');
      setFormData({ title: '', content: '', link_url: '', image_url: '', display_duration_seconds: 10, is_active: true });
      setShowNewForm(false);
      loadAds();
    } catch (error) {
      console.error('Error creating ad:', error);
      alert('Erro ao criar anúncio');
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Ad>) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      alert('Anúncio atualizado com sucesso!');
      setEditingId(null);
      loadAds();
    } catch (error) {
      console.error('Error updating ad:', error);
      alert('Erro ao atualizar anúncio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este anúncio?')) return;

    try {
      const { error } = await supabase
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Anúncio deletado com sucesso!');
      loadAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      alert('Erro ao deletar anúncio');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      await loadAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
      alert('Erro ao atualizar status do anúncio');
    }
  };

  const forceShowAd = () => {
    localStorage.setItem('lastAdPopupTime', '0');
    window.dispatchEvent(new CustomEvent('forceShowAd'));
  };

  const loadWhatsAppSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_banner_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setWhatsappSettings(data);
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
    }
  };

  const handleUpdateWhatsApp = async () => {
    if (!whatsappSettings) return;

    const adminId = sessionStorage.getItem('adminId');

    try {
      const titleInput = document.getElementById('whatsapp-title') as HTMLInputElement;
      const linkInput = document.getElementById('whatsapp-link') as HTMLInputElement;

      const { error } = await supabase
        .from('whatsapp_banner_settings')
        .update({
          title: titleInput.value,
          link_url: linkInput.value,
          updated_at: new Date().toISOString(),
          updated_by: adminId
        })
        .eq('id', whatsappSettings.id);

      if (error) throw error;

      alert('Banner do WhatsApp atualizado com sucesso!');
      setIsEditingWhatsapp(false);
      loadWhatsAppSettings();
    } catch (error) {
      console.error('Error updating WhatsApp settings:', error);
      alert('Erro ao atualizar banner do WhatsApp');
    }
  };

  const toggleWhatsAppActive = async () => {
    if (!whatsappSettings) return;

    try {
      const { error } = await supabase
        .from('whatsapp_banner_settings')
        .update({
          is_active: !whatsappSettings.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', whatsappSettings.id);

      if (error) throw error;
      loadWhatsAppSettings();
    } catch (error) {
      console.error('Error toggling WhatsApp banner:', error);
      alert('Erro ao atualizar status do banner');
    }
  };

  const loadSpreadsheetSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('spreadsheet_button_settings')
        .select('id, title, link_url, is_active')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSpreadsheetSettings(data as SpreadsheetButtonSettings);
      }
    } catch (error) {
      console.error('Error loading spreadsheet settings:', error);
    }
  };

  const handleUpdateSpreadsheet = async () => {
    if (!spreadsheetSettings) return;

    const adminId = sessionStorage.getItem('adminId');

    try {
      const titleInput = document.getElementById('spreadsheet-title') as HTMLInputElement;
      const linkInput = document.getElementById('spreadsheet-link') as HTMLInputElement;

      const { error } = await supabase
        .from('spreadsheet_button_settings')
        .update({
          title: titleInput.value,
          link_url: linkInput.value,
          updated_at: new Date().toISOString(),
          updated_by: adminId
        })
        .eq('id', spreadsheetSettings.id);

      if (error) throw error;

      alert('Botão de Planilha atualizado com sucesso!');
      setIsEditingSpreadsheet(false);
      loadSpreadsheetSettings();
    } catch (error) {
      console.error('Error updating spreadsheet settings:', error);
      alert('Erro ao atualizar botão de planilha');
    }
  };

  const toggleSpreadsheetActive = async () => {
    if (!spreadsheetSettings) return;

    try {
      const { error } = await supabase
        .from('spreadsheet_button_settings')
        .update({
          is_active: !spreadsheetSettings.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', spreadsheetSettings.id);

      if (error) throw error;
      loadSpreadsheetSettings();
    } catch (error) {
      console.error('Error toggling spreadsheet button:', error);
      alert('Erro ao atualizar status do botão');
    }
  };

  const loadTabsSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('calculator_tabs_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setTabsSettings(data);
      }
    } catch (error) {
      console.error('Error loading tabs settings:', error);
    }
  };

  const handleUpdateTabs = async () => {
    if (!tabsSettings) return;

    const adminId = sessionStorage.getItem('adminId');

    try {
      const colorInput = document.getElementById('tabs-color') as HTMLInputElement;

      const { error } = await supabase
        .from('calculator_tabs_settings')
        .update({
          active_color: colorInput.value,
          updated_at: new Date().toISOString(),
          updated_by: adminId
        })
        .eq('id', tabsSettings.id);

      if (error) throw error;

      alert('Cor dos botões atualizada com sucesso!');
      setIsEditingTabs(false);
      loadTabsSettings();
    } catch (error) {
      console.error('Error updating tabs settings:', error);
      alert('Erro ao atualizar cor dos botões');
    }
  };

  const toggleTabsActive = async () => {
    if (!tabsSettings) return;

    try {
      const { error } = await supabase
        .from('calculator_tabs_settings')
        .update({
          is_active: !tabsSettings.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', tabsSettings.id);

      if (error) throw error;
      loadTabsSettings();
    } catch (error) {
      console.error('Error toggling tabs settings:', error);
      alert('Erro ao atualizar status das configurações');
    }
  };

  const loadExtracaoSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('extracao_feature_settings')
        .select('id, is_active')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setExtracaoSettings(data);
      }
    } catch (error) {
      console.error('Error loading extracao settings:', error);
    }
  };

  const toggleExtracaoActive = async () => {
    if (!extracaoSettings) return;

    const adminId = sessionStorage.getItem('adminId');

    try {
      const { error } = await supabase
        .from('extracao_feature_settings')
        .update({
          is_active: !extracaoSettings.is_active,
          updated_at: new Date().toISOString(),
          updated_by: adminId
        })
        .eq('id', extracaoSettings.id);

      if (error) throw error;
      loadExtracaoSettings();
    } catch (error) {
      console.error('Error toggling extracao feature status:', error);
      alert('Erro ao atualizar status da funcionalidade');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem('adminAuth');
      sessionStorage.removeItem('adminId');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      alert('Erro ao fazer logout');
    }
  };

  return (
    // --- CORREÇÃO DE TONALIDADE ---
    <div className={`min-h-screen p-4 sm:p-8 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-100'}`}>
      <div className={`max-w-6xl mx-auto rounded-xl shadow-2xl p-6 sm:p-8 ${isDarkMode ? 'bg-dark-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Painel de Administração</h1>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isDarkMode
                ? 'text-red-400 border border-red-500 hover:bg-[#111112]'
                : 'text-red-600 border border-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        <div className={`mb-8 p-4 rounded-lg border ${
          isDarkMode
            ? 'bg-dark-900 border-gray-800'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <ToggleLeft className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h2 className="text-xl font-semibold">Controlo de Funcionalidades</h2>
          </div>

          {extracaoSettings && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Calculadora de Extração</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Controla se a calculadora de "Extração" está ativa para o público.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={toggleExtracaoActive}
                    className={`px-3 py-1 rounded-md text-sm ${
                      extracaoSettings.is_active
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                  >
                    {extracaoSettings.is_active ? 'Ativa' : 'Inativa (Em breve)'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`mb-8 p-4 rounded-lg border ${
          isDarkMode
            ? 'bg-dark-900 border-gray-800'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-semibold">Banner do WhatsApp</h2>
          </div>

          {whatsappSettings && (
            <>
              {isEditingWhatsapp ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                      type="text"
                      defaultValue={whatsappSettings.title}
                      id="whatsapp-title"
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link do WhatsApp</label>
                    <input
                      type="url"
                      defaultValue={whatsappSettings.link_url}
                      id="whatsapp-link"
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateWhatsApp}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingWhatsapp(false)}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{whatsappSettings.title}</h3>
                      <a
                        href={whatsappSettings.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 text-sm hover:underline break-all"
                      >
                        {whatsappSettings.link_url}
                      </a>
                    </div>
                    <button
                      onClick={() => setIsEditingWhatsapp(true)}
                      className={`p-2 rounded-md ${
                        isDarkMode
                          ? 'text-blue-400 hover:bg-[#111112]'
                          : 'text-blue-600 hover:bg-gray-100'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={toggleWhatsAppActive}
                      className={`px-3 py-1 rounded-md text-sm ${
                        whatsappSettings.is_active
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      {whatsappSettings.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={`mb-8 p-4 rounded-lg border ${
          isDarkMode
            ? 'bg-dark-900 border-gray-800'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <FileSpreadsheet className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className="text-xl font-semibold">Botão de Planilha</h2>
          </div>

          {spreadsheetSettings && (
            <>
              {isEditingSpreadsheet ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                      type="text"
                      defaultValue={spreadsheetSettings.title}
                      id="spreadsheet-title"
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Link da Planilha</label>
                    <input
                      type="url"
                      defaultValue={spreadsheetSettings.link_url}
                      id="spreadsheet-link"
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateSpreadsheet}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingSpreadsheet(false)}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div>
                        <h3 className="text-lg font-semibold">{spreadsheetSettings.title}</h3>
                      </div>
                      <a
                        href={spreadsheetSettings.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm hover:underline break-all mt-2 block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        {spreadsheetSettings.link_url}
                      </a>
                    </div>
                    <button
                      onClick={() => setIsEditingSpreadsheet(true)}
                      className={`p-2 rounded-md ${
                        isDarkMode
                          ? 'text-gray-400 hover:bg-[#111112]'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={toggleSpreadsheetActive}
                      className={`px-3 py-1 rounded-md text-sm ${
                        spreadsheetSettings.is_active
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      {spreadsheetSettings.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={`mb-8 p-4 rounded-lg border ${
          isDarkMode
            ? 'bg-dark-900 border-gray-800'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <Palette className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <h2 className="text-xl font-semibold">Cor dos Botões de Calculadora</h2>
          </div>

          {tabsSettings && (
            <>
              {isEditingTabs ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cor Ativa (Hex)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue={tabsSettings.active_color}
                        id="tabs-color"
                        className={`flex-1 px-3 py-2 border rounded-md ${
                          isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                        placeholder="#3B82F6"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                      <input
                        type="color"
                        defaultValue={tabsSettings.active_color}
                        onChange={(e) => {
                          const input = document.getElementById('tabs-color') as HTMLInputElement;
                          if (input) input.value = e.target.value;
                        }}
                        className="w-12 h-10 rounded-md border cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateTabs}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditingTabs(false)}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-md border-2"
                          style={{ backgroundColor: tabsSettings.active_color }}
                        />
                        <div>
                          <h3 className="text-lg font-semibold">Cor Personalizada</h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {tabsSettings.active_color}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingTabs(true)}
                      className={`p-2 rounded-md ${
                        isDarkMode
                          ? 'text-gray-400 hover:bg-[#111112]'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={toggleTabsActive}
                      className={`px-3 py-1 rounded-md text-sm ${
                        tabsSettings.is_active
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-500 text-white hover:bg-gray-600'
                      }`}
                    >
                      {tabsSettings.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-4">Anúncios</h2>

        <div className={`mb-4 p-3 rounded-lg border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
          <p className="text-sm mb-2">O popup de anúncios aparece a cada 30 minutos. A duração de exibição controla por quanto tempo cada anúncio é exibido antes de passar para o próximo.</p>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isDarkMode
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {showNewForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showNewForm ? 'Cancelar' : 'Novo Anúncio'}
          </button>
          <button
            onClick={forceShowAd}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isDarkMode
                ? 'text-green-400 border border-green-500 hover:bg-[#111112]'
                : 'text-green-600 border border-green-600 hover:bg-green-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            Forçar Exibição
          </button>
        </div>

        {showNewForm && (
          <form onSubmit={handleCreate} className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Conteúdo</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md h-24 ${
                    isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link (opcional)</label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                  }`}
                  placeholder="https://exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  URL da Imagem (opcional)
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                  }`}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="mt-2 max-w-xs rounded-md border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duração de exibição no carrossel (segundos)</label>
                <input
                  type="number"
                  min="3"
                  max="60"
                  value={formData.display_duration_seconds}
                  onChange={(e) => setFormData({ ...formData, display_duration_seconds: parseInt(e.target.value) || 10 })}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm">Anúncio ativo</label>
              </div>
              <button
                type="submit"
                className={`px-4 py-2 rounded-md transition-colors ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Criar Anúncio
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <div className="space-y-4">
            {ads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum anúncio cadastrado
              </div>
            ) : (
              ads.map((ad) => (
                <div
                  key={ad.id}
                  className={`p-4 rounded-lg border ${
                    isDarkMode
                      ? 'bg-dark-900 border-gray-800'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  {editingId === ad.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        defaultValue={ad.title}
                        id={`title-${ad.id}`}
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      />
                      <textarea
                        defaultValue={ad.content}
                        id={`content-${ad.id}`}
                        className={`w-full px-3 py-2 border rounded-md h-24 ${
                          isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      />
                      <input
                        type="url"
                        defaultValue={ad.link_url || ''}
                        id={`link-${ad.id}`}
                        placeholder="Link (opcional)"
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      />
                      <input
                        type="url"
                        defaultValue={ad.image_url || ''}
                        id={`image-${ad.id}`}
                        placeholder="URL da imagem (opcional)"
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      />
                      <input
                        type="number"
                        min="3"
                        max="60"
                        defaultValue={ad.display_duration_seconds}
                        id={`duration-${ad.id}`}
                        className={`w-full px-3 py-2 border rounded-md ${
                          isDarkMode ? 'bg-[#111112] border-gray-800 text-gray-100' : 'bg-white border-gray-300'
                        }`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const title = (document.getElementById(`title-${ad.id}`) as HTMLInputElement).value;
                            const content = (document.getElementById(`content-${ad.id}`) as HTMLTextAreaElement).value;
                            const link_url = (document.getElementById(`link-${ad.id}`) as HTMLInputElement).value;
                            const image_url = (document.getElementById(`image-${ad.id}`) as HTMLInputElement).value;
                            const display_duration_seconds = parseInt((document.getElementById(`duration-${ad.id}`) as HTMLInputElement).value) || 10;
                            handleUpdate(ad.id, { title, content, link_url: link_url || null, image_url: image_url || null, display_duration_seconds });
                          }}
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{ad.title}</h3>
                          <p className="text-sm mt-1">{ad.content}</p>
                          {ad.image_url && (
                            <img
                              src={ad.image_url}
                              alt={ad.title}
                              className="mt-2 max-w-xs rounded-md border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          {ad.link_url && (
                            <a
                              href={ad.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 text-sm hover:underline block mt-1"
                            >
                              {ad.link_url}
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(ad.id)}
                            className={`p-2 rounded-md ${
                              isDarkMode
                                ? 'text-blue-400 hover:bg-[#111112]'
                                : 'text-blue-600 hover:bg-gray-100'
                            }`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ad.id)}
                            className={`p-2 rounded-md ${
                              isDarkMode
                                ? 'text-red-400 hover:bg-[#111112]'
                                : 'text-red-600 hover:bg-gray-100'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => toggleActive(ad.id, ad.is_active)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            ad.is_active
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-gray-500 text-white hover:bg-gray-600'
                          }`}
                        >
                          {ad.is_active ? 'Ativo' : 'Inativo'}
                        </button>
                        <span className="text-xs text-gray-500">
                          Duração: {ad.display_duration_seconds}s
                        </span>
                        <span className="text-xs text-gray-500">
                          Criado em: {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}