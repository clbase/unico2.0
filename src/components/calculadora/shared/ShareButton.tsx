import React, { useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
// --- TIPO ATUALIZADO ---
import { CalculatorType, Bet, LimitationBet, AumentadaBet, ExtracaoBetState } from '../types';
import { createShare } from '../../../lib/supabase'; // <-- CAMINHO CORRIGIDO
import { ShareModal } from './ShareModal';

interface ShareButtonProps {
  isDarkMode: boolean;
  calculatorType: CalculatorType;
  // --- TIPO ATUALIZADO ---
  bets: Bet[] | LimitationBet[] | AumentadaBet[] | ExtracaoBetState;
  totalStake?: number;
}

export function ShareButton({ isDarkMode, calculatorType, bets, totalStake }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Clipboard error:', error);
      alert('Não foi possível copiar o link automaticamente. Por favor, copie manualmente.');
    }
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);
      
      let shareData: any;
      let shareStake = totalStake;

      // --- LÓGICA DE COMPARTILHAMENTO ATUALIZADA ---
      if (calculatorType === 'extracao') { // <-- Renomeado
        shareData = bets as ExtracaoBetState; // <-- Renomeado
        shareStake = shareData.stake;
        if (!shareData.stake || !shareData.backOdd || !shareData.layOdd) {
          alert('Adicione valores válidos antes de compartilhar.');
          setIsLoading(false);
          return;
        }
      } else {
        const validBets = (bets as Bet[]).filter(bet => bet.odds > 0);
        
        if (validBets.length === 0) {
          alert('Adicione pelo menos uma aposta antes de compartilhar.');
          setIsLoading(false);
          return;
        }

        console.log('Attempting to share:', {
          calculatorType,
          validBetsCount: validBets.length,
          totalStake
        });
        
        shareData = validBets;

        if (calculatorType === 'aumentada') {
          const aumentadaBets = bets as AumentadaBet[];
          const fixedBet = aumentadaBets.find(bet => bet.isFixed && bet.odds > 0);
          
          if (fixedBet) {
            const finalOdds = fixedBet.odds + (fixedBet.odds - 1) * (fixedBet.increase / 100);
            const fixedReturn = fixedBet.stake * finalOdds;
            
            shareData = aumentadaBets.map(bet => {
              if (bet === fixedBet) {
                return { ...bet };
              }
              
              if (bet.odds > 0) {
                const betFinalOdds = bet.odds + (bet.odds - 1) * (bet.increase / 100);
                const calculatedStake = +(fixedReturn / betFinalOdds).toFixed(2);
                return { ...bet, stake: calculatedStake };
              }
              
              return bet;
            });
            shareStake = undefined;
          }
        }
      }
      // --- FIM DA LÓGICA ATUALIZADA ---

      if (!calculatorType || (Array.isArray(shareData) && !shareData.length) || (!Array.isArray(shareData) && !shareData)) {
        throw new Error('Invalid data for sharing');
      }

      const code = await createShare(calculatorType, shareData, shareStake);
      
      if (!code) {
        throw new Error('No share code received');
      }

      const url = `${window.location.origin}?share=${code}`;
      console.log('Share URL generated:', url);
      
      setShareUrl(url);
      setIsModalOpen(true);
      
    } catch (error) {
      console.error('Share creation error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        calculatorType,
        bets: bets
      });

      if (error instanceof Error) {
        alert(`Erro ao gerar link: ${error.message}`);
      } else {
        alert('Erro ao gerar link de compartilhamento. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isLoading}
        className={`ml-auto px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-base ${
          isDarkMode 
            ? 'text-blue-400 border border-blue-500 hover:bg-[#111112] disabled:opacity-50 disabled:cursor-not-allowed' 
            : 'text-blue-600 border border-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
        ) : (
          <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
        )}
        <span className="hidden sm:inline">Compartilhar</span>
      </button>

      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        shareUrl={shareUrl}
        onCopy={copyToClipboard}
        isDarkMode={isDarkMode}
      />
    </>
  );
}