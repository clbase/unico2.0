import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../../lib/supabase'; // <-- CAMINHO CORRIGIDO

interface Ad {
  id: string;
  title: string;
  content: string;
  link_url: string | null;
  image_url: string | null;
  display_duration_seconds: number;
}

interface AdBannerProps {
  isDarkMode: boolean;
}

const POPUP_INTERVAL = 30 * 60 * 1000;

export function AdBanner({ isDarkMode }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    loadAds();
  }, []);

  useEffect(() => {
    const handleForceShow = () => {
      setAds(currentAds => {
        if (currentAds.length > 0) {
          setIsPopupOpen(true);
          localStorage.setItem('lastAdPopupTime', Date.now().toString());
        }
        return currentAds;
      });
    };

    window.addEventListener('forceShowAd', handleForceShow);
    return () => window.removeEventListener('forceShowAd', handleForceShow);
  }, []);

  useEffect(() => {
    const checkAndShowPopup = () => {
      const lastShown = localStorage.getItem('lastAdPopupTime');
      const now = Date.now();

      if (!lastShown || now - parseInt(lastShown) >= POPUP_INTERVAL) {
        if (ads.length > 0) {
          setIsPopupOpen(true);
          localStorage.setItem('lastAdPopupTime', now.toString());
        }
      }
    };

    if (ads.length > 0) {
      checkAndShowPopup();

      const interval = setInterval(() => {
        checkAndShowPopup();
      }, POPUP_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [ads]);

  useEffect(() => {
    if (ads.length > 1 && isPopupOpen) {
      const currentAd = ads[currentAdIndex % ads.length];
      const duration = (currentAd.display_duration_seconds || 10) * 1000;

      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, duration);

      return () => clearInterval(interval);
    }
  }, [ads.length, isPopupOpen, currentAdIndex, ads]);

  const loadAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('id, title, content, link_url, image_url, display_duration_seconds')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error loading ads:', error);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  if (!isPopupOpen || ads.length === 0) return null;

  const currentAd = ads[currentAdIndex % ads.length];

  const AdContent = () => (
    <div className="flex-1">
      {currentAd.image_url && (
        <img
          src={currentAd.image_url}
          alt={currentAd.title}
          // --- LINHA MODIFICADA AQUI ---
          className="w-full aspect-video object-cover rounded-lg mb-3"
          // --- FIM DA MODIFICAÇÃO ---
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <h3 className="font-semibold text-base sm:text-lg mb-2">{currentAd.title}</h3>
      <p className="text-sm sm:text-base">{currentAd.content}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div
        className={`w-full max-w-md rounded-xl shadow-2xl p-4 sm:p-6 relative animate-fade-up ${
          isDarkMode
            ? 'bg-dark-800 text-gray-100'
            : 'bg-white text-gray-900'
        }`}
      >
        <div className="absolute top-3 right-3">
          <button
            onClick={closePopup}
            className={`p-1.5 rounded-full transition-colors ${
              isDarkMode
                ? 'hover:bg-dark-900 text-gray-400 hover:text-gray-200'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Fechar anúncio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="pr-8">
          {currentAd.link_url ? (
            <a
              href={currentAd.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition-opacity"
              onClick={closePopup}
            >
              <AdContent />
            </a>
          ) : (
            <AdContent />
          )}
        </div>

        {ads.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentAdIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentAdIndex % ads.length
                    ? isDarkMode ? 'bg-blue-400' : 'bg-blue-600'
                    : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`}
                aria-label={`Ver anúncio ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}