import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type LucideIcon } from "lucide-react";
import {
  Users,
  Calendar,
  Building2,
  Package,
  UserPlus,
  BarChart3,
  FileText,
  Settings,
  MessageCircle,
  Home,
  FolderOpen,
  ClipboardList,
  UserCheck,
  Briefcase,
  TrendingUp,
  ShoppingCart,
  Truck,
  Archive,
  DollarSign,
  PieChart,
  MessageSquare,
  Key,
  Zap,
  Mail
} from "lucide-react";

export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  variant?: "default" | "ghost";
}

export const useNavItems = (): NavItem[] => {
  const { t } = useTranslation();
  
  return useMemo(() => [
    {
      title: t('sidebar.home'),
      to: "/",
      icon: Home,
    },
    {
      title: t('sidebar.feed'),
      to: "/feed",
      icon: MessageCircle,
    },
    {
      title: t('sidebar.activities'),
      to: "/activities",
      icon: ClipboardList,
    },
    {
      title: t('sidebar.calendar'),
      to: "/calendar",
      icon: Calendar,
    },
    {
      title: t('sidebar.leadsAndSales'),
      to: "/leads-sales",
      icon: TrendingUp,
    },
    {
      title: t('sidebar.reportsDashboard'),
      to: "/reports-dashboard",
      icon: PieChart,
    },
    {
      title: t('sidebar.companies'),
      to: "/companies",
      icon: Building2,
    },
    {
      title: t('sidebar.employees'),
      to: "/employees",
      icon: Users,
    },
    {
      title: t('pages.products.title') || 'Produtos',
      to: "/products",
      icon: Package,
    },
    {
      title: t('sidebar.suppliers'),
      to: "/suppliers",
      icon: UserPlus,
    },
    {
      title: t('sidebar.inventory'),
      to: "/inventory",
      icon: Archive,
    },
    {
      title: t('pages.transfers.title') || 'Transferências',
      to: "/transfers",
      icon: Truck,
    },
    {
      title: t('sidebar.writeoffs'),
      to: "/writeoffs",
      icon: Archive,
    },
    {
      title: t('sidebar.salesOrders'),
      to: "/sales-orders",
      icon: ShoppingCart,
    },
    {
      title: t('sidebar.salesFunnel'),
      to: "/sales-funnel",
      icon: DollarSign,
    },
    {
      title: t('sidebar.projects'),
      to: "/projects",
      icon: Briefcase,
    },
    {
      title: t('sidebar.workGroups'),
      to: "/work-groups",
      icon: UserCheck,
    },
    {
      title: t('sidebar.files'),
      to: "/files",
      icon: FolderOpen,
    },
    {
      title: t('sidebar.reports'),
      to: "/reports",
      icon: BarChart3,
    },
    {
      title: t('sidebar.chat'),
      to: "/chat",
      icon: MessageCircle,
    },
    {
      title: t('sidebar.collaborations'),
      to: "/collaborations",
      icon: Users,
    },
    {
      title: t('sidebar.whatsapp'),
      to: "/whatsapp",
      icon: MessageSquare,
    },
    {
      title: t('sidebar.email'),
      to: "/email",
      icon: Mail,
    },
    {
      title: t('sidebar.automations'),
      to: "/automations",
      icon: Zap,
    },
    {
      title: t('pages.integration.title') || 'Integração',
      to: "/integration",
      icon: Key,
    },
    {
      title: t('sidebar.settings'),
      to: "/settings",
      icon: Settings,
    }
  ], [t]);
};

