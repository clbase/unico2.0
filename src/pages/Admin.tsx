import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
// 1. Importar o novo ícone (TrendingUp) e o novo modal
import { Shield, Mail, Users, AlertCircle, CheckCircle, Settings, TrendingUp } from 'lucide-react';
import { 
  TimeModal, 
  EmailModal,
  UserTable,
  UserCategoryTabs,
  UserManagementModal,
  AccessRequestsModal,
  User,
  ProfitReportModal // <-- 2. Importar o novo Modal
} from '../components/admin';
import { NavigationSettingsModal } from '../components/admin/NavigationSettingsModal';

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  
  // Email authorization modal
  const [showEmailForm, setShowEmailForm] = useState(false);
  
  // User management modal
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  
  // Navigation settings modal
  const [showNavigationSettingsModal, setShowNavigationSettingsModal] = useState(false);

  // Profit report modal (NOVO)
  const [showProfitReportModal, setShowProfitReportModal] = useState(false); // <-- 3. Adicionar estado
  
  // Access requests modal
  const [showAccessRequestsModal, setShowAccessRequestsModal] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('administradores');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchPendingRequestsCount();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      setIsAdmin(data);
      if (!data) {
        navigate('/planilha'); // Redireciona para a planilha
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/planilha'); // Redireciona para a planilha
    }
  };

  const fetchPendingRequestsCount = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pending_requests_count');
      if (error) throw error;
      setPendingRequestsCount(data || 0);
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('list_users');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeleteLoading(userId);
      setError('');
      const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId });
      
      if (error) {
        if (error.message.includes('protected administrator')) {
          throw new Error('Não é possível excluir o administrador principal do sistema.');
        }
        throw error;
      }
      
      setUsers(users.filter(user => user.id !== userId));
      setSuccess('Usuário excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Erro ao excluir usuário. Por favor, tente novamente.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setError('');
      const { error } = await supabase.rpc('set_admin_status', {
        target_user_id: userId,
        is_admin_status: !currentStatus
      });

      if (error) {
        if (error.message.includes('protected administrator')) {
          throw new Error('Não é possível remover os privilégios do administrador principal.');
        }
        throw error;
      }

      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              raw_user_meta_data: { 
                ...user.raw_user_meta_data, 
                is_admin: (!currentStatus).toString() 
              }
            }
          : user
      ));
      setSuccess('Status de administrador atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating admin status:', error);
      setError(error.message || 'Erro ao atualizar status de administrador');
    }
  };

  const handleTimeModalOpen = (userId: string) => {
    setSelectedUserId(userId);
    setShowTimeModal(true);
  };

  const handleTimeModalSave = async (endDate: string) => {
    if (!selectedUserId) return;

    try {
      setError('');
      const { error } = await supabase.rpc('set_user_status', {
        target_user_id: selectedUserId,
        status: 'temporary',
        end_date: endDate
      });

      if (error) throw error;

      await fetchUsers();
      setSuccess('Acesso temporário configurado com sucesso!');
    } catch (error: any) {
      console.error('Error setting temporary access:', error);
      setError(error.message || 'Erro ao configurar acesso temporário');
    } finally {
      setShowTimeModal(false);
      setSelectedUserId(null);
    }
  };

  const toggleUserStatus = async (userId: string, newStatus: string) => {
    try {
      setError('');
      const { error } = await supabase.rpc('set_user_status', {
        target_user_id: userId,
        status: newStatus
      });

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              raw_user_meta_data: { 
                ...user.raw_user_meta_data, 
                status: newStatus,
                access_start: null,
                access_end: null
              }
            }
          : user
      ));
      setSuccess(`Status do usuário atualizado para ${newStatus} com sucesso!`);
    } catch (error: any) {
      console.error('Error updating user status:', error);
      setError(error.message || 'Erro ao atualizar status do usuário');
    }
  };

  const getUsersByCategory = (category: string) => {
    return users.filter(user => {
      const userCategory = user.raw_user_meta_data?.category;
      const isAdmin = user.raw_user_meta_data?.is_admin === 'true';
      const userStatus = user.raw_user_meta_data?.status;
      
      // Don't show pending users in category tabs
      if (userStatus === 'pending') {
        return false;
      }
      
      // Special handling for administrators
      if (category === 'administradores') {
        return isAdmin || userCategory === 'administradores';
      }
      
      // For non-admin categories, exclude admin users completely
      if (isAdmin) {
        return false;
      }
      
      // Default category for non-admin users without explicit category
      const finalCategory = userCategory || 'assinatura_planilha';
      return finalCategory === category;
    });
  };

  const getUserCounts = () => {
    return {
      administradores: getUsersByCategory('administradores').length,
      membros_vip: getUsersByCategory('membros_vip').length,
      assinatura_planilha: getUsersByCategory('assinatura_planilha').length
    };
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredUsers = getUsersByCategory(activeCategory);
  const userCounts = getUserCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Administração de Usuários
          </h1>
        </div>
        
        {/* 4. Atualizar o grupo de botões */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => setShowProfitReportModal(true)} // <-- Ação do novo botão
            className="flex items-center gap-2 bg-[#2e2e33] text-[#b0b0b5] py-2 px-4 rounded hover:bg-[#3a3a3f] transition-colors"
            title="Relatório de Lucros"
          >
            <TrendingUp className="w-5 h-5" />
            Relatórios
          </button>
          <button
            onClick={() => setShowNavigationSettingsModal(true)}
            className="flex items-center gap-2 bg-[#2e2e33] text-[#b0b0b5] py-2 px-4 rounded hover:bg-[#3a3a3f] transition-colors"
            title="Configurações de Navegação"
          >
            <Settings className="w-5 h-5" />
            Navegação
          </button>
          <button
            onClick={() => {
              setShowAccessRequestsModal(true);
              fetchPendingRequestsCount();
            }}
            className="relative flex items-center gap-2 bg-[#2e2e33] text-[#b0b0b5] py-2 px-4 rounded hover:bg-[#3a3a3f] transition-colors"
            title="Solicitações de Acesso"
          >
            <Users className="w-5 h-5" />
            Solicitações
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowUserManagementModal(true)}
            className="flex items-center gap-2 bg-[#2e2e33] text-[#b0b0b5] py-2 px-4 rounded hover:bg-[#3a3a3f] transition-colors"
          >
            <Users className="w-5 h-5" />
            Usuários
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 px-4 py-3 rounded">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Email Authorization Modal */}
      <UserCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        userCounts={userCounts}
      />

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={showUserManagementModal}
        onClose={() => setShowUserManagementModal(false)}
      />

      {/* Navigation Settings Modal */}
      <NavigationSettingsModal
        isOpen={showNavigationSettingsModal}
        onClose={() => setShowNavigationSettingsModal(false)}
      />

      {/* Access Requests Modal */}
      <AccessRequestsModal
        isOpen={showAccessRequestsModal}
        onClose={() => {
          setShowAccessRequestsModal(false);
          fetchPendingRequestsCount();
        }}
      />

      {/* 5. Renderizar o novo modal */}
      <ProfitReportModal
        isOpen={showProfitReportModal}
        onClose={() => setShowProfitReportModal(false)}
      />

      <TimeModal
        isOpen={showTimeModal}
        onClose={() => {
          setShowTimeModal(false);
          setSelectedUserId(null);
        }}
        onSave={handleTimeModalSave}
        accessStart={selectedUserId ? users.find(u => u.id === selectedUserId)?.raw_user_meta_data?.access_start : undefined}
        accessEnd={selectedUserId ? users.find(u => u.id === selectedUserId)?.raw_user_meta_data?.access_end : undefined}
      />

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-md overflow-hidden">
        <UserTable
          users={filteredUsers}
          onDelete={handleDeleteUser}
          onToggleAdmin={toggleAdminStatus}
          onToggleStatus={toggleUserStatus}
          onTimeModalOpen={handleTimeModalOpen}
          deleteLoading={deleteLoading}
        />
      </div>
    </div>
  );
};