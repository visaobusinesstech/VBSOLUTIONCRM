import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { EmailConfirmationHandler } from '@/components/EmailConfirmationHandler';
import { LoginRedirectHandler } from '@/components/LoginRedirectHandler';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  
  const navigate = useNavigate();
  const { signIn, signUp, signInCompanyUser } = useAuth();

  // Estados para login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Estados para cadastro
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerCompany, setRegisterCompany] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signIn(loginEmail, loginPassword);

    if (result.error) {
      setError(result.error.message);
    } else {
      navigate('/');
    }

    setIsLoading(false);
  };

  const handleCompanyUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signInCompanyUser(loginEmail, loginPassword);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Erro no login');
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await signUp(registerEmail, registerPassword, {
      name: registerName,
      company: registerCompany,
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      setActiveTab('login');
      setError('');
    }

    setIsLoading(false);
  };

  return (
    <>
      <EmailConfirmationHandler />
      <LoginRedirectHandler />
      <div className="min-h-screen relative overflow-hidden flex">
      {/* Vídeo de fundo */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover"
        >
          <source src="/login/background.mp4" type="video/mp4" />
          {/* Fallback para gradiente caso o vídeo não carregue */}
        </video>
        {/* Overlay escuro */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>
      
      {/* Conteúdo */}
      <div className="relative z-10 w-full flex">
        {/* Lado Esquerdo - Logo e Frase */}
        <div className="hidden lg:flex lg:w-1/2 flex-col p-12">
          <div className="flex flex-col items-start gap-2">
            <img 
              src="https://i.imgur.com/KdKLVUV.png" 
              alt="VBSolution Logo" 
              className="h-16 w-16 object-contain filter brightness-0 invert drop-shadow-2xl"
            />
            <p className="text-lg text-white max-w-md drop-shadow-lg leading-relaxed">
              Bem-vindo ao VBSolution.<br />
              Tenha a visão completa do seu negócio.<br />
              Automatize processos, impulsione vendas e gerencie tudo em um só lugar.
            </p>
          </div>
        </div>

        {/* Lado Direito - Formulário Azul Escuro Transparente */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <Card className="w-full max-w-sm mx-4 pb-0 bg-slate-900/40 backdrop-blur-sm border-slate-700/20">
            <CardHeader className="space-y-1 text-center mb-2 mt-3">
              {/* Logo Mobile */}
              <div className="lg:hidden flex justify-center mb-3">
                <img 
                  src="https://i.imgur.com/KdKLVUV.png" 
                  alt="VBSolution Logo" 
                  className="h-12 w-12 object-contain filter brightness-0 invert"
                />
              </div>
              <div>
                <h2 className="text-xl text-white">
                  Entrar na VBSolution
                </h2>
                <p className="text-white/70 text-sm">
                  Bem-vindo de volta! Digite seus dados.
                </p>
              </div>
          </CardHeader>
            
            <CardContent className="space-y-5">
              {/* Formulário de Login */}
              <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white">Endereço de email</Label>
                      <Input
                        id="login-email"
                        type="email"
                      placeholder="usuario@vbsolution.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white focus:ring-white/50"
                        required
                      />
                  </div>

                  <div className="space-y-0">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="login-password" className="text-white">Senha</Label>
                      <a href="#" className="text-sm text-cyan-300 hover:text-cyan-200 hover:underline">
                        Esqueci minha senha
                      </a>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        className="pe-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white focus:ring-white/50"
                        placeholder="Digite sua senha"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <button
                        className="text-white/60 hover:text-white focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        aria-pressed={showPassword}
                        aria-controls="login-password"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      defaultChecked 
                      className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-blue-900 data-[state=checked]:border-white"
                    />
                    <Label htmlFor="remember" className="text-sm font-normal text-white">
                      Lembrar de mim
                    </Label>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="py-3 bg-red-500/20 border-red-400/50">
                      <AlertDescription className="text-sm text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold" 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </div>
                </form>
          </CardContent>
            
            <CardFooter className="flex justify-center border-t border-white/20 !py-4">
              <p className="text-center text-sm text-white/70">
                Novo na VBSolution?{" "}
                <a href="/register" className="text-cyan-300 hover:text-cyan-200 hover:underline">
                  Registre-se
                </a>
              </p>
            </CardFooter>
        </Card>
        </div>
      </div>
    </div>
    </>
  );
} 
