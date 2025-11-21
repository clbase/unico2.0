import React from 'react';
import {
  useNavigate,
  useLocation,
  Link
} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigationSettings } from '../hooks/useNavigationSettings';
import {
  LayoutDashboard,
  PlusCircle,
  Calculator,
  Table,
  LogOut,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Shield,
  Wallet,
  HelpCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Trophy,
  AppWindow,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserInfoModal } from './common/UserInfoModal';

// ... (Mantenha as interfaces NavItemProps, NavItem, ActionButton e SupportModal exatamente como estão) ...

// --- COMPONENTES AUXILIARES (Copie o código existente dos componentes auxiliares aqui) ---
interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isCollapsed, isActive, onClick }) => (
  <Link
    to={to}
    className={`group relative flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 transition-all duration-300 ${
      isActive 
        ? 'bg-gradient-to-r from-purple-600/30 to-transparent text-white border-r-4 border-purple-300' 
        : 'hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-transparent hover:text-white'
    } ${isCollapsed ? 'justify-center' : ''}`}
    onClick={onClick}
    title={isCollapsed ? label : undefined}
  >
    <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
    {!isCollapsed && (
      <span className="transition-opacity duration-300">{label}</span>
    )}
    
    {isCollapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </Link>
);

const ActionButton = ({ onClick, icon: Icon, label, isCollapsed, className = "" }: {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`group relative flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-200 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-transparent hover:text-white ${
      isCollapsed ? 'justify-center' : ''
    } ${className}`}
    title={isCollapsed ? label : undefined}
  >
    <Icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
    {!isCollapsed && (
      <span className="transition-opacity duration-300">{label}</span>
    )}
    
    {isCollapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </button>
);

const SupportModal = ({ isOpen, onClose, isDark }: { isOpen: boolean; onClose: () => void; isDark: boolean }) => {
  if (!isOpen) return null;

  const admins = [
    { name: 'Claiver', whatsapp: '5575991827481' },
    { name: 'Johnny', whatsapp: '557592062106' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img 
            src={isDark ? "/2logo.png" : "/1logo.png"} 
            alt="Logo" 
            className="h-16 mb-4" 
          />
          <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
            Precisa de ajuda? Fale com um de nossos administradores abaixo e receba suporte imediato. 🚀
          </p>
        </div>

        <div className="space-y-4">
          {admins.map((admin) => (
            <a
              key={admin.name}
              href={`http://wa.me/${admin.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
            >
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {admin.name}
              </span>
              <span className="text-green-500 text-sm">
                Contatar via WhatsApp
              </span>
            </a>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 dark:bg-dark-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
// ----------------------------------------------------------------------------------------


// --- COMPONENTE PRINCIPAL ---

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { settings: navSettings, loading: navLoading } = useNavigationSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = React.useState(false);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = React.useState(false);

  React.useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      setIsAdmin(data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // --- LÓGICA DE ROTA ATIVA CORRIGIDA ---
  const isActivePath = (path: string) => {
    // Se for a rota raiz da Planilha (Dashboard), a comparação deve ser EXATA
    if (path === '/planilha') {
      return location.pathname === '/planilha' || location.pathname === '/planilha/';
    }
    // Para outras rotas (ex: /planilha/bets), verifica se começa com o caminho
    return location.pathname.startsWith(path);
  };
  // ---------------------------------------

  const openCalculatorPopup = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileMenuOpen(false);
    
    const width = 1100;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // Se a calculadora estiver hospedada no mesmo domínio/rota
    window.open(
      '/calculadora', // Ou use a URL completa se preferir
      'CalculadoraVDS',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-dark-900 transition-colors duration-200">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-dark-800 shadow-lg"
        aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 bg-white dark:bg-dark-800 shadow-md transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-all duration-300 ease-in-out flex flex-col h-full ${
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        } w-64`}
      >
        {/* Header with Logo */}
        <div className={`p-4 flex items-center border-b dark:border-dark-700 ${
          isCollapsed ? 'justify-center' : 'justify-center'
        }`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
            <img 
              src={isCollapsed ? "/reclogo.png" : (isDark ? "/2logo.png" : "/1logo.png")} 
              alt="Logo" 
              className={`transition-all duration-300 ${
                isCollapsed ? 'h-8 w-8' : 'h-16'
              }`}
            />
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-dark-800 hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors absolute -right-4 z-20 shadow-lg border border-gray-200 dark:border-dark-600 ${
            isCollapsed ? 'top-12' : 'top-20'
          }`}
          title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Navigation - LINKS ATUALIZADOS COM O PREFIXO /planilha */}
        <nav className={`flex-1 py-4 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
          <NavItem
            to="/planilha"
            icon={LayoutDashboard}
            label="Dashboard"
            isCollapsed={isCollapsed}
            isActive={isActivePath('/planilha')}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <NavItem
            to="/planilha/new-bet"
            icon={PlusCircle}
            label="Adicionar Aposta"
            isCollapsed={isCollapsed}
            isActive={isActivePath('/planilha/new-bet')}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <NavItem
            to="/planilha/bets"
            icon={Table}
            label="Planilha de Sure"
            isCollapsed={isCollapsed}
            isActive={isActivePath('/planilha/bets')}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {!navLoading && navSettings.earnings && (
            <NavItem
              to="/planilha/earnings"
              icon={TrendingUp}
              label="Ganhos"
              isCollapsed={isCollapsed}
              isActive={isActivePath('/planilha/earnings')}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
          
          {!navLoading && navSettings.bankroll && (
            <NavItem
              to="/planilha/bankroll"
              icon={Wallet}
              label="Banca"
              isCollapsed={isCollapsed}
              isActive={isActivePath('/planilha/bankroll')}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
          
          {/* CALCULADORA (Botão Dividido) */}
          {!navLoading && navSettings.calculator && (
            <div className="flex items-stretch w-full text-gray-700 dark:text-gray-200">
              {/* Parte Esquerda: Link Nova Aba */}
              <a
                href="/calculadora"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 group relative flex items-center px-4 py-3 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-transparent hover:text-white ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
                title="Calculadora (Nova Aba)"
              >
                <Calculator className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                {!isCollapsed && <span>Calculadora</span>}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Calculadora
                  </div>
                )}
              </a>

              {/* Parte Direita: Popup */}
              {!isCollapsed && (
                <button
                  onClick={openCalculatorPopup}
                  className="w-12 flex items-center justify-center border-l border-gray-200 dark:border-dark-700 hover:bg-purple-600/20 hover:text-white transition-colors"
                  title="Calculadora (Janela Flutuante)"
                >
                  <AppWindow className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
          
          <NavItem
            to="/planilha/awards"
            icon={Trophy}
            label="Prêmios"
            isCollapsed={isCollapsed}
            isActive={isActivePath('/planilha/awards')}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {isAdmin && (
            <NavItem
              to="/planilha/admin"
              icon={Shield}
              label="Administração"
              isCollapsed={isCollapsed}
              isActive={isActivePath('/planilha/admin')}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </nav>

        {/* Footer Actions */}
        <div className="border-t dark:border-dark-700 p-4">
          <ActionButton
            onClick={() => setIsUserInfoModalOpen(true)}
            icon={User}
            label="Minha Conta"
            isCollapsed={isCollapsed}
          />
          <ActionButton
            onClick={toggleTheme}
            icon={isDark ? Sun : Moon}
            label="Alterar Tema"
            isCollapsed={isCollapsed}
          />
          <ActionButton
            onClick={() => setIsSupportModalOpen(true)}
            icon={HelpCircle}
            label="Suporte"
            isCollapsed={isCollapsed}
          />
          <ActionButton
            onClick={handleSignOut}
            icon={LogOut}
            label="Sair"
            isCollapsed={isCollapsed}
            className="text-red-600 dark:text-red-400 hover:text-white"
          />
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Modais */}
      <SupportModal 
        isOpen={isSupportModalOpen} 
        onClose={() => setIsSupportModalOpen(false)} 
        isDark={isDark} 
      />

      <UserInfoModal
        isOpen={isUserInfoModalOpen}
        onClose={() => setIsUserInfoModalOpen(false)}
      />

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto pt-16 lg:pt-8 relative transition-all duration-300">
        {children}
      </main>
    </div>
  );
};