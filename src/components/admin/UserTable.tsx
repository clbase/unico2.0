import React, { useState } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Trash2, 
  UserX, 
  UserCheck, 
  UserMinus, 
  UserPlus, 
  Clock,
  ChevronDown,
  AlertTriangle,
  AlertCircle,
  KeyRound,
  Phone,
  Infinity,
  LogOut,
  Settings
} from 'lucide-react';
import { User, UserTableProps } from './types';
import { getStatusColor, getStatusText } from './utils';
import { supabase } from '../../lib/supabase';

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onDelete,
  onToggleAdmin,
  onToggleStatus,
  onTimeModalOpen,
  deleteLoading
}) => {
  const [openStatusMenu, setOpenStatusMenu] = React.useState<string | null>(null);
  const [showExpirationInfo, setShowExpirationInfo] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState<string | null>(null);

  const getUserStatus = (user: User) => {
    const status = user.raw_user_meta_data?.status;
    const endDate = user.raw_user_meta_data?.access_end;

    if (status === 'temporary' && endDate) {
      const now = new Date();
      const accessEnd = new Date(endDate);
      
      if (now > accessEnd) {
        return 'expired';
      }
    }

    return status || 'active';
  };

  const getRemainingDays = (user: User) => {
    const status = getUserStatus(user);
    const endDate = user.raw_user_meta_data?.access_end;

    if (status === 'active') {
      return (
        <div className="flex items-center justify-center text-gray-600 dark:text-gray-300">
          <Infinity className="w-5 h-5" />
        </div>
      );
    }

    if (status === 'expired' || status === 'suspended') {
      return (
        <span className="text-red-600 dark:text-red-400 font-medium">
          0 dias
        </span>
      );
    }

    if (status === 'temporary' && endDate) {
      const now = new Date();
      const accessEnd = new Date(endDate);
      const days = differenceInDays(accessEnd, now);
      
      return (
        <span className={`font-medium ${
          days <= 3 ? 'text-red-600 dark:text-red-400' : 
          days <= 7 ? 'text-yellow-600 dark:text-yellow-400' : 
          'text-green-600 dark:text-green-400'
        }`}>
          {days} dias
        </span>
      );
    }

    return null;
  };

  const isExpired = (user: User) => {
    const status = getUserStatus(user);
    return status === 'expired';
  };

  const formatExpirationDate = (dateString: string) => {
    return format(parseISO(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Tem certeza que deseja resetar a senha deste usuário? A senha será alterada para "12345678".')) {
      return;
    }

    try {
      setResetLoading(userId);
      const { error } = await supabase.rpc('reset_user_password', { target_user_id: userId });
      
      if (error) throw error;
      
      alert('Senha resetada com sucesso! O usuário deverá alterar a senha no próximo login.');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      alert(error.message || 'Erro ao resetar senha');
    } finally {
      setResetLoading(null);
    }
  };

  const handleForceLogout = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja deslogar ${userEmail}? O usuário será desconectado imediatamente.`)) {
      return;
    }

    try {
      setLogoutLoading(userId);
      const { error } = await supabase.rpc('force_logout_user', { target_user_id: userId });
      
      if (error) throw error;
      
      alert('Usuário deslogado com sucesso!');
    } catch (error: any) {
      console.error('Error forcing logout:', error);
      alert(error.message || 'Erro ao deslogar usuário');
    } finally {
      setLogoutLoading(null);
    }
  };

  const StatusManagementPopup = ({ user, isOpen, onClose }: { 
    user: User; 
    isOpen: boolean; 
    onClose: () => void; 
  }) => {
    if (!isOpen) return null;

    const currentStatus = getUserStatus(user);
    const isProtected = user.email === 'claiverg@gmail.com';

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-dark-600">
          <div className="p-6 border-b dark:border-dark-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Gerenciar Status
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {user.email}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <AlertCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {isProtected ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  Usuário Protegido
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Este usuário não pode ter seu status alterado.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Selecione o novo status para este usuário:
                </p>

                {/* Status Ativo */}
                <button
                  onClick={() => {
                    onToggleStatus(user.id, 'active');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    currentStatus === 'active'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-dark-600 hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/10'
                  }`}
                >
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-gray-800 dark:text-white">Ativo</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Acesso completo e ilimitado</p>
                  </div>
                  {currentStatus === 'active' && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <UserCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>

                {/* Status Suspenso */}
                <button
                  onClick={() => {
                    onToggleStatus(user.id, 'suspended');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    currentStatus === 'suspended'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-dark-600 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/10'
                  }`}
                >
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <UserMinus className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-gray-800 dark:text-white">Suspenso</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Acesso bloqueado permanentemente</p>
                  </div>
                  {currentStatus === 'suspended' && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <UserX className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>

                {/* Status Temporário */}
                <button
                  onClick={() => {
                    onTimeModalOpen(user.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    currentStatus === 'temporary' || currentStatus === 'expired'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-dark-600 hover:border-yellow-300 dark:hover:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/10'
                  }`}
                >
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-medium text-gray-800 dark:text-white">Temporário</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Acesso por tempo limitado</p>
                  </div>
                  {(currentStatus === 'temporary' || currentStatus === 'expired') && (
                    <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Clock className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="p-6 border-t dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Mini popup para informações de expiração
  const ExpirationInfoPopup = ({ user, isOpen, onClose }: { 
    user: User; 
    isOpen: boolean; 
    onClose: () => void; 
  }) => {
    if (!isOpen) return null;

    const accessEnd = user.raw_user_meta_data?.access_end;
    const accessStart = user.raw_user_meta_data?.access_start;
    
    if (!accessEnd) return null;

    const now = new Date();
    const endDate = new Date(accessEnd);
    const startDate = accessStart ? new Date(accessStart) : null;
    const daysRemaining = differenceInDays(endDate, now);
    const isExpiring = daysRemaining <= 3;

    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl w-full max-w-sm border border-gray-200 dark:border-dark-600">
          <div className="p-4 border-b dark:border-dark-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Acesso Temporário
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {user.email}
              </p>
              
              {/* Status visual */}
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                isExpiring 
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              }`}>
                <AlertCircle className="w-4 h-4" />
                {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Expirado'}
              </div>
            </div>

            <div className="space-y-3">
              {startDate && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-600">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Início:</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {formatExpirationDate(accessStart!)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-dark-600">
                <span className="text-sm text-gray-500 dark:text-gray-400">Expira em:</span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {formatExpirationDate(accessEnd)}
                </span>
              </div>

              {/* Barra de progresso */}
              {startDate && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Progresso</span>
                    <span>{Math.max(0, Math.min(100, ((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100)).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        isExpiring ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.max(0, Math.min(100, ((now.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100))}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onTimeModalOpen(user.id);
                  onClose();
                }}
                className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
              >
                Estender Acesso
              </button>
              <button
                onClick={onClose}
                className="px-3 py-2 bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors text-sm"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
        <thead className="bg-gray-50 dark:bg-dark-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Telefone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Data de Criação
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Último Acesso
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Dias Restantes
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Admin
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
          {users.map((user) => {
            const status = getUserStatus(user);
            const expired = isExpired(user);
            const isTemporary = status === 'temporary';
            const accessEnd = user.raw_user_meta_data?.access_end;
            
            return (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.raw_user_meta_data?.phone || (
                    <span className="text-gray-400 dark:text-gray-600 italic">
                      Não informado
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(user.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.email === 'claiverg@gmail.com' 
                    ? <span className="blur-sm select-none">(*******)</span>
                    : user.last_sign_in_at 
                      ? format(new Date(user.last_sign_in_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                      : 'Nunca acessou'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center relative">
                  <div className="flex items-center justify-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(status)
                      }`}
                    >
                      {getStatusIcon(status)}
                      {getStatusText(status)}
                      {expired && (
                        <AlertCircle className="w-4 h-4 ml-1 text-red-500 dark:text-red-400" />
                      )}
                    </span>

                    {/* Alert Icon for Temporary Status */}
                    {isTemporary && !expired && accessEnd && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowExpirationInfo(showExpirationInfo === user.id ? null : user.id);
                        }}
                        className="p-1 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors focus:outline-none"
                        title="Ver informações de expiração"
                      >
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </button>
                    )}

                    {/* Status Management Gear Icon */}
                    <button
                      onClick={() => setOpenStatusMenu(openStatusMenu === user.id ? null : user.id)}
                      disabled={user.email === 'claiverg@gmail.com'}
                      className={`p-1.5 rounded-full transition-colors ${
                        user.email === 'claiverg@gmail.com'
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-100 dark:hover:bg-dark-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                      title="Gerenciar status"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status Management Popup */}
                  <StatusManagementPopup
                    user={user}
                    isOpen={openStatusMenu === user.id}
                    onClose={() => setOpenStatusMenu(null)}
                  />

                  {/* Expiration Info Mini Popup */}
                  <ExpirationInfoPopup
                    user={user}
                    isOpen={showExpirationInfo === user.id}
                    onClose={() => setShowExpirationInfo(null)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getRemainingDays(user)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => onToggleAdmin(user.id, user.raw_user_meta_data?.is_admin === 'true')}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user.raw_user_meta_data?.is_admin === 'true'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}
                    disabled={user.email === 'claiverg@gmail.com'}
                  >
                    {user.raw_user_meta_data?.is_admin === 'true' ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-1" />
                        Admin
                      </>
                    ) : (
                      <>
                        <UserX className="w-4 h-4 mr-1" />
                        Usuário
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {(status === 'temporary' || status === 'expired') && (
                      <button
                        onClick={() => onTimeModalOpen(user.id)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Gerenciar acesso temporário"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleForceLogout(user.id, user.email)}
                      disabled={logoutLoading === user.id || user.email === 'claiverg@gmail.com'}
                      className={`text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 ${
                        (logoutLoading === user.id || user.email === 'claiverg@gmail.com') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Deslogar usuário"
                    >
                      {logoutLoading === user.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 dark:border-orange-400" />
                      ) : (
                        <LogOut className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      disabled={resetLoading === user.id || user.email === 'claiverg@gmail.com'}
                      className={`text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 ${
                        (resetLoading === user.id || user.email === 'claiverg@gmail.com') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Resetar senha"
                    >
                      {resetLoading === user.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400" />
                      ) : (
                        <KeyRound className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      disabled={deleteLoading === user.id || user.email === 'claiverg@gmail.com'}
                      className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ${
                        (deleteLoading === user.id || user.email === 'claiverg@gmail.com') ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Excluir usuário"
                    >
                      {deleteLoading === user.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 dark:border-red-400" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'suspended':
      return <UserMinus className="w-4 h-4 mr-1" />;
    case 'temporary':
      return <Clock className="w-4 h-4 mr-1" />;
    case 'expired':
      return <AlertTriangle className="w-4 h-4 mr-1" />;
    default:
      return <UserPlus className="w-4 h-4 mr-1" />;
  }
};