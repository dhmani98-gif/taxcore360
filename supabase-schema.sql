-- ============================================
-- TaxCore360 Database Schema for Supabase
-- ============================================

-- WARNING: This will DROP all existing tables and recreate them
-- Only use for initial setup or development reset

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS vendor_ratings CASCADE;
DROP TABLE IF EXISTS state_tax_rates CASCADE;
DROP TABLE IF EXISTS tax_calculations CASCADE;
DROP TABLE IF EXISTS report_templates CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS dashboard_configs CASCADE;
DROP TABLE IF EXISTS backups CASCADE;
DROP TABLE IF EXISTS task_comments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS filing_lifecycle CASCADE;
DROP TABLE IF EXISTS compliance_log CASCADE;
DROP TABLE IF EXISTS w9_submissions CASCADE;
DROP TABLE IF EXISTS w9_invites CASCADE;
DROP TABLE IF EXISTS invoice_history CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS form_1099 CASCADE;
DROP TABLE IF EXISTS w3_summaries CASCADE;
DROP TABLE IF EXISTS w2_forms CASCADE;
DROP TABLE IF EXISTS vendor_payments CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS payroll_payments CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Authentication and Permissions Tables
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('Global Admin', 'Manager', 'Accountant', 'Viewer')),
  company_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('Global Admin', 'Manager', 'Accountant', 'Viewer')),
  resource TEXT NOT NULL CHECK (resource IN ('employees', 'vendors', 'payments', 'reports', 'settings', 'payroll', 'w2', '1099')),
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT true,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  UNIQUE(role, resource)
);

-- Companies table (for multi-company support)
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT,
  ein TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Employees and Payroll Tables
-- ============================================

