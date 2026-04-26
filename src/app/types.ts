export type CardVariant = "default" | "accent" | "dark";
export type ViewMode = "executive" | "employee" | "payroll" | "reports" | "w2" | "portal" | "subscriptions" | "settings" | "tasks" | "documents";
export type W2Section = "form" | "summary";
export type PortalSection = "dashboard" | "vendors" | "payments" | "form" | "w9" | "vault" | "communications";
export type AuthScreenType = "welcome" | "signin" | "register" | "forgot" | "mfa";
export type EmployeeStatus = "Active" | "Inactive";
export type PaymentMethod = "Cash" | "Bank Transfer" | "Check";
export type ReportFocus =
  | "employee_count"
  | "paid_months"
  | "employee_statement"
  | "w2_transmittal"
  | "form_1099_compliance"
  | "tax_reconciliation";
export type ReportDocumentType = "statement" | "report";
export type TaxIdType = "EIN" | "SSN";
export type VendorEntityType = "Individual" | "LLC" | "Corporation" | "Partnership";
export type VendorCategory = "Consulting" | "Design" | "Development" | "Legal" | "Marketing" | "Operations";
export type TinVerificationStatus = "Unverified" | "Verified" | "Invalid";
export type FilingLifecycleStatus = "Not Started" | "Draft" | "Submitted" | "Accepted" | "Rejected";
export type CommunicationChannel = "Email" | "SMS";
export type SubscriptionPlan = "Pay Per Form" | "Professional" | "Enterprise";
export type SubscriptionStatus = "Trial" | "Active" | "Past Due" | "Canceled";
export type BillingCycle = "Per Filing" | "Monthly" | "Annual";

export type QuickBooksSyncState = {
  connected: boolean;
  companyName: string;
  realmId: string;
  lastSyncAt: string;
  vendorsSynced: number;
  paymentsSynced: number;
};

export type AuthUser = {
  name: string;
  email: string;
  role: string;
};

export type AppUserRecord = {
  name: string;
  email: string;
  password: string;
  role: string;
  status: "Active" | "Suspended";
  lastLogin?: string;
};

export type UserDirectoryRecord = {
  name: string;
  email: string;
  role: string;
  status: "Active" | "Suspended";
};

export type UserAdminForm = {
  name: string;
  email: string;
  role: string;
  password?: string;
};

export type EmployeeRow = {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  department: string;
  jobTitle: string;
  hireDate: string;
  grossPay: number;
  status: EmployeeStatus;
};

export type PayrollRow = {
  id: number;
  employee: string;
  department: string;
  payPeriod: string;
  grossPay: string;
  federalWithholding: string;
  socialSecurity: string;
  medicare: string;
  stateTax: string;
  pretaxDeductions: string;
  netPay: string;
};

export type PayrollPaymentRecord = {
  paymentMethod: PaymentMethod;
  payDate: string;
  isPaid: boolean;
};

export type ReportCard = {
  title: string;
  value: string;
  variant: CardVariant;
};

export type VendorRow = {
  companyId?: string;
  vendorId: string;
  legalName: string;
  address: string;
  zipCode: string;
  email: string;
  phone?: string;
  state: string;
  category: VendorCategory;
  taxIdType: TaxIdType;
  taxId: string;
  entityType: VendorEntityType;
  tinVerification: TinVerificationStatus;
  onboardingSource: "Manual" | "W-9 Intake";
  w9RequestStatus?: "Not Requested" | "Sent" | "Signed";
  w9SignedAt?: string;
};

export type VendorPaymentRow = {
  companyId?: string;
  id: number;
  vendorId: string;
  paymentDate: string;
  invoiceNumber: string;
  amount: number;
  paymentState: string;
  stateWithholding: number;
  year: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  attachmentName?: string;
  attachmentUrl?: string;
};

export type VendorDashboardRow = VendorRow & {
  totalPaid: number;
  is1099Eligible: boolean;
  filingStatus: "MUST FILE" | "OK";
  lifecycleStatus: FilingLifecycleStatus;
  thresholdProgress: number;
  thresholdRemaining: number;
};

export type VendorDocument = {
  id: number;
  companyId: string;
  vendorId: string;
  category: "Invoice" | "Contract" | "W-9" | "1099 Copy";
  fileName: string;
  fileUrl?: string;
  uploadedAt: string;
  note: string;
};

export type OnboardingInvite = {
  id: string;
  companyId: string;
  token: string;
  createdAt: string;
  status: "Open" | "Completed";
};

export type OnboardingSubmission = {
  id: string;
  inviteToken: string;
  companyId: string;
  legalName: string;
  email: string;
  address: string;
  state: string;
  taxIdType: TaxIdType;
  taxId: string;
  entityType: VendorEntityType;
  eSigned: boolean;
  signatureDate: string;
  submittedAt: string;
  approvalStatus: "Pending" | "Approved";
};

export type ComplianceMessageLog = {
  id: string;
  vendorId: string;
  channel: CommunicationChannel;
  sentAt: string;
  template: string;
  status: "Queued" | "Sent";
};

export type W2SummaryRow = {
  id: number;
  employee: string;
  department: string;
  employeeStatus: EmployeeStatus;
  paidMonthCount: number;
  wages: number;
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  stateWages: number;
  stateIncomeTax: number;
  filingStatus: "Ready" | "Estimated";
};

export type EmployerProfile = {
  legalName: string;
  ein: string;
  addressLine1: string;
  addressLine2: string;
  controlNumber: string;
  contactName?: string;
  contactPhone?: string;
  email?: string;
};

export type SubscriptionSettings = {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  seats: number;
  renewalDate: string;
};

export type SubscriptionPlanRecord = {
  plan: SubscriptionPlan;
  monthlyPrice: number;
  subtitle: string;
  features: string[];
};

export type PaymentMethodSettings = {
  holderName: string;
  brand: string;
  cardLast4: string;
  expiry: string;
};

export type InvoiceHistoryRecord = {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
};

export type Report1099Row = VendorDashboardRow;
