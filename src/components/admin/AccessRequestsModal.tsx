import React, { useState, useEffect } from 'react';
import { X, Users, Clock, CheckCircle, XCircle, Mail, Phone, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';

interface AccessRequest {
  id: string;
  email: string;
  name: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by_email?: string;
}

interface AccessRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessRequestsModal: React.FC<AccessRequestsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('list_access_requests');
      
      if (error) throw error;
      
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching access requests:', error);
      setError('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingId(requestId);
      setError('');
      setSuccess('');

      const { error } = await supabase.rpc('review_access_request', {
        request_id: requestId,
        action: action
      });

      if (error) throw error;

      setSuccess(`Solicitação ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`);
      await fetchRequests();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error reviewing request:', error);
      setError(error.message || 'Erro ao processar solicitação');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovada';
      case 'rejected':
        return 'Rejeitada';
      default:
        return status;
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const reviewedRequests = requests.filter(r => r.status !== 'pending');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b dark:border-dark-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Solicitações de Acesso
              </h2>
              {pendingRequests.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200 rounded">
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Solicitações Pendentes */}
              {pendingRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    Solicitações Pendentes ({pendingRequests.length})
                  </h3>
                  <div className="grid gap-4">
                    {pendingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="font-medium text-gray-800 dark:text-white">
                                {request.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {request.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-300">
                                {request.phone}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Solicitado em: {formatDateTime(request.created_at)}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReview(request.id, 'approve')}
                              disabled={processingId === request.id}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                processingId === request.id
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-green-600'
                              } bg-green-500 text-white`}
                            >
                              {processingId === request.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Aprovar
                            </button>
                            <button
                              onClick={() => handleReview(request.id, 'reject')}
                              disabled={processingId === request.id}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                processingId === request.id
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:bg-red-600'
                              } bg-red-500 text-white`}
                            >
                              {processingId === request.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Rejeitar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solicitações Revisadas */}
              {reviewedRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Histórico de Solicitações ({reviewedRequests.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-dark-700">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Solicitante
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Telefone
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Revisado em
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Revisado por
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
                        {reviewedRequests.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {request.name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {request.email}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {request.phone}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {getStatusText(request.status)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {request.reviewed_at ? formatDateTime(request.reviewed_at) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {request.reviewed_by_email || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {requests.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhuma solicitação encontrada
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Não há solicitações de acesso no momento.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50">
          <div className="flex justify-end">
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