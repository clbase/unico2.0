export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres';
  }
  return null;
};

export const validateBetForm = (formData: {
  house_a: string;
  house_b: string;
  odds_a: string;
  odds_b: string;
  investment_a: string;
  investment_b: string;
  event_date: string;
  event_time: string;
}): string | null => {
  if (!formData.house_a || !formData.house_b) {
    return 'Preencha os nomes das casas de apostas';
  }

  if (!formData.odds_a || !formData.odds_b) {
    return 'Preencha as odds das apostas';
  }

  if (!formData.investment_a || !formData.investment_b) {
    return 'Preencha os valores dos investimentos';
  }

  if (!formData.event_date || !formData.event_time) {
    return 'Preencha a data e hora do evento';
  }

  return null;
};