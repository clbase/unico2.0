import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Ad {
  id: string;
  title: string;
  content: string;
  link_url: string | null;
  image_url: string | null;
  display_duration_seconds: number;
}

interface AdInspectorProps {
  ad: Ad;
  isDarkMode: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function AdInspector({ ad, isDarkMode, onClose, onUpdate }: AdInspectorProps) {
  const [formData, setFormData] = useState({
    title: ad.title,
    content: ad.content,
    link_url: ad.link_url || '',
    image_url: ad.image_url || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ads')
        .update({
          title: formData.title,
          content: formData.content,
          link_url: formData.link_url || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ad.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating ad:', error);
      alert('Erro ao atualizar anúncio');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        className={`w-full max-w-md rounded-xl shadow-2xl p-4 sm:p-6 relative ${
          isDarkMode
            ? 'bg-dark-800 text-gray-100'
            : 'bg-white text-gray-900'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors ${
            isDarkMode
              ? 'hover:bg-dark-900 text-gray-400 hover:text-gray-200'
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Editar Anúncio</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode
                  ? 'bg-[#111112] border-gray-800 text-gray-100'
                  : 'bg-gray-50 border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Conteúdo</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md h-24 ${
                isDarkMode
                  ? 'bg-[#111112] border-gray-800 text-gray-100'
                  : 'bg-gray-50 border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Link (opcional)</label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode
                  ? 'bg-[#111112] border-gray-800 text-gray-100'
                  : 'bg-gray-50 border-gray-300'
              }`}
              placeholder="https://exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL da Imagem (opcional)</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md ${
                isDarkMode
                  ? 'bg-[#111112] border-gray-800 text-gray-100'
                  : 'bg-gray-50 border-gray-300'
              }`}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="Preview"
                className="mt-2 w-full rounded-md border"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>

          <div className="pt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 flex-1 px-4 py-2 rounded-md transition-colors ${
                isDarkMode
                  ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-700'
                  : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
              }`}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
