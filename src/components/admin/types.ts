// Admin-related types
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  raw_user_meta_data: {
    is_admin?: string;
    status?: string;
    access_start?: string;
    access_end?: string;
    category?: string;
    phone?: string;
  };
}

export interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
  error?: string;
}

export interface TimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (days: number) => void;
  accessStart?: string;
  accessEnd?: string;
}

export interface UserTableProps {
  users: User[];
  onDelete: (userId: string) => void;
  onToggleAdmin: (userId: string, currentStatus: boolean) => void;
  onToggleStatus: (userId: string, currentStatus: string) => void;
  onTimeModalOpen: (userId: string) => void;
  deleteLoading: string | null;
}

export interface UserCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, category: string) => Promise<void>;
  error?: string;
}

export interface UserCategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  userCounts: {
    administradores: number;
    membros_vip: number;
    assinatura_planilha: number;
  };
}