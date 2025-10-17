-- =====================================================
-- APLICAR OWNER_ID E RLS EM TODAS AS TABELAS
-- Garante isolamento total de dados entre empresas
-- =====================================================

-- ⚠️ IMPORTANTE: Execute este script no Supabase SQL Editor

BEGIN;

-- =====================================================
-- PARTE 1: ADICIONAR COLUNA OWNER_ID EM TODAS AS TABELAS
-- =====================================================

-- Tabelas principais
ALTER TABLE IF EXISTS activities ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS calendar_events ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS contacts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS companies ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS employees ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS suppliers ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS inventory ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS writeoffs ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS sales_orders ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS sales_funnel ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS work_groups ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS files ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS reports ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS automations ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS collaborations ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS leads ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS organizational_structure ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS role_permissions ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS company_settings ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS whatsapp_messages ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS whatsapp_connections ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS notifications ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS feed_posts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE IF EXISTS comments ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- =====================================================
-- PARTE 2: CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_activities_owner_id ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_owner_id ON calendar_events(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_employees_owner_id ON employees(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_owner_id ON products(owner_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_owner_id ON suppliers(owner_id);
CREATE INDEX IF NOT EXISTS idx_inventory_owner_id ON inventory(owner_id);
CREATE INDEX IF NOT EXISTS idx_writeoffs_owner_id ON writeoffs(owner_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_owner_id ON sales_orders(owner_id);
CREATE INDEX IF NOT EXISTS idx_sales_funnel_owner_id ON sales_funnel(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_work_groups_owner_id ON work_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_files_owner_id ON files(owner_id);
CREATE INDEX IF NOT EXISTS idx_reports_owner_id ON reports(owner_id);
CREATE INDEX IF NOT EXISTS idx_automations_owner_id ON automations(owner_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_owner_id ON collaborations(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizational_structure_owner_id ON organizational_structure(owner_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_owner_id ON role_permissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_owner_id ON company_settings(owner_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_owner_id ON whatsapp_messages(owner_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_owner_id ON whatsapp_connections(owner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_owner_id ON notifications(owner_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_owner_id ON feed_posts(owner_id);
CREATE INDEX IF NOT EXISTS idx_comments_owner_id ON comments(owner_id);

-- Índices para company_users e profiles
CREATE INDEX IF NOT EXISTS idx_company_users_owner_id ON company_users(owner_id);
CREATE INDEX IF NOT EXISTS idx_company_users_email ON company_users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_owner_id ON profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- =====================================================
-- PARTE 3: GARANTIR UNICIDADE DE OWNER_ID E COMPANY_NAME
-- =====================================================

-- Garantir que cada owner_id seja único (uma empresa por owner)
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_users_unique_owner_admin 
ON company_users(owner_id) 
WHERE role = 'admin';

-- Garantir que o nome da empresa seja único
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_users_unique_company_name 
ON company_users(company_name);

-- =====================================================
-- PARTE 4: HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE writeoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizational_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 5: CRIAR FUNÇÃO AUXILIAR PARA OBTER OWNER_ID
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_owner_id()
RETURNS UUID AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Primeiro tenta buscar no profiles
  SELECT owner_id INTO v_owner_id
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  -- Se não encontrar, busca no company_users
  IF v_owner_id IS NULL THEN
    SELECT owner_id INTO v_owner_id
    FROM company_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    LIMIT 1;
  END IF;
  
  RETURN v_owner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PARTE 6: REMOVER POLÍTICAS ANTIGAS
-- =====================================================

-- Activities
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON activities;

-- Calendar Events
DROP POLICY IF EXISTS "Users can view own calendar_events" ON calendar_events;
DROP POLICY IF EXISTS "Users can insert own calendar_events" ON calendar_events;
DROP POLICY IF EXISTS "Users can update own calendar_events" ON calendar_events;
DROP POLICY IF EXISTS "Users can delete own calendar_events" ON calendar_events;

-- Contacts
DROP POLICY IF EXISTS "Users can view own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update own contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete own contacts" ON contacts;

-- Companies
DROP POLICY IF EXISTS "Users can view own companies" ON companies;
DROP POLICY IF EXISTS "Users can insert own companies" ON companies;
DROP POLICY IF EXISTS "Users can update own companies" ON companies;
DROP POLICY IF EXISTS "Users can delete own companies" ON companies;

-- Employees
DROP POLICY IF EXISTS "Users can view own employees" ON employees;
DROP POLICY IF EXISTS "Users can insert own employees" ON employees;
DROP POLICY IF EXISTS "Users can update own employees" ON employees;
DROP POLICY IF EXISTS "Users can delete own employees" ON employees;

-- Products
DROP POLICY IF EXISTS "Users can view own products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

-- Suppliers
DROP POLICY IF EXISTS "Users can view own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;

-- Inventory
DROP POLICY IF EXISTS "Users can view own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can insert own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can update own inventory" ON inventory;
DROP POLICY IF EXISTS "Users can delete own inventory" ON inventory;

-- Writeoffs
DROP POLICY IF EXISTS "Users can view own writeoffs" ON writeoffs;
DROP POLICY IF EXISTS "Users can insert own writeoffs" ON writeoffs;
DROP POLICY IF EXISTS "Users can update own writeoffs" ON writeoffs;
DROP POLICY IF EXISTS "Users can delete own writeoffs" ON writeoffs;

-- Sales Orders
DROP POLICY IF EXISTS "Users can view own sales_orders" ON sales_orders;
DROP POLICY IF EXISTS "Users can insert own sales_orders" ON sales_orders;
DROP POLICY IF EXISTS "Users can update own sales_orders" ON sales_orders;
DROP POLICY IF EXISTS "Users can delete own sales_orders" ON sales_orders;

-- Sales Funnel
DROP POLICY IF EXISTS "Users can view own sales_funnel" ON sales_funnel;
DROP POLICY IF EXISTS "Users can insert own sales_funnel" ON sales_funnel;
DROP POLICY IF EXISTS "Users can update own sales_funnel" ON sales_funnel;
DROP POLICY IF EXISTS "Users can delete own sales_funnel" ON sales_funnel;

-- Projects
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Work Groups
DROP POLICY IF EXISTS "Users can view own work_groups" ON work_groups;
DROP POLICY IF EXISTS "Users can insert own work_groups" ON work_groups;
DROP POLICY IF EXISTS "Users can update own work_groups" ON work_groups;
DROP POLICY IF EXISTS "Users can delete own work_groups" ON work_groups;

-- Files
DROP POLICY IF EXISTS "Users can view own files" ON files;
DROP POLICY IF EXISTS "Users can insert own files" ON files;
DROP POLICY IF EXISTS "Users can update own files" ON files;
DROP POLICY IF EXISTS "Users can delete own files" ON files;

-- Reports
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;

-- Automations
DROP POLICY IF EXISTS "Users can view own automations" ON automations;
DROP POLICY IF EXISTS "Users can insert own automations" ON automations;
DROP POLICY IF EXISTS "Users can update own automations" ON automations;
DROP POLICY IF EXISTS "Users can delete own automations" ON automations;

-- Collaborations
DROP POLICY IF EXISTS "Users can view own collaborations" ON collaborations;
DROP POLICY IF EXISTS "Users can insert own collaborations" ON collaborations;
DROP POLICY IF EXISTS "Users can update own collaborations" ON collaborations;
DROP POLICY IF EXISTS "Users can delete own collaborations" ON collaborations;

-- Leads
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON leads;
DROP POLICY IF EXISTS "Users can update own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON leads;

-- Organizational Structure
DROP POLICY IF EXISTS "Users can view own organizational_structure" ON organizational_structure;
DROP POLICY IF EXISTS "Users can insert own organizational_structure" ON organizational_structure;
DROP POLICY IF EXISTS "Users can update own organizational_structure" ON organizational_structure;
DROP POLICY IF EXISTS "Users can delete own organizational_structure" ON organizational_structure;

-- Role Permissions
DROP POLICY IF EXISTS "Users can view own role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Users can insert own role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Users can update own role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Users can delete own role_permissions" ON role_permissions;

-- Company Settings
DROP POLICY IF EXISTS "Users can view own company_settings" ON company_settings;
DROP POLICY IF EXISTS "Users can insert own company_settings" ON company_settings;
DROP POLICY IF EXISTS "Users can update own company_settings" ON company_settings;
DROP POLICY IF EXISTS "Users can delete own company_settings" ON company_settings;

-- WhatsApp Messages
DROP POLICY IF EXISTS "Users can view own whatsapp_messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Users can insert own whatsapp_messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Users can update own whatsapp_messages" ON whatsapp_messages;
DROP POLICY IF EXISTS "Users can delete own whatsapp_messages" ON whatsapp_messages;

-- WhatsApp Connections
DROP POLICY IF EXISTS "Users can view own whatsapp_connections" ON whatsapp_connections;
DROP POLICY IF EXISTS "Users can insert own whatsapp_connections" ON whatsapp_connections;
DROP POLICY IF EXISTS "Users can update own whatsapp_connections" ON whatsapp_connections;
DROP POLICY IF EXISTS "Users can delete own whatsapp_connections" ON whatsapp_connections;

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Feed Posts
DROP POLICY IF EXISTS "Users can view own feed_posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can insert own feed_posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can update own feed_posts" ON feed_posts;
DROP POLICY IF EXISTS "Users can delete own feed_posts" ON feed_posts;

-- Comments
DROP POLICY IF EXISTS "Users can view own comments" ON comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- Company Users
DROP POLICY IF EXISTS "Users can view own company_users" ON company_users;
DROP POLICY IF EXISTS "Users can insert own company_users" ON company_users;
DROP POLICY IF EXISTS "Users can update own company_users" ON company_users;
DROP POLICY IF EXISTS "Users can delete own company_users" ON company_users;

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- =====================================================
-- PARTE 7: CRIAR POLÍTICAS RLS COM OWNER_ID
-- =====================================================

-- ACTIVITIES
CREATE POLICY "Users can view own company activities" ON activities
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company activities" ON activities
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company activities" ON activities
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company activities" ON activities
  FOR DELETE USING (owner_id = get_user_owner_id());

-- CALENDAR_EVENTS
CREATE POLICY "Users can view own company calendar_events" ON calendar_events
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company calendar_events" ON calendar_events
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company calendar_events" ON calendar_events
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company calendar_events" ON calendar_events
  FOR DELETE USING (owner_id = get_user_owner_id());

-- CONTACTS
CREATE POLICY "Users can view own company contacts" ON contacts
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company contacts" ON contacts
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company contacts" ON contacts
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company contacts" ON contacts
  FOR DELETE USING (owner_id = get_user_owner_id());

-- COMPANIES
CREATE POLICY "Users can view own company companies" ON companies
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company companies" ON companies
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company companies" ON companies
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company companies" ON companies
  FOR DELETE USING (owner_id = get_user_owner_id());

-- EMPLOYEES
CREATE POLICY "Users can view own company employees" ON employees
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company employees" ON employees
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company employees" ON employees
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company employees" ON employees
  FOR DELETE USING (owner_id = get_user_owner_id());

-- PRODUCTS
CREATE POLICY "Users can view own company products" ON products
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company products" ON products
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company products" ON products
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company products" ON products
  FOR DELETE USING (owner_id = get_user_owner_id());

-- SUPPLIERS
CREATE POLICY "Users can view own company suppliers" ON suppliers
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company suppliers" ON suppliers
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company suppliers" ON suppliers
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company suppliers" ON suppliers
  FOR DELETE USING (owner_id = get_user_owner_id());

-- INVENTORY
CREATE POLICY "Users can view own company inventory" ON inventory
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company inventory" ON inventory
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company inventory" ON inventory
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company inventory" ON inventory
  FOR DELETE USING (owner_id = get_user_owner_id());

-- WRITEOFFS
CREATE POLICY "Users can view own company writeoffs" ON writeoffs
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company writeoffs" ON writeoffs
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company writeoffs" ON writeoffs
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company writeoffs" ON writeoffs
  FOR DELETE USING (owner_id = get_user_owner_id());

-- SALES_ORDERS
CREATE POLICY "Users can view own company sales_orders" ON sales_orders
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company sales_orders" ON sales_orders
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company sales_orders" ON sales_orders
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company sales_orders" ON sales_orders
  FOR DELETE USING (owner_id = get_user_owner_id());

-- SALES_FUNNEL
CREATE POLICY "Users can view own company sales_funnel" ON sales_funnel
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company sales_funnel" ON sales_funnel
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company sales_funnel" ON sales_funnel
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company sales_funnel" ON sales_funnel
  FOR DELETE USING (owner_id = get_user_owner_id());

-- PROJECTS
CREATE POLICY "Users can view own company projects" ON projects
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company projects" ON projects
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company projects" ON projects
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company projects" ON projects
  FOR DELETE USING (owner_id = get_user_owner_id());

-- WORK_GROUPS
CREATE POLICY "Users can view own company work_groups" ON work_groups
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company work_groups" ON work_groups
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company work_groups" ON work_groups
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company work_groups" ON work_groups
  FOR DELETE USING (owner_id = get_user_owner_id());

-- FILES
CREATE POLICY "Users can view own company files" ON files
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company files" ON files
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company files" ON files
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company files" ON files
  FOR DELETE USING (owner_id = get_user_owner_id());

-- REPORTS
CREATE POLICY "Users can view own company reports" ON reports
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company reports" ON reports
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company reports" ON reports
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company reports" ON reports
  FOR DELETE USING (owner_id = get_user_owner_id());

-- AUTOMATIONS
CREATE POLICY "Users can view own company automations" ON automations
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company automations" ON automations
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company automations" ON automations
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company automations" ON automations
  FOR DELETE USING (owner_id = get_user_owner_id());

-- COLLABORATIONS
CREATE POLICY "Users can view own company collaborations" ON collaborations
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company collaborations" ON collaborations
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company collaborations" ON collaborations
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company collaborations" ON collaborations
  FOR DELETE USING (owner_id = get_user_owner_id());

-- LEADS
CREATE POLICY "Users can view own company leads" ON leads
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company leads" ON leads
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company leads" ON leads
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company leads" ON leads
  FOR DELETE USING (owner_id = get_user_owner_id());

-- ORGANIZATIONAL_STRUCTURE
CREATE POLICY "Users can view own company organizational_structure" ON organizational_structure
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company organizational_structure" ON organizational_structure
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company organizational_structure" ON organizational_structure
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company organizational_structure" ON organizational_structure
  FOR DELETE USING (owner_id = get_user_owner_id());

-- ROLE_PERMISSIONS
CREATE POLICY "Users can view own company role_permissions" ON role_permissions
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company role_permissions" ON role_permissions
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company role_permissions" ON role_permissions
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company role_permissions" ON role_permissions
  FOR DELETE USING (owner_id = get_user_owner_id());

-- COMPANY_SETTINGS
CREATE POLICY "Users can view own company company_settings" ON company_settings
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company company_settings" ON company_settings
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company company_settings" ON company_settings
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company company_settings" ON company_settings
  FOR DELETE USING (owner_id = get_user_owner_id());

-- WHATSAPP_MESSAGES
CREATE POLICY "Users can view own company whatsapp_messages" ON whatsapp_messages
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company whatsapp_messages" ON whatsapp_messages
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company whatsapp_messages" ON whatsapp_messages
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company whatsapp_messages" ON whatsapp_messages
  FOR DELETE USING (owner_id = get_user_owner_id());

-- WHATSAPP_CONNECTIONS
CREATE POLICY "Users can view own company whatsapp_connections" ON whatsapp_connections
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company whatsapp_connections" ON whatsapp_connections
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company whatsapp_connections" ON whatsapp_connections
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company whatsapp_connections" ON whatsapp_connections
  FOR DELETE USING (owner_id = get_user_owner_id());

-- NOTIFICATIONS
CREATE POLICY "Users can view own company notifications" ON notifications
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company notifications" ON notifications
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company notifications" ON notifications
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company notifications" ON notifications
  FOR DELETE USING (owner_id = get_user_owner_id());

-- FEED_POSTS
CREATE POLICY "Users can view own company feed_posts" ON feed_posts
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company feed_posts" ON feed_posts
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company feed_posts" ON feed_posts
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company feed_posts" ON feed_posts
  FOR DELETE USING (owner_id = get_user_owner_id());

-- COMMENTS
CREATE POLICY "Users can view own company comments" ON comments
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can insert own company comments" ON comments
  FOR INSERT WITH CHECK (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own company comments" ON comments
  FOR UPDATE USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can delete own company comments" ON comments
  FOR DELETE USING (owner_id = get_user_owner_id());

-- COMPANY_USERS
CREATE POLICY "Users can view own company company_users" ON company_users
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Admins can insert company_users" ON company_users
  FOR INSERT WITH CHECK (
    owner_id = get_user_owner_id() AND
    EXISTS (SELECT 1 FROM company_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND role = 'admin')
  );
CREATE POLICY "Admins can update company_users" ON company_users
  FOR UPDATE USING (
    owner_id = get_user_owner_id() AND
    EXISTS (SELECT 1 FROM company_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND role = 'admin')
  );
CREATE POLICY "Admins can delete company_users" ON company_users
  FOR DELETE USING (
    owner_id = get_user_owner_id() AND
    EXISTS (SELECT 1 FROM company_users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND role = 'admin')
  );

-- PROFILES
CREATE POLICY "Users can view own company profiles" ON profiles
  FOR SELECT USING (owner_id = get_user_owner_id());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

COMMIT;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
  '✅ Script executado com sucesso!' as resultado,
  'Todas as tabelas agora têm owner_id e RLS ativo' as detalhes;

-- Verificar tabelas com RLS ativo
SELECT 
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS ATIVO' ELSE '❌ RLS INATIVO' END as status_rls
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

