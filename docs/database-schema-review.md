# Database Schema Review - TaxCore360

## Current Tables Overview

### 1. `employees`
**Purpose:** Store employee information for payroll and W-2 generation

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | Auto-generated |
| company_id | uuid (FK) | Links to companies table |
| employee_id | string | Internal employee identifier |
| first_name | string | |
| last_name | string | |
| email | string | |
| ssn | string | Encrypted/Hashed recommended |
| department | string | |
| job_title | string | |
| hire_date | date | |
| gross_pay | numeric | |
| address | string | |
| city | string | |
| state | string | 2-letter code |
| zip | string | |
| status | enum | 'Active' \| 'Inactive' \| 'On Leave' |
| created_at | timestamp | |
| updated_at | timestamp | |

**Proposed Additions:**
- `date_of_birth` (date) - For age verification and benefits
- `termination_date` (date, nullable) - Track when employee left
- `payment_method` (enum) - 'Direct Deposit' | 'Check' | 'Wire'
- `bank_account_info` (encrypted json) - For direct deposit (encrypted)
- `benefits_enrolled` (jsonb) - Health, 401k, etc.

---

### 2. `vendors`
**Purpose:** Store vendor information for 1099-NEC reporting

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | Auto-generated |
| company_id | uuid (FK) | Links to companies table |
| vendor_id | string | Internal vendor identifier (e.g., V-1001) |
| legal_name | string | |
| email | string | |
| tax_id_type | enum | 'SSN' \| 'EIN' |
| tax_id | string | Encrypted recommended |
| entity_type | enum | 'Individual' \| 'Partnership' \| 'Corporation' \| 'LLC' |
| state | string | 2-letter code |
| zip | string | |
| address | string | |
| category | enum | 'Consulting' \| 'Professional Services' \| 'Contractor' \| 'Other' |
| tin_verification_status | enum | 'Pending' \| 'Verified' \| 'Failed' |
| w9_status | enum | 'Not Requested' \| 'Requested' \| 'Received' \| 'Expired' |
| created_at | timestamp | |
| updated_at | timestamp | |

**Proposed Additions:**
- `phone` (string) - Contact phone number
- `contact_person` (string) - Primary contact name
- `payment_terms` (enum) - 'Net 30' | 'Net 15' | 'Due on Receipt'
- `preferred_payment_method` (enum) - 'Check' | 'ACH' | 'Wire'
- `bank_routing_number` (encrypted) - For ACH payments
- `bank_account_number` (encrypted) - For ACH payments
- `is_active` (boolean) - Soft delete support

---

### 3. `vendor_payments`
**Purpose:** Track payments made to vendors for 1099-NEC threshold calculation

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | Auto-generated |
| company_id | uuid (FK) | Links to companies table |
| vendor_id | uuid (FK) | Links to vendors table |
| payment_date | date | |
| invoice_number | string | |
| amount | numeric | |
| payment_state | string | State where payment was made |
| invoice_document_url | string | Path in storage |
| ocr_text | text | Extracted text from invoice |
| created_at | timestamp | |
| updated_at | timestamp | |

**Proposed Additions:**
- `fiscal_year` (integer) - For easier 1099 reporting queries
- `quarter` (enum) - 'Q1' | 'Q2' | 'Q3' | 'Q4'
- `payment_method` (enum) - 'Check' | 'ACH' | 'Wire' | 'Card'
- `check_number` (string, nullable) - For check payments
- `is_1099_reportable` (boolean) - Whether included in 1099
- `notes` (text) - Additional notes
- `created_by` (uuid) - User who recorded payment

---

### 4. `payroll_payments`
**Purpose:** Store payroll payment records for W-2 generation

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | Auto-generated |
| company_id | uuid (FK) | Links to companies table |
| employee_id | uuid (FK) | Links to employees table |
| payroll_month | string | Format: YYYY-MM |
| gross_pay | numeric | |
| federal_tax | numeric | Federal withholding |
| state_tax | numeric | State withholding |
| social_security | numeric | SS withholding |
| medicare | numeric | Medicare withholding |
| net_pay | numeric | |
| payment_method | enum | 'Direct Deposit' \| 'Check' \| 'Wire' |
| status | enum | 'Pending' \| 'Processed' \| 'Paid' |
| pay_date | date | Actual payment date |
| created_at | timestamp | |
| updated_at | timestamp | |

