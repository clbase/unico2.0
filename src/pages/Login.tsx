import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Shield, Mail, Lock, Phone, AlertTriangle, Clock, Ban, MessageCircle, UserPlus, Loader2 } from 'lucide-react';
import { useNavigationSettings } from '../hooks/useNavigationSettings';

// --- MODAIS (AccessRequestModal, StatusModal) ---
// (Estes não precisam de alteração, são os mesmos de antes)
const staticLines = [...Array(50)].map((_, i) => {
  const angle = -10 + (Math.random() * 50);
  const baseWidth = i % 3 === 0 ? 4 : i % 3 === 1 ? 2 : 1;
  const length = 200 + Math.random() * 600;
  const color = i % 5 === 0 ? '#ffffff' :
               i % 5 === 1 ? '#7200C9' :
               i % 5 === 2 ? '#9333ea' :
               i % 5 === 3 ? '#a855f7' :
                            '#c084fc';
  
  const gradient = `linear-gradient(
    90deg,
    transparent 0%,
    ${color} 20%,
    ${color} 80%,
    transparent 100%
  )`;

  return {
    left: `${Math.random() * 120 - 10}%`,
    top: `${Math.random() * 120 - 10}%`,
    width: `${length}px`,
    height: `${baseWidth}px`,
    background: gradient,
    opacity: 0.15 + Math.random() * 0.3,
    transform: `rotate(${angle}deg)`,
    transformOrigin: '0 50%',
    boxShadow: `0 0 ${15 + Math.random() * 25}px ${color}`,
    filter: 'blur(0.5px)',
  };
});

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'suspended' | 'expired';
}

interface AccessRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onSubmitRequest: (name: string, phone: string) => void;
}

