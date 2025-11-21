import { Step } from 'react-joyride';

// Adicionamos um helper para adicionar a contagem
const totalSteps = 6;
const addCounter = (text: string, current: number) => 
  `${text} (${current} de ${totalSteps})`;

export const TOUR_STEPS: Step[] = [
  {
    target: '#tour-tabs',
    content: addCounter(
      'Aqui você pode alternar entre as diferentes calculadoras: Dutching, Limitação, Aumentada e Extração.',
      1
    ),
    disableBeacon: true,
  },
  {
    target: '#tour-investment',
    content: addCounter(
      'Este é o valor total que você deseja investir. As calculadoras irão dividir este valor pelas suas apostas.',
      2
    ),
  },
  {
    target: '#tour-stats',
    content: addCounter(
      'Aqui você vê os resultados do seu cálculo: ROI (Retorno Sobre Investimento), Lucro e o Retorno total.',
      3
    ),
  },
  {
    target: '#tour-odds-input',
    content: addCounter(
      'Insira a odd (cotação) da sua aposta neste campo.',
      4
    ),
  },
  {
    target: '#tour-punctuate-btn',
    content: addCounter(
      'Este botão (P) ativa ou desativa a pontuação automática. Ativado (ponto verde), você pode digitar "185" e ele vira "1.85".',
      5
    ),
  },
  {
    target: '#tour-share-btn',
    content: addCounter(
      'Use este botão para gerar um link de compartilhar temporário e enviar o seu cálculo para outra pessoa.',
      6
    ),
  },
];