-- Employees table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  ssn TEXT, -- Should be encrypted at application level
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  department TEXT CHECK (department IN ('Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 'Legal', 'Other')),
  job_title TEXT,
  hire_date DATE,
  gross_pay DECIMAL(10,2) CHECK (gross_pay >= 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payroll payments table
CREATE TABLE payroll_payments (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES companies(id),
  pay_period TEXT NOT NULL, -- Format: YYYY-MM
  payment_date DATE,
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Bank Transfer', 'Check')),
  federal_withholding DECIMAL(10,2) DEFAULT 0 CHECK (federal_withholding >= 0),
  social_security DECIMAL(10,2) DEFAULT 0 CHECK (social_security >= 0),
  medicare DECIMAL(10,2) DEFAULT 0 CHECK (medicare >= 0),
  state_tax DECIMAL(10,2) DEFAULT 0 CHECK (state_tax >= 0),
  pretax_deductions DECIMAL(10,2) DEFAULT 0 CHECK (pretax_deductions >= 0),
  net_pay DECIMAL(10,2) CHECK (net_pay >= 0),
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Vendors and Payments Tables
-- ============================================

-- Vendors table
CREATE TABLE vendors (
  vendor_id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  legal_name TEXT NOT NULL,
  address TEXT,
  zip_code TEXT,
  email TEXT,
  phone TEXT,
  state TEXT,
  category TEXT CHECK (category IN ('Consulting', 'Design', 'Development', 'Legal', 'Marketing', 'Operations')),
  tax_id_type TEXT CHECK (tax_id_type IN ('EIN', 'SSN')),
  tax_id TEXT, -- Should be encrypted at application level
  entity_type TEXT CHECK (entity_type IN ('Individual', 'LLC', 'Corporation', 'Partnership')),
  tin_verification TEXT DEFAULT 'Unverified' CHECK (tin_verification IN ('Unverified', 'Verified', 'Invalid')),
  onboarding_source TEXT,
  w9_request_status TEXT DEFAULT 'Not Requested' CHECK (w9_request_status IN ('Not Requested', 'Pending', 'Completed', 'Expired')),
  average_rating DECIMAL(2,1) CHECK (average_rating BETWEEN 1 AND 5),
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendor payments table
CREATE TABLE vendor_payments (
  id SERIAL PRIMARY KEY,
  vendor_id TEXT REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  company_id TEXT REFERENCES companies(id),
  payment_date DATE NOT NULL,
  invoice_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  payment_state TEXT NOT NULL,
  state_withholding DECIMAL(10,2) DEFAULT 0 CHECK (state_withholding >= 0),
  year TEXT NOT NULL, -- Format: YYYY
  quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
  attachment_name TEXT,
  attachment_url TEXT,
  ocr_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Tax Forms Tables (W-2, W-3, 1099)
-- ============================================

-- W-2 Forms table
CREATE TABLE w2_forms (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  company_id TEXT REFERENCES companies(id),
  year TEXT NOT NULL, -- Format: YYYY
  wages DECIMAL(10,2) DEFAULT 0 CHECK (wages >= 0),
  federal_income_tax DECIMAL(10,2) DEFAULT 0 CHECK (federal_income_tax >= 0),
  social_security_tax DECIMAL(10,2) DEFAULT 0 CHECK (social_security_tax >= 0),
  medicare_tax DECIMAL(10,2) DEFAULT 0 CHECK (medicare_tax >= 0),
  state_wages DECIMAL(10,2) DEFAULT 0 CHECK (state_wages >= 0),
  state_income_tax DECIMAL(10,2) DEFAULT 0 CHECK (state_income_tax >= 0),
  filing_status TEXT DEFAULT 'Draft' CHECK (filing_status IN ('Draft', 'Ready', 'Filed', 'Error')),
  signature_data JSONB,
  signed_at TIMESTAMP,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- W-3 Summary table
CREATE TABLE w3_summaries (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  year TEXT NOT NULL UNIQUE, -- Format: YYYY
  total_forms INTEGER DEFAULT 0 CHECK (total_forms >= 0),
  total_wages DECIMAL(10,2) DEFAULT 0 CHECK (total_wages >= 0),
  total_federal_tax DECIMAL(10,2) DEFAULT 0 CHECK (total_federal_tax >= 0),
  total_social_security DECIMAL(10,2) DEFAULT 0 CHECK (total_social_security >= 0),
  total_medicare DECIMAL(10,2) DEFAULT 0 CHECK (total_medicare >= 0),
  signature_data JSONB,
  signed_at TIMESTAMP,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1099 Forms table
CREATE TABLE form_1099 (
  id SERIAL PRIMARY KEY,
  vendor_id TEXT REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  company_id TEXT REFERENCES companies(id),
  year TEXT NOT NULL, -- Format: YYYY
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  filing_status TEXT DEFAULT 'Draft' CHECK (filing_status IN ('Draft', 'Ready', 'Filed', 'Error')),
  signature_data JSONB,
  signed_at TIMESTAMP,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Settings and Subscriptions Tables
-- ============================================

-- Company settings table
CREATE TABLE company_settings (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id) UNIQUE,
  employer_profile JSONB DEFAULT '{}',
  subscription_settings JSONB DEFAULT '{}',
  payment_method_settings JSONB DEFAULT '{}',
  communication_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  plan TEXT NOT NULL CHECK (plan IN ('Pay Per Form', 'Professional', 'Enterprise')),
  monthly_price DECIMAL(10,2) NOT NULL CHECK (monthly_price >= 0),
  billing_cycle TEXT DEFAULT 'Monthly' CHECK (billing_cycle IN ('Per Filing', 'Monthly', 'Annual')),
  status TEXT DEFAULT 'active' CHECK (status IN ('Trial', 'Active', 'Past Due', 'Canceled')),
  next_billing_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice history table
CREATE TABLE invoice_history (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_date DATE,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Additional Supporting Tables
-- ============================================

-- W-9 Invites table
CREATE TABLE w9_invites (
  id TEXT PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  vendor_id TEXT REFERENCES vendors(vendor_id),
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- W-9 Submissions table
CREATE TABLE w9_submissions (
  id TEXT PRIMARY KEY,
  invite_token TEXT REFERENCES w9_invites(token),
  company_id TEXT REFERENCES companies(id),
  legal_name TEXT,
  email TEXT,
  address TEXT,
  state TEXT,
  tax_id_type TEXT,
  tax_id TEXT,
  entity_type TEXT,
  e_signed BOOLEAN DEFAULT false,
  signature_date TIMESTAMP,
  submitted_at TIMESTAMP,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'))
);

-- Compliance log table
CREATE TABLE compliance_log (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  vendor_id TEXT REFERENCES vendors(vendor_id),
  message_type TEXT,
  message_content TEXT,
  status TEXT,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Filing lifecycle table
CREATE TABLE filing_lifecycle (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  year TEXT,
  vendor_id TEXT REFERENCES vendors(vendor_id),
  form_type TEXT CHECK (form_type IN ('W-2', '1099', '941')),
  status TEXT DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'Draft', 'Ready', 'Submitted', 'Accepted', 'Rejected')),
  due_date DATE,
  filed_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- New Features Tables
-- ============================================

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('deadline', 'payment', 'payroll', 'system')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'export', 'import', 'login', 'logout')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('employee', 'vendor', 'payment', 'payroll', 'document', 'task', 'report', 'user')),
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  assigned_to UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  category TEXT CHECK (category IN ('onboarding', 'compliance', 'payment', 'general')),
  linked_entity_type TEXT CHECK (linked_entity_type IN ('employee', 'vendor', 'other')),
  linked_entity_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Task comments table
CREATE TABLE task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents table (metadata)
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('W-9', 'contract', 'invoice', 'receipt', 'other')),
  category TEXT CHECK (category IN ('employee', 'vendor', 'general')),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  linked_entity_type TEXT CHECK (linked_entity_type IN ('employee', 'vendor', 'other')),
  linked_entity_id TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Backups table
CREATE TABLE backups (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  backup_name TEXT NOT NULL,
  backup_type TEXT CHECK (backup_type IN ('full', 'partial', 'export')),
  file_url TEXT,
  entity_types TEXT[],
  date_range_start DATE,
  date_range_end DATE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard configs table
CREATE TABLE dashboard_configs (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  user_id UUID REFERENCES profiles(id),
  config_name TEXT NOT NULL,
  widgets JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User roles table (extends permissions)
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  company_id TEXT REFERENCES companies(id),
  role TEXT NOT NULL CHECK (role IN ('Global Admin', 'Manager', 'Accountant', 'Viewer')),
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Report templates table
CREATE TABLE report_templates (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  created_by UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  fields JSONB DEFAULT '[]',
  filters JSONB DEFAULT '{}',
  sorting JSONB DEFAULT '{}',
  category TEXT CHECK (category IN ('employee', 'vendor', 'payroll', 'general')),
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tax calculations table
CREATE TABLE tax_calculations (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  user_id UUID REFERENCES profiles(id),
  calculation_type TEXT CHECK (calculation_type IN ('FUTA', 'SUTA', 'withholding', 'projection')),
  year TEXT,
  state TEXT,
  input_data JSONB DEFAULT '{}',
  result_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- State tax rates table (reference data)
CREATE TABLE state_tax_rates (
  id SERIAL PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  tax_type TEXT NOT NULL CHECK (tax_type IN ('income', 'unemployment', 'disability')),
  rate DECIMAL(5,4) NOT NULL,
  wage_base DECIMAL(10,2),
  effective_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vendor ratings table
CREATE TABLE vendor_ratings (
  id SERIAL PRIMARY KEY,
  company_id TEXT REFERENCES companies(id),
  vendor_id TEXT REFERENCES vendors(vendor_id),
  rated_by UUID REFERENCES profiles(id),
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  cost_rating INTEGER CHECK (cost_rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Employees indexes
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_department ON employees(department);

-- Vendors indexes
CREATE INDEX idx_vendors_company ON vendors(company_id);
CREATE INDEX idx_vendors_status ON vendors(w9_request_status);

-- Vendor payments indexes
CREATE INDEX idx_vendor_payments_vendor ON vendor_payments(vendor_id);
CREATE INDEX idx_vendor_payments_company ON vendor_payments(company_id);
CREATE INDEX idx_vendor_payments_year ON vendor_payments(year);

-- W-2 Forms indexes
CREATE INDEX idx_w2_forms_employee ON w2_forms(employee_id);
CREATE INDEX idx_w2_forms_company ON w2_forms(company_id);
CREATE INDEX idx_w2_forms_year ON w2_forms(year);

-- 1099 Forms indexes
CREATE INDEX idx_form_1099_vendor ON form_1099(vendor_id);
CREATE INDEX idx_form_1099_company ON form_1099(company_id);
CREATE INDEX idx_form_1099_year ON form_1099(year);

-- New features indexes
CREATE INDEX idx_notifications_company ON notifications(company_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

CREATE INDEX idx_tasks_company ON tasks(company_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due ON tasks(due_date);

CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_task_comments_user ON task_comments(user_id);

CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_entity ON documents(linked_entity_type, linked_entity_id);

CREATE INDEX idx_backups_company ON backups(company_id);
CREATE INDEX idx_backups_created ON backups(created_at);

CREATE INDEX idx_dashboard_configs_company ON dashboard_configs(company_id);
CREATE INDEX idx_dashboard_configs_user ON dashboard_configs(user_id);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_company ON user_roles(company_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

CREATE INDEX idx_report_templates_company ON report_templates(company_id);
CREATE INDEX idx_report_templates_created ON report_templates(created_by);
CREATE INDEX idx_report_templates_category ON report_templates(category);

CREATE INDEX idx_tax_calculations_company ON tax_calculations(company_id);
CREATE INDEX idx_tax_calculations_user ON tax_calculations(user_id);
CREATE INDEX idx_tax_calculations_type ON tax_calculations(calculation_type);
CREATE INDEX idx_tax_calculations_year ON tax_calculations(year);

CREATE INDEX idx_state_tax_rates_state ON state_tax_rates(state);
CREATE INDEX idx_state_tax_rates_type ON state_tax_rates(tax_type);

CREATE INDEX idx_vendor_ratings_company ON vendor_ratings(company_id);
CREATE INDEX idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);
CREATE INDEX idx_vendor_ratings_rated_by ON vendor_ratings(rated_by);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE w2_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE w3_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_1099 ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE w9_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE w9_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE filing_lifecycle ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_ratings ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be refined based on permissions system)

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Global admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Global Admin'
    )
  );

-- Companies: Users can view their own company
CREATE POLICY "Users can view own company" ON companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = companies.id
    )
  );

-- Employees: Users can view employees in their company
CREATE POLICY "Users can view company employees" ON employees
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = employees.company_id
    )
  );

-- Vendors: Users can view vendors in their company
CREATE POLICY "Users can view company vendors" ON vendors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = vendors.company_id
    )
  );

-- More policies will be added based on the permissions system implementation

-- RLS policies for new tables

-- Notifications: Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Audit logs: Users can view audit logs for their company
CREATE POLICY "Users can view company audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = audit_logs.company_id
    )
  );

-- Tasks: Users can view tasks in their company
CREATE POLICY "Users can view company tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = tasks.company_id
    )
  );

CREATE POLICY "Users can insert company tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = tasks.company_id
    )
  );

CREATE POLICY "Users can update company tasks" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = tasks.company_id
    )
  );

