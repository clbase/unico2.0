import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { TOUR_STEPS } from '../../../lib/tourSteps'; // <-- CAMINHO CORRIGIDO

interface AppTourProps {
  isTourActive: boolean;
  setIsTourActive: (isActive: boolean) => void;
  isDarkMode: boolean;
}

export function AppTour({ isTourActive, setIsTourActive, isDarkMode }: AppTourProps) {
  
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setIsTourActive(false); // Fecha o tour se o utilizador clicar em "Pular" ou "Finalizar"
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={isTourActive}
      callback={handleJoyrideCallback}
      continuous={true}
      // --- CORREÇÃO DEFINITIVA ---
      // Desativamos o contador em inglês
      showProgress={false} 
      // --- FIM DA CORREÇÃO ---
      showSkipButton={true}
      locale={{
        next: 'Próximo', // Agora só aparecerá "Próximo"
        skip: 'Pular',
        last: 'Finalizar', 
        back: 'Anterior',
        close: 'Fechar',
      }}
      styles={{
        options: {
          // Estilo para modo escuro
          backgroundColor: isDarkMode ? '#1a1a1d' : '#ffffff', // Cor de fundo do popup
          textColor: isDarkMode ? '#f3f4f6' : '#111827', // Cor do texto
          primaryColor: isDarkMode ? '#3b82f6' : '#2563eb', // Cor dos botões
          arrowColor: isDarkMode ? '#1a1a1d' : '#ffffff', // Cor da seta
          zIndex: 1000,
        },
        buttonClose: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
        buttonSkip: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
      }}
    />
  );
}