const AccessRequestModal: React.FC<AccessRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  email,
  onSubmitRequest 
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('');
    }
  }, [isOpen]);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const phoneNumbers = phone.replace(/\D/g, '');
    if (phoneNumbers.length !== 11) {
      alert('Por favor, insira um número de telefone válido com DDD');
      return;
    }

    if (!name.trim()) {
      alert('Por favor, insira seu nome');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitRequest(name.trim(), phone);
      setName('');
      setPhone('');
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactAdmin = (adminName: string, whatsapp: string) => {
    window.open(`https://wa.me/${whatsapp}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-dark-600">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              🔐 Acesso Não Autorizado
            </h2>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
          Seu email <strong>{email}</strong> ainda não foi autorizado. Complete os dados abaixo para solicitar acesso ao sistema:
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              placeholder="Seu nome completo"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Telefone (WhatsApp)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className="w-full p-3 border rounded-lg dark:bg-dark-700 dark:border-dark-600 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              placeholder="(11) 99999-9999"
              maxLength={15}
              required
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Dica:</strong> Após enviar sua solicitação, você receberá uma confirmação e poderá fazer login assim que um administrador aprovar seu acesso.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Enviando Solicitação...
              </span>
            ) : (
              'Solicitar Acesso'
            )}
          </button>
        </form>
        
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ou contate um administrador diretamente:
          </p>
          
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleContactAdmin('Claiver', '5575991827481')}
              className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">Claiver</span>
              </div>
              <span className="text-green-600 dark:text-green-400 text-sm">WhatsApp</span>
            </button>
            
            <button
              onClick={() => handleContactAdmin('Johnny', '557592062106')}
              className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-800 dark:text-gray-200 font-medium">Johnny</span>
              </div>
              <span className="text-green-600 dark:text-green-400 text-sm">WhatsApp</span>
            </button>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-full bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

const StatusModal: React.FC<StatusModalProps> = ({ isOpen, onClose, status }) => {
  if (!isOpen) return null;

  const handleContactAdmin = (adminName: string, whatsapp: string) => {
    window.open(`https://wa.me/${whatsapp}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-dark-600">
        {status === 'expired' ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  ⏳ Plano Expirado
                </h2>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Seu plano atual expirou. Para continuar utilizando a planilha, entre em contato com um administrador para renovar seu acesso.
            </p>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contate um administrador:
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleContactAdmin('Claiver', '5575991827481')}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">Claiver</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 text-sm">WhatsApp</span>
                </button>
                
                <button
                  onClick={() => handleContactAdmin('Johnny', '557592062106')}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">Johnny</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 text-sm">WhatsApp</span>
                </button>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
            >
              Fechar
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  🚫 Perfil Suspenso
                </h2>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Seu perfil foi suspenso. Entre em contato com um administrador para regularizar sua situação e recuperar o acesso ao painel.
            </p>
            
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contate um administrador:
              </p>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleContactAdmin('Claiver', '5575991827481')}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">Claiver</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 text-sm">WhatsApp</span>
                </button>
                
                <button
                  onClick={() => handleContactAdmin('Johnny', '557592062106')}
                  className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">Johnny</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 text-sm">WhatsApp</span>
                </button>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 dark:bg-dark-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
            >
              Fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
};


// --- INÍCIO DAS CORREÇÕES ---

// 1. Componente separado para o FORMULÁRIO (sem card, sem fundo)
const LoginForm: React.FC<FormProps> = ({
  handleSubmit, email, setEmail, password, setPassword, phone, handlePhoneChange,
  isSignUp, setIsSignUp, error, loading
}) => {
  return (
    <>
      <div className="flex justify-center mb-8">
        <img 
          src="/2logo.png"
          alt="Vivendo de Surebet Logo" 
          className="h-24 w-auto transform hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="space-y-6">
        {error && (
          <div className="bg-red-900/30 border border-red-800/50 text-red-200 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-4 bg-black/50 border border-gray-800/50 rounded-xl text-white focus:ring-2 focus:ring-[#7200C9] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                required
                placeholder="Email"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-4 bg-black/50 border border-gray-800/50 rounded-xl text-white focus:ring-2 focus:ring-[#7200C9] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                required
                minLength={6}
                placeholder="Senha"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-10 pr-3 py-4 bg-black/50 border border-gray-800/50 rounded-xl text-white focus:ring-2 focus:ring-[#7200C9] focus:border-transparent transition-all duration-200 placeholder-gray-500"
                  required
                  placeholder="Telefone"
                  maxLength={15}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#7200C9] to-[#9333ea] text-white py-4 px-4 rounded-xl font-bold hover:from-[#8b5cf6] hover:to-[#a855f7] focus:outline-none focus:ring-2 focus:ring-[#7200C9] focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 transform hover:scale-[1.02] ${
              loading ? 'opacity-50 cursor-not-allowed transform-none' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                {isSignUp ? 'Criando conta...' : 'Entrando...'}
              </span>
            ) : isSignUp ? (
              'Criar Conta'
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setEmail('');
              setPassword('');
              setPhone('');
            }}
            className="text-[#7200C9] hover:text-[#9333ea] transition-colors font-medium"
          >
            {isSignUp
              ? 'Já tem uma conta? Entre'
              : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </>
  );
};

// Propriedades do formulário, para passarmos para os layouts
interface FormProps {
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  phone: string;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSignUp: boolean;
  setIsSignUp: (val: boolean) => void;
  error: string;
  loading: boolean;
}

// 2. Layout Simples (O antigo)
// Este é o card de login centralizado
const SimpleLayout: React.FC<FormProps> = (props) => {
  return (
    <div className="bg-black/70 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-900/50 relative z-10">
      <LoginForm {...props} />
    </div>
  );
};

// 3. Layout Novo (Com Demo)
// Este é o grid de 2 colunas. Ele NÃO é um card.
const DemoLayout: React.FC<FormProps> = (props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-24 items-center w-full max-w-screen-xl mx-auto relative z-10">
      
      {/* Coluna da Esquerda (Demo) - Ocupa 3 colunas */}
      <div className="lg:col-span-3 w-full h-full p-4 lg:p-0 flex flex-col justify-center items-center">
        <div className="w-full max-w-4xl h-[700px] max-h-[80vh] bg-dark-900 border border-dashed border-gray-700 rounded-2xl flex items-center justify-center">
          <p className="text-gray-500 text-2xl text-center">
            (Aqui vai o seu vídeo ou GIF da planilha)
          </p>
        </div>
      </div>
      
      {/* Coluna da Direita (Login) - Ocupa 2 colunas */}
      <div className="lg:col-span-2 w-full max-w-md mx-auto">
        {/* Renderiza o card de login ORIGINAL (SimpleLayout) */}
        <SimpleLayout {...props} />
      </div>
    </div>
  );
};


// Componente Principal 'Login'
export const Login: React.FC = () => {
  const { settings, loading: settingsLoading } = useNavigationSettings();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; status: 'suspended' | 'expired' | null }>({
    isOpen: false,
    status: null
  });
  const [accessRequestModal, setAccessRequestModal] = useState<{ isOpen: boolean; email: string }>({
    isOpen: false,
    email: ''
  });
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const checkEmailAllowed = async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('email')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) {
        console.error('Error checking email allowlist:', error);
        return false;
      }

      return data !== null;
    } catch (error) {
      console.error('Error in checkEmailAllowed:', error);
      return false;
    }
  };

  const handleAutomaticAccessRequest = async (userEmail: string, userPhone: string) => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userEmail.toLowerCase().trim(),
        password,
        options: {
          data: {
            phone: userPhone,
            status: 'pending'
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      const { error: requestError } = await supabase.rpc('create_access_request', {
        user_email: userEmail.toLowerCase().trim(),
        user_name: 'Usuário',
        user_phone: userPhone
      });

      if (requestError) {
        console.error('Access request creation failed:', requestError);
      }

    } catch (error: any) {
      if (error.message?.includes('User already registered')) {
        const { error: requestError } = await supabase.rpc('create_access_request', {
          user_email: userEmail.toLowerCase().trim(),
          user_name: 'Usuário',
          user_phone: userPhone
        });

        if (requestError) {
          if (requestError.message.includes('already exists')) {
            throw new Error('Já existe uma solicitação pendente para este email.');
          } else if (requestError.message.includes('already authorized')) {
            throw new Error('Este email já está autorizado.');
          } else {
            throw requestError;
          }
        }
      } else {
        throw error;
      }
    }
  };

  const handleAccessRequest = async (name: string, phone: string) => {
    try {
      const { error } = await supabase.rpc('create_access_request', {
        user_email: accessRequestModal.email || email.toLowerCase().trim(),
        user_name: name,
        user_phone: phone
      });

      if (error) {
        if (error.message.includes('already exists')) {
          setError('Já existe uma solicitação pendente para este email.');
        } else if (error.message.includes('already authorized')) {
          setError('Este email já está autorizado.');
        } else {
          throw error;
        }
        return;
      }

      setError('Solicitação de acesso enviada com sucesso! Aguarde a aprovação de um administrador.');
    } catch (error: any) {
      console.error('Error creating access request:', error);
      setError('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  const checkUserStatus = async (email: string) => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        return { hasAccess: null, status: null, signInError };
      }

      const user = signInData.user;
      const metadata = user?.user_metadata || {};
      const status = metadata.status || 'active';
      const accessEnd = metadata.access_end;
      const needsPasswordChange = metadata.needs_password_change;

      if (status === 'pending') {
        await supabase.auth.signOut();
        return { hasAccess: false, status: 'pending', signInError: null };
      }

      if (needsPasswordChange === true) {
        return { hasAccess: true, status: 'needs_password_change', signInError: null };
      }

      if (status === 'temporary' && accessEnd) {
        const now = new Date();
        const endDate = new Date(accessEnd);
        if (now > endDate) {
          await supabase.auth.signOut();
          return { hasAccess: false, status: 'expired', signInError: null };
        }
      }

      if (status === 'suspended') {
        await supabase.auth.signOut();
        return { hasAccess: false, status: 'suspended', signInError: null };
      }

      if (status === 'expired') {
        await supabase.auth.signOut();
        return { hasAccess: false, status: 'expired', signInError: null };
      }

      return { hasAccess: true, status, signInError: null };
    } catch (error) {
      console.error('Error checking user status:', error);
      return { hasAccess: null, status: null, signInError: error };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();

      if (isSignUp) {
        const phoneNumbers = phone.replace(/\D/g, '');
        if (phoneNumbers.length !== 11) {
          setError('Por favor, insira um número de telefone válido com DDD');
          setLoading(false);
          return;
        }

        const isAllowed = await checkEmailAllowed(normalizedEmail);
        if (!isAllowed) {
          try {
            await handleAutomaticAccessRequest(normalizedEmail, phone);
            setError('✅ Sua conta foi criada com sucesso!\nNo entanto, ela ainda está pendente de aprovação.\nAguarde um administrador autorizar o acesso ou entre em contato pelo WhatsApp para agilizar o processo.');
            setIsSignUp(false);
            setEmail('');
            setPassword('');
            setPhone('');
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error creating automatic access request:', error);
            setError('Não foi possível criar a solicitação automaticamente. Por favor, preencha os dados abaixo:');
            setAccessRequestModal({ isOpen: true, email: normalizedEmail });
            setLoading(false);
            return;
          }
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              phone: phone,
              status: 'pending'
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        setError('Conta criada com sucesso! Faça login para continuar.');
        setIsSignUp(false);
        setLoading(false);
        return;
      }

      const { hasAccess, status, signInError } = await checkUserStatus(normalizedEmail);
      
      if (signInError) {
        if (signInError.message?.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else {
          setError(signInError.message || 'Erro ao fazer login');
        }
        setLoading(false);
        return;
      }

      if (hasAccess === false) {
        setLoading(false);
        if (status === 'pending') {
          setError('✅ Sua conta foi criada com sucesso!\nNo entanto, ela ainda está pendente de aprovação.\nAguarde um administrador autorizar o acesso ou entre em contato pelo WhatsApp para agilizar o processo.');
          return;
        }
        if (status === 'suspended' || status === 'expired') {
          setStatusModal({ isOpen: true, status });
          return;
        } else {
          setError('Acesso negado. Entre em contato com um administrador.');
          return;
        }
      }

      if (status === 'needs_password_change') {
        navigate('/change-password');
        setLoading(false);
        return;
      }

      try {
        await supabase.rpc('clear_force_logout');
      } catch (error) {
        console.error('Error clearing force logout:', error);
      }

      navigate('/planilha');
    } catch (error: any) {
      console.error('Auth error:', error);
      if (error.message?.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Verifique seu email para confirmar a conta');
      } else {
        setError(error.message || 'Erro ao autenticar');
      }
      setLoading(false);
    }
  };

  const closeAccessRequestModal = () => {
    setAccessRequestModal({ isOpen: false, email: '' });
  };

  const closeStatusModal = () => {
    setStatusModal({ isOpen: false, status: null });
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  const formProps = {
    handleSubmit, email, setEmail, password, setPassword, phone, handlePhoneChange,
    isSignUp, setIsSignUp, error, loading
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111111 50%, #0f0f0f 75%, #000000 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {staticLines.map((style, i) => (
          <div
            key={`line-${i}`}
            className="absolute"
            style={style}
          />
        ))}
      </div>

      {settings.login_preview ? (
        <DemoLayout {...formProps} />
      ) : (
        <SimpleLayout {...formProps} />
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        status={statusModal.status!}
      />

      <AccessRequestModal
        isOpen={accessRequestModal.isOpen}
        onClose={closeAccessRequestModal}
        email={accessRequestModal.email}
        onSubmitRequest={handleAccessRequest}
      />
    </div>
  );
};