-- Task comments: Users can view comments for tasks in their company
CREATE POLICY "Users can view task comments" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN profiles p ON p.id = auth.uid()
      WHERE t.id = task_comments.task_id AND p.company_id = t.company_id
    )
  );

CREATE POLICY "Users can insert task comments" ON task_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Documents: Users can view documents in their company
CREATE POLICY "Users can view company documents" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = documents.company_id
    )
  );

CREATE POLICY "Users can insert company documents" ON documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = documents.company_id
    )
  );

-- Backups: Users can view backups in their company
CREATE POLICY "Users can view company backups" ON backups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = backups.company_id
    )
  );

-- Dashboard configs: Users can view their own configs
CREATE POLICY "Users can view own dashboard configs" ON dashboard_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dashboard configs" ON dashboard_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard configs" ON dashboard_configs
  FOR UPDATE USING (auth.uid() = user_id);

-- User roles: Users can view roles in their company
CREATE POLICY "Users can view company user roles" ON user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = user_roles.company_id
    )
  );

-- Report templates: Users can view templates in their company
CREATE POLICY "Users can view company report templates" ON report_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = report_templates.company_id
    )
  );

CREATE POLICY "Users can insert company report templates" ON report_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = report_templates.company_id
    )
  );

CREATE POLICY "Users can update own report templates" ON report_templates
  FOR UPDATE USING (created_by = auth.uid());

