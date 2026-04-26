// Type definitions for new features

// ============================================
// Notification Types
// ============================================

export type NotificationType = 'deadline' | 'payment' | 'payroll' | 'system';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface Notification {
  id: number;
  company_id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  is_read: boolean;
  dismissed_at: string | null;
  created_at: string;
}

// ============================================
// Audit Log Types
// ============================================

export type AuditAction = 'create' | 'update' | 'delete' | 'export' | 'import' | 'login' | 'logout';
export type AuditEntityType = 'employee' | 'vendor' | 'payment' | 'payroll' | 'document' | 'task' | 'report' | 'user';

export interface AuditLog {
  id: number;
  company_id: string;
  user_id: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

// ============================================
// Task Types
// ============================================

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskCategory = 'onboarding' | 'compliance' | 'payment' | 'general';
export type LinkedEntityType = 'employee' | 'vendor' | 'other';

export interface Task {
  id: number;
  company_id: string;
  assigned_to: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  linked_entity_type: LinkedEntityType | null;
  linked_entity_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: number;
  task_id: number;
  user_id: string;
  comment: string;
  created_at: string;
}

// ============================================
// Document Types
// ============================================

export type DocumentType = 'W-9' | 'contract' | 'invoice' | 'receipt' | 'other';
export type DocumentCategory = 'employee' | 'vendor' | 'general';

export interface Document {
  id: number;
  company_id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  linked_entity_type: LinkedEntityType | null;
  linked_entity_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Backup Types
// ============================================

export type BackupType = 'full' | 'partial' | 'export';

export interface Backup {
  id: number;
  company_id: string;
  backup_name: string;
  backup_type: BackupType;
  file_url: string | null;
  entity_types: string[];
  date_range_start: string | null;
  date_range_end: string | null;
  created_by: string | null;
  created_at: string;
}

// ============================================
// Dashboard Config Types
// ============================================

export interface DashboardWidget {
  id: string;
  type: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
}

export interface DashboardConfig {
  id: number;
  company_id: string;
  user_id: string;
  config_name: string;
  widgets: DashboardWidget[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// User Role Types
// ============================================

export type UserRole = 'Global Admin' | 'Manager' | 'Accountant' | 'Viewer';

export interface UserRoleAssignment {
  id: number;
  user_id: string;
  company_id: string;
  role: UserRole;
  assigned_by: string | null;
  assigned_at: string;
}

// ============================================
// Report Template Types
// ============================================

export type ReportTemplateCategory = 'employee' | 'vendor' | 'payroll' | 'general';

export interface ReportTemplate {
  id: number;
  company_id: string;
  created_by: string;
  name: string;
  description: string | null;
  fields: string[];
  filters: Record<string, any>;
  sorting: Record<string, any>;
  category: ReportTemplateCategory;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Tax Calculation Types
// ============================================

export type TaxCalculationType = 'FUTA' | 'SUTA' | 'withholding' | 'projection';

export interface TaxCalculation {
  id: number;
  company_id: string;
  user_id: string;
  calculation_type: TaxCalculationType;
  year: string | null;
  state: string | null;
  input_data: Record<string, any>;
  result_data: Record<string, any>;
  created_at: string;
}

// ============================================
// State Tax Rate Types
// ============================================

export type StateTaxType = 'income' | 'unemployment' | 'disability';

export interface StateTaxRate {
  id: number;
  state: string;
  tax_type: StateTaxType;
  rate: number;
  wage_base: number | null;
  effective_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Vendor Rating Types
// ============================================

export interface VendorRating {
  id: number;
  company_id: string;
  vendor_id: string;
  rated_by: string;
  quality_rating: number;
  timeliness_rating: number;
  communication_rating: number;
  cost_rating: number;
  comments: string | null;
  created_at: string;
}
