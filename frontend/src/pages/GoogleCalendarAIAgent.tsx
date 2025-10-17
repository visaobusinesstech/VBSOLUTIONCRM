import React from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { GoogleCalendarActions } from '@/components/ai-agent/GoogleCalendarActions';
import { AlignJustify } from 'lucide-react';

export default function GoogleCalendarAIAgent() {
  const { sidebarExpanded, setSidebarExpanded } = useSidebar();

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Botão de toggle da sidebar - só aparece quando colapsada */}
              {!sidebarExpanded && (
                <button
                  onClick={handleSidebarToggle}
                  className="w-7 h-7 p-0 bg-white/20 backdrop-blur-sm border-white/20 hover:bg-white/40 transition-all duration-300 opacity-70 hover:opacity-100 rounded-lg flex items-center justify-center"
                  title="Exibir barra lateral"
                >
                  <AlignJustify className="h-3.5 w-3.5 text-gray-600" />
                </button>
              )}
              
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0f172a] to-[#1e293b] bg-clip-text text-transparent">
                  AI Agent - Google Calendar
                </h1>
                <p className="text-gray-600 text-sm">
                  Gerencie eventos do Google Calendar através de comandos em linguagem natural
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-6">
        <GoogleCalendarActions />
      </div>
    </div>
  );
}
