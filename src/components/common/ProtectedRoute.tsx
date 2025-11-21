import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);
  const [shouldRedirectToChangePassword, setShouldRedirectToChangePassword] = React.useState(false);
  const [shouldRedirectToDashboard, setShouldRedirectToDashboard] = React.useState(false);
  const [forceLogoutMessage, setForceLogoutMessage] = React.useState(false);

  React.useEffect(() => {
    const checkAccess = async () => {
      if (session) {
        try {
          // Check if user was force logged out
          const { data: wasForceLoggedOut, error: forceLogoutError } = await supabase.rpc(
            'check_force_logout'
          );
          
          if (forceLogoutError) throw forceLogoutError;

          if (wasForceLoggedOut) {
            // Clear the force logout flag
            await supabase.rpc('clear_force_logout');
            
            // Show message and sign out immediately
            setForceLogoutMessage(true);
            
            // Force logout immediately
            await signOut();
            
            // Clear the message after showing it briefly
            setTimeout(() => {
              setForceLogoutMessage(false);
              window.location.href = '/login';
            }, 3000);
            return;
          }

          // Check if user has valid access
          const { data: hasAccess, error: accessError } = await supabase.rpc(
            'check_user_access'
          );
          if (accessError) throw accessError;

          if (!hasAccess) {
            await signOut();
            window.location.reload();
            return;
          }

          // Check if user needs to change password
          const { data: needsPasswordChange, error: passwordError } = await supabase.rpc(
            'is_temporary_password'
          );
          if (passwordError) throw passwordError;

          // Handle password change redirects
          if (needsPasswordChange && location.pathname !== '/change-password') {
            setShouldRedirectToChangePassword(true);
            setShouldRedirectToDashboard(false);
          } else if (!needsPasswordChange && location.pathname === '/change-password') {
            setShouldRedirectToDashboard(true);
            setShouldRedirectToChangePassword(false);
          } else {
            setShouldRedirectToChangePassword(false);
            setShouldRedirectToDashboard(false);
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          // Se falhar, desloga por segurança
          await signOut();
          window.location.reload();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAccess();

    // Set up real-time subscription for user metadata changes
    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'USER_UPDATED' && session) {
        const { data: hasAccess } = await supabase.rpc('check_user_access');
        if (!hasAccess) {
          await signOut();
          window.location.reload();
        }
      }
    });

    // Set up interval to check for force logout every 5 seconds
    const forceLogoutInterval = setInterval(async () => {
      if (session) {
        try {
          const { data: wasForceLoggedOut } = await supabase.rpc('check_force_logout');
          if (wasForceLoggedOut) {
            // Clear the force logout flag
            await supabase.rpc('clear_force_logout');
            
            // Show message and sign out immediately
            setForceLogoutMessage(true);
            
            // Force logout immediately
            await signOut();
            
            // Clear the message after showing it briefly
            setTimeout(() => {
              setForceLogoutMessage(false);
              window.location.href = '/login';
            }, 3000);
          }
        } catch (error) {
          console.error('Error checking force logout:', error);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => {
      subscription.data.subscription.unsubscribe();
      clearInterval(forceLogoutInterval);
    };
  }, [session, signOut, location.pathname]); // location.pathname AINDA É NECESSÁRIO aqui para a lógica do /change-password

  // Show force logout message
  if (forceLogoutMessage) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-dark-800 p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Você foi deslogado pelo administrador
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Redirecionando para a página de login...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Se não houver sessão, redireciona para o login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // ATUALIZADO: Mostra um spinner de tela cheia
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to change password if needed
  if (shouldRedirectToChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  // Redirect to dashboard if password change is no longer needed
  if (shouldRedirectToDashboard) {
    return <Navigate to="/planilha" replace />;
  }

  // Se tudo estiver OK, renderiza a página filha
  return children;
};