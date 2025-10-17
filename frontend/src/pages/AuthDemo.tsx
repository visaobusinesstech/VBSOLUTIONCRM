import { useState } from 'react';
import SignupForm from '@/components/ui/login-signup';
import SignIn from '@/components/ui/demo';

export default function AuthDemo() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header com tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('login')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'login'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In Demo
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up Demo
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            VBSolution Auth Components Demo
          </h1>
          <p className="text-gray-600">
            Demonstração dos componentes de autenticação integrados ao sistema VBSolution.
            Estes componentes seguem o design system shadcn/ui e estão prontos para uso.
          </p>
        </div>

        {/* Componente ativo */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {activeTab === 'login' ? <SignIn /> : <SignupForm />}
        </div>

        {/* Informações técnicas */}
        <div className="bg-gray-50 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Informações Técnicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Componentes Utilizados:</h3>
              <ul className="space-y-1">
                <li>• Button (shadcn/ui)</li>
                <li>• Card, CardContent, CardHeader, CardFooter</li>
                <li>• Input, Label, Checkbox</li>
                <li>• Select (para SignUp)</li>
                <li>• Lucide React Icons</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Recursos:</h3>
              <ul className="space-y-1">
                <li>• TypeScript completo</li>
                <li>• Tailwind CSS styling</li>
                <li>• Responsive design</li>
                <li>• Acessibilidade (ARIA)</li>
                <li>• Estados interativos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
