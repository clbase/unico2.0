export const getStatusColor = (status: string) => {
  switch (status) {
    case 'won':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'lost':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'returned':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'cashout':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'won':
      return 'Ganhou';
    case 'lost':
      return 'Perdeu';
    case 'returned':
      return 'Devolvida';
    case 'cashout':
      return 'Cashout';
    default:
      return 'Pendente';
  }
};