// Admin-related constants
export const USER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  TEMPORARY: 'temporary',
  EXPIRED: 'expired',
} as const;

export const STATUS_COLORS = {
  suspended: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  temporary: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
} as const;

export const STATUS_TEXT = {
  suspended: 'Suspenso',
  temporary: 'Temporário',
  expired: 'Expirado',
  active: 'Ativo',
} as const;