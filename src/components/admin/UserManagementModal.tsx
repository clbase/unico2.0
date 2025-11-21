import React, { useState, useEffect } from 'react';
import { X, Users, Shield, Crown, FileSpreadsheet, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from './types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [movingUsers, setMovingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('list_users');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveUserToCategory = async (userId: string, newCategory: string) => {
    try {
      setMovingUsers(prev => new Set(prev).add(userId));
      
      const { error } = await supabase.rpc('set_user_category', {
        target_user_id: userId,
        user_category: newCategory
      });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? {
              ...user,
              raw_user_meta_data: {
                ...user.raw_user_meta_data,
                category: newCategory
              }
            }
          : user
      ));
    } catch (error) {
      console.error('Error moving user:', error);
      alert('Erro ao mover usuário para nova categoria');
    } finally {
      setMovingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const getUserCategory = (user: User): string => {
    const isAdmin = user.raw_user_meta_data?.is_admin === 'true';
    const category = user.raw_user_meta_data?.category;
    
    // Admins always go to administradores category
    if (isAdmin || category === 'administradores') {
      return 'administradores';
    }
    
    // Default category for non-admin users
    return category || 'assinatura_planilha';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'administradores':
        return <Shield className="w-4 h-4 text-red-600" />;
      case 'membros_vip':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 text-blue-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'administradores':
        return 'Administradores';
      case 'membros_vip':
        return 'Membros VIP';
      default:
        return 'Assinatura Planilha';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const userCategory = getUserCategory(user);
    const matchesCategory = selectedCategory === 'all' || userCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const userCounts = {
    all: users.length,
    administradores: users.filter(u => getUserCategory(u) === 'administradores').length,
    membros_vip: users.filter(u => getUserCategory(u) === 'membros_vip').length,
    assinatura_planilha: users.filter(u => getUserCategory(u) === 'assinatura_planilha').length,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b dark:border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Gerenciar Usuários
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border rounded-lg dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              >
                <option value="all">Todas ({userCounts.all})</option>
                <option value="administradores">Administradores ({userCounts.administradores})</option>
                <option value="membros_vip">Membros VIP ({userCounts.membros_vip})</option>
                <option value="assinatura_planilha">Assinatura Planilha ({userCounts.assinatura_planilha})</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-dark-700 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoria Atual
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Alterar Categoria
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                {filteredUsers.map((user) => {
                  const currentCategory = getUserCategory(user);
                  const isProtected = user.email === 'claiverg@gmail.com';
                  const isMoving = movingUsers.has(user.id);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.raw_user_meta_data?.phone || 'Telefone não informado'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200">
                          {getCategoryIcon(currentCategory)}
                          {getCategoryLabel(currentCategory)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isProtected ? (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Usuário protegido
                          </span>
                        ) : (
                          <div className="flex justify-center">
                            <select
                              value={currentCategory}
                              onChange={(e) => {
                                if (e.target.value !== currentCategory) {
                                  moveUserToCategory(user.id, e.target.value);
                                }
                              }}
                              disabled={isMoving}
                              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                isMoving 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : 'hover:bg-gray-50 dark:hover:bg-dark-600'
                              } bg-white dark:bg-dark-700 border-gray-300 dark:border-dark-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}
                            >
                              <option value="administradores">
                                🛡️ Administradores
                              </option>
                              <option value="membros_vip">
                                👑 Membros VIP
                              </option>
                              <option value="assinatura_planilha">
                                📊 Assinatura Planilha
                              </option>
                            </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-6 border-t dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredUsers.length} usuário(s) encontrado(s)
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};