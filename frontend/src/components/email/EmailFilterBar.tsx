import React from 'react';
import { Filter, Mail, CheckCircle, Users, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface EmailFilterBarProps {
  filters: {
    search: string;
    status?: string;
    canal?: string;
    tipoEnvio?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  onFilterChange: (key: string, value: any) => void;
  searchPlaceholder?: string;
  showCanalFilter?: boolean;
  showStatusFilter?: boolean;
  showTipoEnvioFilter?: boolean;
}

const EmailFilterBar: React.FC<EmailFilterBarProps> = ({
  filters,
  onFilterChange,
  searchPlaceholder = "Filtrar...",
  showCanalFilter = false,
  showStatusFilter = false,
  showTipoEnvioFilter = false
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Campo de busca */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-10 h-8 text-sm border-0 bg-transparent focus:border-0 focus:ring-0 text-black placeholder-gray-500"
            />
          </div>
        </div>

        {/* Filtros funcionais */}
        <div className="flex items-center gap-2">
          {/* Filtro de Status */}
          {showStatusFilter && (
            <Select value={filters.status || 'all'} onValueChange={(value) => onFilterChange('status', value)}>
              <SelectTrigger className="h-7 w-24 border-0 bg-transparent text-black text-xs shadow-none pl-2 pr-0.5 hover:bg-blue-50 focus:bg-blue-50">
                <CheckCircle className="h-3 w-3 mr-3" />
                <SelectValue placeholder="Status" />
                <ChevronDown className="h-3 w-3 ml-0.5" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="all" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Status</SelectItem>
                <SelectItem value="ativo" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Ativo</SelectItem>
                <SelectItem value="inativo" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Inativo</SelectItem>
                <SelectItem value="enviado" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Enviado</SelectItem>
                <SelectItem value="pendente" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Pendente</SelectItem>
                <SelectItem value="erro" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Erro</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Filtro de Canal */}
          {showCanalFilter && (
            <Select value={filters.canal || 'all'} onValueChange={(value) => onFilterChange('canal', value)}>
              <SelectTrigger className="h-7 w-20 border-0 bg-transparent text-black text-xs shadow-none pl-2 pr-0.5 hover:bg-blue-50 focus:bg-blue-50">
                <Mail className="h-3 w-3 mr-3" />
                <SelectValue placeholder="Canal" />
                <ChevronDown className="h-3 w-3 ml-0.5" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="all" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Canal</SelectItem>
                <SelectItem value="email" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Email</SelectItem>
                <SelectItem value="whatsapp" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">WhatsApp</SelectItem>
                <SelectItem value="sms" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">SMS</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Filtro de Tipo de Envio */}
          {showTipoEnvioFilter && (
            <Select value={filters.tipoEnvio || 'all'} onValueChange={(value) => onFilterChange('tipoEnvio', value)}>
              <SelectTrigger className="h-7 w-28 border-0 bg-transparent text-black text-xs shadow-none pl-2 pr-0.5 hover:bg-blue-50 focus:bg-blue-50">
                <Users className="h-3 w-3 mr-3" />
                <SelectValue placeholder="Tipo" />
                <ChevronDown className="h-3 w-3 ml-0.5" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                <SelectItem value="all" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Tipo</SelectItem>
                <SelectItem value="individual" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Individual</SelectItem>
                <SelectItem value="lote" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Lote</SelectItem>
                <SelectItem value="contact" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Contato</SelectItem>
                <SelectItem value="company" className="hover:bg-gray-100 focus:bg-gray-100 text-xs">Empresa</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Filtro de Data Personalizado */}
          <div className="flex items-center gap-1">
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              className="h-7 w-32 border-0 bg-transparent text-black text-xs shadow-none hover:bg-blue-50 focus:bg-blue-50 px-2"
              placeholder="Data"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailFilterBar;

