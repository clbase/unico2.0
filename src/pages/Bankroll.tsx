import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus } from 'lucide-react'; // <-- Removido ArrowUpCircle
import { supabase } from '../lib/supabase';
import { BettingHouse, Transaction } from '../types/bankroll';
import { BettingHouseTable } from '../components/bankroll/BettingHouseTable';
import { NewHouseModal } from '../components/bankroll/NewHouseModal';
import { TransactionModal } from '../components/bankroll/TransactionModal';
import { DeleteConfirmModal } from '../components/bankroll/DeleteConfirmModal';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/currency';

export const Bankroll: React.FC = () => {
  // State
  const [bettingHouses, setBettingHouses] = useState<BettingHouse[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showNewHouseModal, setShowNewHouseModal] = useState(false);
  
  // --- Estados de Modais Atualizados ---
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedHouseForTransaction, setSelectedHouseForTransaction] = useState<BettingHouse | null>(null);
  const [currentTransactionType, setCurrentTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  
  const [showDeleteTransactionModal, setShowDeleteTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const [showDeleteHouseModal, setShowDeleteHouseModal] = useState(false);
  const [houseToDelete, setHouseToDelete] = useState<BettingHouse | null>(null);
  // --- Fim das Atualizações de Estado ---

  const [expandedHouses, setExpandedHouses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  useEffect(() => {
    fetchBettingHouses();
    fetchTransactions();
  }, []);

  // Data fetching (sem alterações)
  const fetchBettingHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('betting_houses')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBettingHouses(data || []);
    } catch (error) {
      console.error('Error fetching betting houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('bankroll_transactions')
        .select(`
          *,
          betting_house:betting_houses(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // --- Lógica de Casas Atualizada ---
  const handleAddHouse = async (name: string) => {
    setError('');

    if (!name.trim()) {
      setError('Por favor, insira o nome da casa de apostas');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const { error } = await supabase
        .from('betting_houses')
        .insert([{ 
          name: name.trim(),
          user_id: user.id
        }]);

      if (error) {
        if (error.code === '23505') {
          setError('Esta casa de apostas já está cadastrada');
        } else {
          throw error;
        }
        return;
      }

      setShowNewHouseModal(false);
      fetchBettingHouses();
    } catch (error) {
      console.error('Error adding betting house:', error);
      setError('Erro ao adicionar casa de apostas');
    }
  };

  const handleDeleteHouse = (house: BettingHouse) => {
    setHouseToDelete(house);
    setShowDeleteHouseModal(true);
  };

  const confirmDeleteHouse = async () => {
    if (!houseToDelete) return;

    try {
      const { error } = await supabase
        .from('betting_houses')
        .delete()
        .eq('id', houseToDelete.id);

      if (error) throw error;

      setBettingHouses(prev => prev.filter(h => h.id !== houseToDelete.id));
      setTransactions(prev => prev.filter(t => t.betting_house_id !== houseToDelete.id));
      setShowDeleteHouseModal(false);
      setHouseToDelete(null);
    } catch (error) {
      console.error('Error deleting betting house:', error);
      setError('Erro ao excluir casa de apostas');
    }
  };

  // --- Lógica de Transações Atualizada ---
  
  // Abre o modal de transação
  const handleOpenTransactionModal = (house: BettingHouse, type: 'deposit' | 'withdrawal') => {
    setSelectedHouseForTransaction(house);
    setCurrentTransactionType(type);
    setShowTransactionModal(true);
    setError(''); // Limpa erros antigos
  };

  // Chamado pelo modal de transação ao submeter
  const handleTransactionSubmit = async (houseId: string, amount: string) => {
    setError('');

    if (!amount || Number(amount) <= 0) {
      setError('Por favor, insira um valor válido');
      return;
    }

    try {
      const numericAmount = Number(amount);
      const selectedHouseData = bettingHouses.find(h => h.id === houseId);
      
      if (!selectedHouseData) {
        setError('Casa de apostas não encontrada');
        return;
      }

      if (currentTransactionType === 'withdrawal' && numericAmount > selectedHouseData.balance) {
        setError('Saldo insuficiente para realizar o saque');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('Usuário não autenticado');
        return;
      }

      const { error: transactionError } = await supabase
        .from('bankroll_transactions')
        .insert([{
          betting_house_id: houseId,
          amount: numericAmount,
          type: currentTransactionType,
          user_id: user.id
        }]);

      if (transactionError) throw transactionError;

      const newBalance = currentTransactionType === 'deposit' 
        ? selectedHouseData.balance + numericAmount
        : selectedHouseData.balance - numericAmount;

      const { error: updateError } = await supabase
        .from('betting_houses')
        .update({ balance: newBalance })
        .eq('id', houseId);

      if (updateError) throw updateError;

      setShowTransactionModal(false);
      setSelectedHouseForTransaction(null);
      fetchBettingHouses();
      fetchTransactions();
    } catch (error) {
      console.error('Error processing transaction:', error);
      setError('Erro ao processar transação');
    }
  };

  // Excluir transação (Extrato) - sem alteração
  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteTransactionModal(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!selectedTransaction) return;

    try {
      const { error: deleteError } = await supabase
        .from('bankroll_transactions')
        .delete()
        .eq('id', selectedTransaction.id);

      if (deleteError) throw deleteError;

      const newBalance = selectedTransaction.type === 'deposit'
        ? selectedTransaction.betting_house.balance - selectedTransaction.amount
        : selectedTransaction.betting_house.balance + selectedTransaction.amount;

      const { error: updateError } = await supabase
        .from('betting_houses')
        .update({ balance: newBalance })
        .eq('id', selectedTransaction.betting_house_id);

      if (updateError) throw updateError;

      await fetchBettingHouses();
      await fetchTransactions();

      setShowDeleteTransactionModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Erro ao excluir transação');
    }
  };


  // UI helpers (sem alteração)
  const toggleHouseTransactions = (houseId: string) => {
    setExpandedHouses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(houseId)) {
        newSet.delete(houseId);
      } else {
        newSet.add(houseId);
      }
      return newSet;
    });
  };

  const getHouseTransactions = (houseId: string) => {
    return transactions.filter(t => t.betting_house_id === houseId);
  };

  const formatDateTime = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          Gerenciamento de Banca
        </h1>
        {/* --- BOTÃO DE TRANSAÇÃO REMOVIDO DAQUI --- */}
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <button
            onClick={() => setShowNewHouseModal(true)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 rounded hover:opacity-90 transition-colors ${
              isDark 
                ? 'bg-[#2e2e33] text-[#b0b0b5] hover:bg-[#3a3a3f]' 
                : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            <Plus className="w-5 h-5" />
            Nova Casa
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* --- NOVAS PROPS PASSADAS PARA A TABELA --- */}
      <BettingHouseTable
        bettingHouses={bettingHouses}
        expandedHouses={expandedHouses}
        onToggleHouseTransactions={toggleHouseTransactions}
        getHouseTransactions={getHouseTransactions}
        formatDateTime={formatDateTime}
        handleDeleteTransaction={handleDeleteTransaction}
        onAddTransaction={(house) => handleOpenTransactionModal(house, 'deposit')}
        onWithdrawTransaction={(house) => handleOpenTransactionModal(house, 'withdrawal')}
        onDeleteHouse={handleDeleteHouse}
      />

      <NewHouseModal
        isOpen={showNewHouseModal}
        onClose={() => setShowNewHouseModal(false)}
        onSubmit={handleAddHouse}
        error={error}
      />

      {/* --- MODAL DE TRANSAÇÃO ATUALIZADO --- */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSubmit={handleTransactionSubmit}
        house={selectedHouseForTransaction}
        transactionType={currentTransactionType}
        error={error}
      />

      {/* Modal de exclusão de TRANSAÇÃO (Extrato) */}
      <DeleteConfirmModal
        isOpen={showDeleteTransactionModal}
        onClose={() => {
          setShowDeleteTransactionModal(false);
          setSelectedTransaction(null);
        }}
        onConfirm={confirmDeleteTransaction}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
      />
      
      {/* NOVO Modal de exclusão de CASA */}
      <DeleteConfirmModal
        isOpen={showDeleteHouseModal}
        onClose={() => {
          setShowDeleteHouseModal(false);
          setHouseToDelete(null);
        }}
        onConfirm={confirmDeleteHouse}
        title="Excluir Casa de Apostas"
        message={`Tem certeza que deseja excluir a casa "${houseToDelete?.name}"? Todo o saldo e histórico de transações serão perdidos.`}
      />
    </div>
  );
};