**Proposed Additions:**
- `local_tax` (numeric) - Local/city tax withholding
- `pre_tax_deductions` (jsonb) - 401k, health insurance, etc.
- `post_tax_deductions` (jsonb) - Garnishments, etc.
- `overtime_hours` (numeric) - Track OT separately
- `regular_hours` (numeric) - Regular hours worked
- `overtime_pay` (numeric) - OT pay amount
- `bonus` (numeric) - Bonus payments
- `reimbursements` (numeric) - Expense reimbursements

---

### 5. `tasks`
**Purpose:** Task management for compliance and operations

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| id | integer (PK) | Auto-increment |
| company_id | uuid (FK) | |
| title | string | |
| description | text | |
| category | enum | 'Compliance' \| 'Review' \| 'Filing' \| 'Other' |
| priority | enum | 'Low' \| 'Medium' \| 'High' \| 'Urgent' |
| status | enum | 'Open' \| 'In Progress' \| 'Completed' \| 'Cancelled' |
| due_date | date | |
| assigned_to | uuid | Links to users |
| created_at | timestamp | |
| updated_at | timestamp | |

**Proposed Additions:**
- `created_by` (uuid) - Who created the task
- `completed_at` (timestamp) - When completed
- `related_entity_type` (enum) - 'Employee' | 'Vendor' | 'Payment' | 'None'
- `related_entity_id` (string) - ID of related entity
- `reminder_date` (date) - Reminder notification date
- `tags` (text[]) - Array of tags

---

### 6. `task_comments`
**Purpose:** Comments on tasks

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| id | integer (PK) | |
| task_id | integer (FK) | |
| user_id | uuid | |
| comment | text | |
| created_at | timestamp | |

**Proposed Additions:**
- `updated_at` (timestamp) - For edit tracking
- `is_edited` (boolean) - Flag if comment was edited

---

### 7. `documents`
**Purpose:** Document metadata and storage tracking

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| id | integer (PK) | |
| company_id | uuid (FK) | |
| name | string | |
| type | enum | 'PDF' \| 'Image' \| 'Spreadsheet' \| 'Other' |
| category | enum | 'Invoice' \| 'Contract' \| 'W2' \| '1099' \| 'W9' \| 'Other' |
| file_path | string | Storage path |
| file_size | integer | Bytes |
| mime_type | string | |
| linked_entity_type | string | 'Employee' \| 'Vendor' \| 'Payment' etc. |
| linked_entity_id | string | |
| uploaded_by | uuid | User ID |
| created_at | timestamp | |

**Proposed Additions:**
- `updated_at` (timestamp) - Track modifications
- `version` (integer) - Document versioning
- `tags` (text[]) - Searchable tags
- `ocr_text` (text) - Full text search content
- `is_encrypted` (boolean) - Encryption flag
- `retention_until` (date) - Auto-delete date for compliance

---

### 8. `dashboard_configs`
**Purpose:** User dashboard customization

**Fields:**
| Field | Type | Notes |
|-------|------|-------|
| id | integer (PK) | |
| company_id | uuid (FK) | |
| user_id | uuid (FK) | |
| config_name | string | |
| widgets | jsonb | Widget configuration |
| is_default | boolean | |
| created_at | timestamp | |

---

### 9. `companies` (Inferred)
**Purpose:** Company/organization records

**Current Fields (based on context):**
| Field | Type | Notes |
|-------|------|-------|
| id | uuid (PK) | |
| name | string | Legal name |
| ein | string | Tax ID |
| address | jsonb | Full address |
| created_at | timestamp | |
| updated_at | timestamp | |