-- Tax calculations: Users can view their own calculations
CREATE POLICY "Users can view own tax calculations" ON tax_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tax calculations" ON tax_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- State tax rates: Read-only reference data
CREATE POLICY "All users can view state tax rates" ON state_tax_rates
  FOR SELECT USING (true);

-- Vendor ratings: Users can view ratings in their company
CREATE POLICY "Users can view company vendor ratings" ON vendor_ratings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = vendor_ratings.company_id
    )
  );

CREATE POLICY "Users can insert vendor ratings" ON vendor_ratings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND company_id = vendor_ratings.company_id
    )
  );

-- ============================================
-- Trigger for updated_at timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_payments_updated_at BEFORE UPDATE ON payroll_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_payments_updated_at BEFORE UPDATE ON vendor_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_w2_forms_updated_at BEFORE UPDATE ON w2_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_w3_summaries_updated_at BEFORE UPDATE ON w3_summaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_1099_updated_at BEFORE UPDATE ON form_1099
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_filing_lifecycle_updated_at BEFORE UPDATE ON filing_lifecycle
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add triggers to new tables with updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_configs_updated_at BEFORE UPDATE ON dashboard_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_state_tax_rates_updated_at BEFORE UPDATE ON state_tax_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger for updating vendor average ratings
-- ============================================

CREATE OR REPLACE FUNCTION update_vendor_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vendors
  SET average_rating = (
    SELECT ROUND(AVG(
      (quality_rating + timeliness_rating + communication_rating + cost_rating) / 4.0
    ), 1)
    FROM vendor_ratings
    WHERE vendor_id = NEW.vendor_id
  ),
  rating_count = (
    SELECT COUNT(*)
    FROM vendor_ratings
    WHERE vendor_id = NEW.vendor_id
  )
  WHERE vendor_id = NEW.vendor_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_rating_on_insert
  AFTER INSERT ON vendor_ratings
  FOR EACH ROW EXECUTE FUNCTION update_vendor_average_rating();

CREATE TRIGGER update_vendor_rating_on_update
  AFTER UPDATE ON vendor_ratings
  FOR EACH ROW EXECUTE FUNCTION update_vendor_average_rating();

CREATE TRIGGER update_vendor_rating_on_delete
  AFTER DELETE ON vendor_ratings
  FOR EACH ROW EXECUTE FUNCTION update_vendor_average_rating();