**Proposed Additions:**
- `industry` (enum) - For industry-specific compliance
- `fiscal_year_end` (date) - For reporting periods
- `is_active` (boolean) - Soft delete
- `subscription_plan` (enum) - 'Pay Per Form' | 'Professional' | 'Enterprise'
- `subscription_status` (enum) - 'Active' | 'Expired' | 'Cancelled'
- `rls_enabled` (boolean) - Row Level Security enabled

---

## Recommended RLS Policies

### Current State Analysis
Based on the services, all queries filter by `company_id`. RLS should be implemented to ensure users only see their company's data.

### Proposed RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;

-- Company isolation policy (applies to all tables)
CREATE POLICY company_isolation ON employees
  FOR ALL
  USING (company_id IN (
    SELECT company_id FROM user_companies WHERE user_id = auth.uid()
  ));

-- Similar policies for other tables...
```

### Junction Table for Multi-Company Access
```sql
CREATE TABLE user_companies (
  user_id uuid REFERENCES auth.users,
  company_id uuid REFERENCES companies,
  role enum ('Admin', 'Manager', 'Viewer'),
  created_at timestamp DEFAULT now(),
  PRIMARY KEY (user_id, company_id)
);
```

---

## Missing Tables to Consider

### 1. `users` (Auth extension)
Extend Supabase auth with additional user profile data:
```sql
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  full_name string,
  phone string,
  timezone string DEFAULT 'America/New_York',
  notification_preferences jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### 2. `tax_forms_generated`
Track generated tax forms:
```sql
CREATE TABLE tax_forms_generated (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies,
  form_type enum ('W2', 'W3', '1099NEC', '1099MISC'),
  tax_year integer,
  entity_id uuid, -- Employee or Vendor ID
  file_path string,
  filed_with_irs boolean DEFAULT false,
  filed_date date,
  created_at timestamp DEFAULT now()
);
```

### 3. `audit_logs`
Compliance audit trail:
```sql
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies,
  user_id uuid,
  action string, -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
  table_name string,
  record_id string,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamp DEFAULT now()
);
```

### 4. `tax_deadlines`
Track tax filing deadlines:
```sql
CREATE TABLE tax_deadlines (
  id uuid PRIMARY KEY,
  company_id uuid REFERENCES companies,
  form_type string,
  deadline_date date,
  description text,
  is_recurring boolean,
  reminder_days integer[], -- Days before to send reminders
  created_at timestamp DEFAULT now()
);
```

### 5. `w2_data`
Separate W-2 specific data from payroll:
```sql
CREATE TABLE w2_data (
  id uuid PRIMARY KEY,
  company_id uuid,
  employee_id uuid,
  tax_year integer,
  box_1_wages numeric,
  box_2_federal_tax numeric,
  box_3_ss_wages numeric,
  box_4_ss_tax numeric,
  box_5_medicare_wages numeric,
  box_6_medicare_tax numeric,
  -- Additional boxes as needed
  created_at timestamp,
  updated_at timestamp
);
```

---

## Indexes Recommendations

```sql
-- Performance indexes for common queries
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_dept ON employees(department);

CREATE INDEX idx_vendors_company ON vendors(company_id);
CREATE INDEX idx_vendors_category ON vendors(category);

CREATE INDEX idx_payments_company_date ON vendor_payments(company_id, payment_date);
CREATE INDEX idx_payments_vendor ON vendor_payments(vendor_id);

CREATE INDEX idx_payroll_company_month ON payroll_payments(company_id, payroll_month);
CREATE INDEX idx_payroll_employee ON payroll_payments(employee_id);

CREATE INDEX idx_tasks_company_status ON tasks(company_id, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

---

## Data Retention & Compliance

### Suggested Retention Policies:
- **Tax Forms:** 7 years (IRS requirement)
- **Payroll Records:** 7 years
- **Audit Logs:** 10 years
- **General Documents:** 7 years after entity deletion

### Soft Delete Pattern:
Add `deleted_at` timestamp to all tables instead of hard deletes for compliance audit trails.
