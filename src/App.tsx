import JSZip from "jszip";
import { PDFDocument, PDFDropdown, PDFOptionList, PDFTextField } from "pdf-lib";
import type * as React from "react";
import { useMemo, useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useSubscription } from "./hooks/useSubscription";
import { subscriptionService } from "./services/subscriptionService";
import type { CompanySubscription } from "./services/subscriptionService";
import { supabaseEmployeeService } from "./services/supabaseEmployeeService";
import { supabaseVendorService } from "./services/supabaseVendorService";
import { supabasePaymentService } from "./services/supabasePaymentService";
import { supabasePayrollService } from "./services/supabasePayrollService";
import {
  companyOptions,
  departmentOptions,
  employeeCards,
  employeeFormTemplate,
  executiveChartPalette,
  filingLifecycleOptions,
  initialEmployerProfile,
  initialSubscriptionSettings,
  paymentFormTemplate,
  payrollMonthOptions,
  reportTypeOptions,
  subscriptionPlanCatalog,
  usCityOptions,
  usStateOptions,
  vendorCategoryOptions,
  w2FieldAliases,
  w3FieldAliases,
  vendorFormTemplate,
  w9FormTemplate,
} from "./app/data";
import type {
  AppUserRecord,
  AuthScreenType,
  CardVariant,
  CommunicationChannel,
  ComplianceMessageLog,
  EmployeeRow,
  EmployeeStatus,
  FilingLifecycleStatus,
  OnboardingInvite,
  OnboardingSubmission,
  PaymentMethod,
  PayrollPaymentRecord,
  PayrollRow,
  PortalSection,
  QuickBooksSyncState,
  ReportCard,
  ReportDocumentType,
  ReportFocus,
  SubscriptionPlan,
  TaxIdType,
  VendorCategory,
  VendorDashboardRow,
  VendorDocument,
  VendorEntityType,
  VendorPaymentRow,
  VendorRow,
  ViewMode,
  W2Section,
  W2SummaryRow,
  Report1099Row,
  PaymentMethodSettings,
  UserAdminForm,
  InvoiceHistoryRecord,
} from "./app/types";
import {
  buildSmoothSvgPath,
  daysUntil,
  getDefaultPaymentDate,
  getMonthRange,
  getNextForm941DueDate,
  getPlanDefaultCycle,
  getQuarterFromDate,
  getStateWithholdingRate,
  hasMockTinRegistryRecord,
  isTinMatchedToVendorName,
  isZipMatchingState,
  normalizeToken,
  toUsd,
  toW2Amount,
  validateTinFormat,
  vendorNeeds1099,
} from "./app/utils";
import { AuthScreen } from "./components/auth/AuthScreen";
import { AppSidebar } from "./components/layout/AppSidebar";
import { EmployeeView } from "./components/views/EmployeeView";
import { ExecutiveView } from "./components/views/ExecutiveView";
import { PayrollView } from "./components/views/PayrollView";
import { PortalView } from "./components/views/PortalView";
import { ReportsView } from "./components/views/ReportsView";
import { SettingsView } from "./components/views/SettingsView";
import { SubscriptionsView } from "./components/views/SubscriptionsView";
import { W2View } from "./components/views/W2View";
import { TasksView } from "./components/views/TasksView";
import { DocumentsView } from "./components/views/DocumentsView";
import { LandingPage } from "./components/views/LandingPage";
import { cn } from "./utils/cn";

const dashboardCardClassName = (variant: CardVariant) =>
  cn(
    "metric-card rounded-2xl px-6 py-5 transition-all duration-300",
    variant === "accent"
      ? "bg-gradient-to-br from-blue-50 via-indigo-50/80 to-sky-50 border border-blue-200/50"
      : variant === "dark"
        ? "bg-gradient-to-br from-[#0f1f38] via-[#152a4a] to-[#0f1f38] border border-white/[0.08] text-white"
        : "bg-white/80 border border-slate-200/60",
  );

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: supabaseUser, loading: authLoading, signIn, signUp, signOut, resetPassword, signInWithOAuth } = useAuth();
  
  // Subscription management
  const {
    subscription,
    canAddEmployee,
    canAddVendor,
    employeesRemaining,
    vendorsRemaining,
    upgradeMessage,
  } = useSubscription(supabaseUser?.company_id || null);
  
  const activeCompanyId = companyOptions[0]?.id ?? "TC360-HQ";
  const defaultYear = payrollMonthOptions[0]?.split("-")[0] ?? String(new Date().getFullYear());
  const defaultPayrollMonth = payrollMonthOptions[0] ?? `${defaultYear}-01`;

  const [authScreen, setAuthScreen] = useState<AuthScreenType>(() => {
    const path = window.location.pathname;
    if (path.startsWith("/auth/signin") || path.startsWith("/login")) return "signin";
    if (path.startsWith("/auth/register")) return "register";
    if (path.startsWith("/auth/forgot")) return "forgot";
    return "welcome";
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState<"error" | "success" | "info">("info");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("executive");
  const [portalSection, setPortalSection] = useState<PortalSection>("dashboard");
  const [w2Section, setW2Section] = useState<W2Section>("form");
  const [isWorkforceOpen, setIsWorkforceOpen] = useState(true);
  const [isW2Open, setIsW2Open] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isDocumentsOpen, setIsDocumentsOpen] = useState(false);

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [employeeForm, setEmployeeForm] = useState(employeeFormTemplate);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Load employees from Supabase when authenticated
  useEffect(() => {
    if (supabaseUser && supabaseUser.company_id) {
      supabaseEmployeeService.getEmployees(supabaseUser.company_id).then(({ data, error }) => {
        if (error) {
          console.error('Error loading employees:', error);
        } else if (data) {
          // Convert Supabase employees to EmployeeRow format
          const employeeRows: EmployeeRow[] = data.map((emp) => ({
            id: parseInt(emp.employee_id) || 0,
            firstName: emp.first_name,
            lastName: emp.last_name,
            fullName: `${emp.first_name} ${emp.last_name}`,
            ssn: emp.ssn,
            address: emp.address,
            city: emp.city,
            state: emp.state,
            zipCode: emp.zip,
            department: emp.department,
            jobTitle: emp.job_title,
            hireDate: emp.hire_date,
            grossPay: emp.gross_pay,
            status: emp.status as EmployeeStatus,
          }));
          setEmployees(employeeRows);
        }
      });
    }
  }, [supabaseUser]);

  const getPathForAppState = (nextViewMode: ViewMode, nextPortalSection: PortalSection, nextW2Section: W2Section) => {
    if (nextViewMode === "executive") return "/dashboard";
    if (nextViewMode === "employee") return "/employees";
    if (nextViewMode === "payroll") return "/payroll";
    if (nextViewMode === "w2") return nextW2Section === "summary" ? "/w2/summary" : "/w2/forms";
    if (nextViewMode === "portal") {
      if (nextPortalSection === "dashboard") return "/portal";
      if (nextPortalSection === "vendors") return "/vendors";
      return `/portal/${nextPortalSection}`;
    }
    if (nextViewMode === "reports") return "/reports";
    if (nextViewMode === "settings") return "/settings";
    if (nextViewMode === "subscriptions") return "/subscriptions";
    if (nextViewMode === "tasks") return "/tasks";
    if (nextViewMode === "documents") return "/documents";
    return "/dashboard";
  };

  const getAuthPathForScreen = (screen: AuthScreenType) => {
    if (screen === "signin") return "/auth/signin";
    if (screen === "register") return "/auth/register";
    if (screen === "forgot") return "/auth/forgot";
    return "/";
  };

  useEffect(() => {
    const path = location.pathname;

    if (!supabaseUser) {
      if (path.startsWith("/auth/signin") || path === "/login") {
        if (authScreen !== "signin") setAuthScreen("signin");
      } else if (path.startsWith("/auth/register")) {
        if (authScreen !== "register") setAuthScreen("register");
      } else if (path.startsWith("/auth/forgot")) {
        if (authScreen !== "forgot") setAuthScreen("forgot");
      } else {
        if (authScreen !== "welcome") setAuthScreen("welcome");
      }
      return;
    }

    if (path === "/" || path === "/dashboard") {
      if (viewMode !== "executive") setViewMode("executive");
      return;
    }
    if (path.startsWith("/employees")) {
      if (viewMode !== "employee") setViewMode("employee");
      return;
    }
    if (path.startsWith("/payroll")) {
      if (viewMode !== "payroll") setViewMode("payroll");
      return;
    }
    if (path.startsWith("/vendors")) {
      if (viewMode !== "portal") setViewMode("portal");
      if (portalSection !== "vendors") setPortalSection("vendors");
      return;
    }
    if (path.startsWith("/w2/summary")) {
      if (viewMode !== "w2") setViewMode("w2");
      if (w2Section !== "summary") setW2Section("summary");
      return;
    }
    if (path.startsWith("/w2")) {
      if (viewMode !== "w2") setViewMode("w2");
      if (w2Section !== "form") setW2Section("form");
      return;
    }
    if (path.startsWith("/portal")) {
      const parts = path.split("/").filter(Boolean);
      const section = (parts[1] as PortalSection | undefined) || "dashboard";
      if (viewMode !== "portal") setViewMode("portal");
      if (portalSection !== section) setPortalSection(section);
      return;
    }
    if (path.startsWith("/reports")) {
      if (viewMode !== "reports") setViewMode("reports");
      return;
    }
    if (path.startsWith("/settings")) {
      if (viewMode !== "settings") setViewMode("settings");
      return;
    }
    if (path.startsWith("/subscriptions")) {
      if (viewMode !== "subscriptions") setViewMode("subscriptions");
      return;
    }
    if (path.startsWith("/tasks")) {
      if (viewMode !== "tasks") setViewMode("tasks");
      return;
    }
    if (path.startsWith("/documents")) {
      if (viewMode !== "documents") setViewMode("documents");
      return;
    }
  }, [location.pathname, supabaseUser, authScreen, viewMode, portalSection, w2Section]);

  const setViewModeWithRoute: Dispatch<SetStateAction<ViewMode>> = (next) => {
    const resolved = typeof next === "function" ? next(viewMode) : next;
    setViewMode(resolved);
    navigate(getPathForAppState(resolved, portalSection, w2Section));
  };

  const setPortalSectionWithRoute: Dispatch<SetStateAction<PortalSection>> = (next) => {
    const resolved = typeof next === "function" ? next(portalSection) : next;
    setPortalSection(resolved);
    navigate(getPathForAppState(viewMode === "portal" ? viewMode : "portal", resolved, w2Section));
  };

  const setW2SectionWithRoute: Dispatch<SetStateAction<W2Section>> = (next) => {
    const resolved = typeof next === "function" ? next(w2Section) : next;
    setW2Section(resolved);
    navigate(getPathForAppState(viewMode === "w2" ? viewMode : "w2", portalSection, resolved));
  };

  const goToAuthScreen = (screen: AuthScreenType) => {
    setAuthScreen(screen);
    navigate(getAuthPathForScreen(screen));
  };

  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [vendorForm, setVendorForm] = useState(vendorFormTemplate);
  const [vendorFormMessage, setVendorFormMessage] = useState("");
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);

  // Load vendors from Supabase when authenticated
  useEffect(() => {
    if (supabaseUser && supabaseUser.company_id) {
      supabaseVendorService.getVendors(supabaseUser.company_id).then(({ data, error }) => {
        if (error) {
          console.error('Error loading vendors:', error);
        } else if (data) {
          // Convert Supabase vendors to VendorRow format
          const vendorRows: VendorRow[] = data.map((vendor) => ({
            companyId: vendor.company_id,
            vendorId: vendor.vendor_id,
            legalName: vendor.legal_name,
            address: vendor.address,
            zipCode: vendor.zip,
            email: vendor.email,
            phone: "",
            state: vendor.state,
            category: vendor.category as VendorCategory,
            taxIdType: vendor.tax_id_type,
            taxId: vendor.tax_id,
            entityType: vendor.entity_type,
            tinVerification: vendor.tin_verification_status === "Verified" ? "Verified" : "Invalid",
            onboardingSource: "Manual",
            w9RequestStatus: vendor.w9_status === "Received" ? "Signed" : "Not Requested",
          }));
          setVendors(vendorRows);
        }
      });
    }
  }, [supabaseUser]);

  const [selected1099VendorId, setSelected1099VendorId] = useState("");
  const [selected1099Year, setSelected1099Year] = useState(defaultYear);
  const [selectedPayrollMonth, setSelectedPayrollMonth] = useState(defaultPayrollMonth);
  const [selectedW2EmployeeId, setSelectedW2EmployeeId] = useState(0);
  const [selectedW2Year, setSelectedW2Year] = useState(defaultYear);
  const [selectedReportYear, setSelectedReportYear] = useState(defaultYear);
  const [selectedReportEmployeeId, setSelectedReportEmployeeId] = useState(0);
  const [reportFocus, setReportFocus] = useState<ReportFocus | null>(null);
  const [reportDocumentType, setReportDocumentType] = useState<ReportDocumentType>("report");

  const [vendorPayments, setVendorPayments] = useState<VendorPaymentRow[]>([]);
  const [paymentForm, setPaymentForm] = useState(paymentFormTemplate);
  const [paymentFormMessage, setPaymentFormMessage] = useState("");
  const [paymentAttachment, setPaymentAttachment] = useState<File | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [invoiceScanMessage, setInvoiceScanMessage] = useState("");
  const [invoiceOcrText, setInvoiceOcrText] = useState("");
  const [tinCheckMessage, setTinCheckMessage] = useState("");
  const [w9RequestMessage, setW9RequestMessage] = useState("");
  const [reconciliationMessage, setReconciliationMessage] = useState("");
  const [efileMessage, setEfileMessage] = useState("");
  const [communicationBanner, setCommunicationBanner] = useState("");

  // Load payments from Supabase when authenticated
  useEffect(() => {
    if (supabaseUser && supabaseUser.company_id) {
      supabasePaymentService.getPayments(supabaseUser.company_id).then(({ data, error }) => {
        if (error) {
          console.error('Error loading payments:', error);
        } else if (data) {
          // Convert Supabase payments to VendorPaymentRow format
          const paymentRows: VendorPaymentRow[] = data.map((payment) => {
            const month = new Date(payment.payment_date).getMonth() + 1;
            const quarterNum = Math.ceil(month / 3);
            const quarter = `Q${quarterNum}` as "Q1" | "Q2" | "Q3" | "Q4";
            
            return {
              id: parseInt(payment.id) || 0,
              companyId: payment.company_id,
              paymentId: payment.id,
              vendorId: payment.vendor_id,
              amount: payment.amount,
              paymentDate: payment.payment_date,
              paymentMethod: "Check",
              category: "Services",
              description: "",
              invoiceNumber: payment.invoice_number,
              status: "Paid",
              paymentState: payment.payment_state,
              stateWithholding: 0,
              year: new Date(payment.payment_date).getFullYear().toString(),
              quarter,
            };
          });
          setVendorPayments(paymentRows);
        }
      });
    }
  }, [supabaseUser]);

  // Load payroll payments from Supabase when authenticated
  useEffect(() => {
    if (supabaseUser && supabaseUser.company_id) {
      supabasePayrollService.getPayrollPayments(supabaseUser.company_id).then(({ data, error }) => {
        if (error) {
          console.error('Error loading payroll payments:', error);
        } else if (data) {
          // Convert Supabase payroll payments to local format
          const payrollRecords: Record<string, PayrollPaymentRecord> = {};
          
          data.forEach((payment) => {
            const key = `${payment.payroll_month}-${payment.employee_id}`;
            payrollRecords[key] = {
              paymentMethod: "Check",
              payDate: payment.pay_date || getDefaultPaymentDate(payment.payroll_month),
              isPaid: payment.status === "Paid",
            };
          });
          
          setPayrollPayments((prev) => ({ ...prev, ...payrollRecords }));
        }
      });
    }
  }, [supabaseUser]);

  const [vendorDocuments, setVendorDocuments] = useState<VendorDocument[]>([]);
  const [vendorDocFile, setVendorDocFile] = useState<File | null>(null);
  const [vendorDocForm, setVendorDocForm] = useState<{ vendorId: string; category: VendorDocument["category"]; note: string }>({
    vendorId: "",
    category: "Invoice",
    note: "",
  });

  const [onboardingInvites, setOnboardingInvites] = useState<OnboardingInvite[]>([]);
  const [onboardingSubmissions, setOnboardingSubmissions] = useState<OnboardingSubmission[]>([]);
  const [, setActiveOnboardingToken] = useState("");
  const [, setW9Form] = useState(w9FormTemplate);
  const [, setIsSelfOnboardingOpen] = useState(false);
  const [, setIsW9FormOpen] = useState(false);
  const [complianceMessageLog, setComplianceMessageLog] = useState<ComplianceMessageLog[]>([]);
  const [filingLifecycle, setFilingLifecycle] = useState<Record<string, FilingLifecycleStatus>>({});
  const [reconciliationAssignByPaymentId, setReconciliationAssignByPaymentId] = useState<Record<number, string>>({});

  const [brandLogoUrl, setBrandLogoUrl] = useState("/images/logo.png");
  const [brandLogoName, setBrandLogoName] = useState("");
  const [platformName, setPlatformName] = useState("TaxCore360");
  const [formSignerName, setFormSignerName] = useState("");
  const [formSignatureLedger, setFormSignatureLedger] = useState<Record<string, { signedBy: string; signedAt: string }>>({});
  const [employerProfile, setEmployerProfile] = useState(initialEmployerProfile);
  const [settingsMessage, setSettingsMessage] = useState("");

  const [subscriptionSettings, setSubscriptionSettings] = useState(initialSubscriptionSettings);
  const [quickbooksSync, setQuickbooksSync] = useState<QuickBooksSyncState>({
    connected: false,
    companyName: "",
    realmId: "",
    lastSyncAt: "",
    vendorsSynced: 0,
    paymentsSynced: 0,
  });
  const [quickbooksMessage, setQuickbooksMessage] = useState("");
  const [paymentMethodSettings, setPaymentMethodSettings] = useState<PaymentMethodSettings>({
    holderName: "",
    brand: "",
    cardLast4: "",
    expiry: "",
  });

  const [userDirectory, setUserDirectory] = useState<AppUserRecord[]>([]);
  const [userAdminForm, setUserAdminForm] = useState<UserAdminForm>({
    name: "",
    email: "",
    role: "Operations Manager",
    password: "",
  });
  const [userAdminMessage, setUserAdminMessage] = useState("");

  const [bulkPaymentMethod, setBulkPaymentMethod] = useState<PaymentMethod>("Bank Transfer");
  const [bulkPayDate, setBulkPayDate] = useState(getDefaultPaymentDate(defaultPayrollMonth));
  const [payrollPayments, setPayrollPayments] = useState<Record<string, PayrollPaymentRecord>>(() => {
    const initialRecords: Record<string, PayrollPaymentRecord> = {};

    return initialRecords;
  });

  const [isGeneratingOfficialW2, setIsGeneratingOfficialW2] = useState(false);

  const scopedVendors = useMemo(
    () => vendors.filter((vendor) => !vendor.companyId || vendor.companyId === activeCompanyId),
    [activeCompanyId, vendors],
  );

  const scopedVendorPayments = useMemo(
    () => vendorPayments.filter((payment) => !payment.companyId || payment.companyId === activeCompanyId),
    [activeCompanyId, vendorPayments],
  );

  const scopedVendorDocuments = useMemo(
    () => vendorDocuments.filter((document) => document.companyId === activeCompanyId),
    [activeCompanyId, vendorDocuments],
  );

  const invoiceHistory = useMemo<InvoiceHistoryRecord[]>(
    () => [
      {
        id: "INV-2026-001",
        description: `${subscriptionSettings.plan} workspace renewal`,
        amount: subscriptionPlanCatalog.find((plan) => plan.plan === subscriptionSettings.plan)?.monthlyPrice ?? 0,
        status: "Paid",
        date: subscriptionSettings.renewalDate,
      },
      {
        id: "INV-2026-002",
        description: `Seat allocation for ${subscriptionSettings.seats} users`,
        amount: subscriptionSettings.seats * 4,
        status: subscriptionSettings.status === "Past Due" ? ("Pending" as const) : ("Paid" as const),
        date: new Date().toLocaleDateString("en-US"),
      },
    ],
    [subscriptionSettings.plan, subscriptionSettings.renewalDate, subscriptionSettings.seats, subscriptionSettings.status],
  );

  const totalGrossPayroll = useMemo(() => employees.reduce((sum, employee) => sum + employee.grossPay, 0), [employees]);

  const activeEmployees = useMemo(() => employees.filter((employee) => employee.status === "Active"), [employees]);

  const executiveTotals = useMemo(() => {
    const gross = activeEmployees.reduce((sum, employee) => sum + employee.grossPay, 0);
    const taxes = gross * (0.12 + 0.062 + 0.0145 + 0.04);
    const benefits = gross * 0.03;
    const net = gross - taxes - benefits;

    return { gross, taxes, benefits, net };
  }, [activeEmployees]);

  const executiveDepartmentRows = useMemo(() => {
    const totals = new Map<string, { department: string; employees: number; gross: number; employerTaxes: number }>();

    activeEmployees.forEach((employee) => {
      const current = totals.get(employee.department) ?? { department: employee.department, employees: 0, gross: 0, employerTaxes: 0 };
      current.employees += 1;
      current.gross += employee.grossPay;
      current.employerTaxes += employee.grossPay * 0.0765;
      totals.set(employee.department, current);
    });

    return Array.from(totals.values()).sort((left, right) => right.gross - left.gross);
  }, [activeEmployees]);

  const dynamicExecutiveCards: ReportCard[] = [
    { title: "ACTIVE EMPLOYEES", value: String(activeEmployees.length).padStart(2, "0"), variant: "default" },
    { title: "MONTHLY GROSS PAYROLL", value: toUsd(executiveTotals.gross), variant: "accent" },
    { title: "NET PAY ESTIMATE", value: toUsd(executiveTotals.net), variant: "default" },
    { title: "DEPARTMENTS", value: String(executiveDepartmentRows.length), variant: "dark" },
  ];

  const payrollMonthMeta = useMemo(() => getMonthRange(selectedPayrollMonth), [selectedPayrollMonth]);
  const daysLeftToFile1099 = daysUntil(new Date(Number(selected1099Year) + 1, 0, 31));
  const form941CountdownDays = daysUntil(getNextForm941DueDate());

  const getPayrollPaymentKey = (employeeId: number, month: string) => `${month}-${employeeId}`;

  const getPayrollPaymentRecord = (employeeId: number, month: string): PayrollPaymentRecord => {
    return (
      payrollPayments[getPayrollPaymentKey(employeeId, month)] ?? {
        paymentMethod: bulkPaymentMethod,
        payDate: getDefaultPaymentDate(month),
        isPaid: false,
      }
    );
  };

  const duplicatePaymentIds = useMemo(() => {
    const seen = new Map<string, number>();
    const duplicates = new Set<number>();

    scopedVendorPayments.forEach((payment) => {
      const key = [payment.vendorId, payment.invoiceNumber.trim().toLowerCase(), payment.amount.toFixed(2), payment.paymentDate].join("|");
      const existingId = seen.get(key);
      if (existingId !== undefined) {
        duplicates.add(existingId);
        duplicates.add(payment.id);
      } else {
        seen.set(key, payment.id);
      }
    });

    return duplicates;
  }, [scopedVendorPayments]);

  const paymentDuplicateCandidates = useMemo(() => {
    const normalizedInvoice = paymentForm.invoiceNumber.trim().toLowerCase();
    const normalizedAmount = Number(paymentForm.amount || 0);

    if (!paymentForm.vendorId || !paymentForm.paymentDate || !normalizedInvoice || Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      return [];
    }

    return scopedVendorPayments.filter(
      (payment) =>
        payment.vendorId === paymentForm.vendorId &&
        payment.paymentDate === paymentForm.paymentDate &&
        payment.invoiceNumber.trim().toLowerCase() === normalizedInvoice &&
        payment.amount === normalizedAmount,
    );
  }, [paymentForm.amount, paymentForm.invoiceNumber, paymentForm.paymentDate, paymentForm.vendorId, scopedVendorPayments]);

  const payrollTableRows = useMemo<PayrollRow[]>(() => {
    return activeEmployees.map((row) => {
      const federalWithholdingAmount = row.grossPay * 0.12;
      const socialSecurityAmount = row.grossPay * 0.062;
      const medicareAmount = row.grossPay * 0.0145;
      const stateTaxAmount = row.grossPay * 0.04;
      const pretaxDeductionsAmount = row.grossPay * 0.03;
      const netPayAmount =
        row.grossPay - federalWithholdingAmount - socialSecurityAmount - medicareAmount - stateTaxAmount - pretaxDeductionsAmount;

      return {
        id: row.id,
        employee: row.fullName,
        department: row.department,
        payPeriod: payrollMonthMeta.payPeriod,
        grossPay: toUsd(row.grossPay),
        federalWithholding: toUsd(federalWithholdingAmount),
        socialSecurity: toUsd(socialSecurityAmount),
        medicare: toUsd(medicareAmount),
        stateTax: toUsd(stateTaxAmount),
        pretaxDeductions: toUsd(pretaxDeductionsAmount),
        netPay: toUsd(netPayAmount),
      };
    });
  }, [activeEmployees, payrollMonthMeta.payPeriod]);

  const payrollTotals = useMemo(
    () =>
      payrollTableRows.reduce(
        (acc, row) => {
          const gross = Number(row.grossPay.replace(/[$,]/g, ""));
          const federal = Number(row.federalWithholding.replace(/[$,]/g, ""));
          const social = Number(row.socialSecurity.replace(/[$,]/g, ""));
          const medicare = Number(row.medicare.replace(/[$,]/g, ""));
          const state = Number(row.stateTax.replace(/[$,]/g, ""));
          const pretax = Number(row.pretaxDeductions.replace(/[$,]/g, ""));
          const net = Number(row.netPay.replace(/[$,]/g, ""));

          return {
            gross: acc.gross + gross,
            taxes: acc.taxes + federal + social + medicare + state,
            benefits: acc.benefits + pretax,
            net: acc.net + net,
          };
        },
        { gross: 0, taxes: 0, benefits: 0, net: 0 },
      ),
    [payrollTableRows],
  );

  const paidEmployeeCount = useMemo(
    () =>
      activeEmployees.filter((employee) => getPayrollPaymentRecord(employee.id, selectedPayrollMonth).isPaid).length,
    [activeEmployees, payrollPayments, selectedPayrollMonth],
  );

  const isCurrentMonthPaid = activeEmployees.length > 0 && paidEmployeeCount === activeEmployees.length;

  const payrollRowsWithPayment = useMemo(
    () =>
      payrollTableRows.map((row) => ({
        ...row,
        paymentRecord: getPayrollPaymentRecord(row.id, selectedPayrollMonth),
      })),
    [payrollTableRows, payrollPayments, selectedPayrollMonth, bulkPayDate, bulkPaymentMethod],
  );

  const payrollMethodSummary = useMemo(() => {
    return payrollRowsWithPayment.reduce(
      (acc, row) => {
        acc[row.paymentRecord.paymentMethod] += 1;
        return acc;
      },
      { Cash: 0, "Bank Transfer": 0, Check: 0 } as Record<PaymentMethod, number>,
    );
  }, [payrollRowsWithPayment]);

  const executiveMonthlyPaidTrend = useMemo(() => {
    return payrollMonthOptions.map((month) => {
      const paidGross = activeEmployees.reduce((sum, employee) => {
        const paymentRecord = payrollPayments[getPayrollPaymentKey(employee.id, month)];
        return paymentRecord?.isPaid ? sum + employee.grossPay : sum;
      }, 0);

      const paidCount = activeEmployees.reduce((count, employee) => {
        const paymentRecord = payrollPayments[getPayrollPaymentKey(employee.id, month)];
        return paymentRecord?.isPaid ? count + 1 : count;
      }, 0);

      return {
        month,
        label: getMonthRange(month).label.slice(0, 3),
        paidGross,
        paidCount,
      };
    });
  }, [activeEmployees, payrollPayments]);

  const executiveDepartmentShareRows = useMemo(() => {
    const totalGross = executiveTotals.gross || 1;

    return executiveDepartmentRows.map((row, index) => ({
      ...row,
      color: executiveChartPalette[index % executiveChartPalette.length],
      share: row.gross / totalGross,
    }));
  }, [executiveDepartmentRows, executiveTotals.gross]);

  const executiveTrendChart = useMemo(() => {
    const chartWidth = 620;
    const chartHeight = 224;
    const topPadding = 18;
    const bottomPadding = 36;
    const leftPadding = 24;
    const rightPadding = 24;
    const paidValues = executiveMonthlyPaidTrend.map((row) => row.paidGross);
    const maxPaid = Math.max(...paidValues, 1);
    const pointSpacing =
      executiveMonthlyPaidTrend.length > 1
        ? (chartWidth - leftPadding - rightPadding) / (executiveMonthlyPaidTrend.length - 1)
        : 0;

    const points = executiveMonthlyPaidTrend.map((row, index) => {
      const normalizedValue = row.paidGross / maxPaid;
      return {
        ...row,
        x: leftPadding + index * pointSpacing,
        y: topPadding + (1 - normalizedValue) * (chartHeight - topPadding - bottomPadding),
      };
    });

    const linePath = buildSmoothSvgPath(points.map((point) => ({ x: point.x, y: point.y })));
    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - bottomPadding} L ${points[0].x} ${chartHeight - bottomPadding} Z`
        : "";

    const yTicks = [1, 0.66, 0.33, 0].map((ratio) => ({
      y: topPadding + (1 - ratio) * (chartHeight - topPadding - bottomPadding),
      value: maxPaid * ratio,
    }));

    return {
      chartWidth,
      chartHeight,
      topPadding,
      bottomPadding,
      leftPadding,
      rightPadding,
      points,
      linePath,
      areaPath,
      yTicks,
      maxPaid,
    };
  }, [executiveMonthlyPaidTrend]);

  const executiveTrendSummary = useMemo(() => {
    if (executiveMonthlyPaidTrend.length === 0) {
      return {
        monthlyAverage: 0,
        totalPaid: 0,
        currentMonthGrowth: 0,
      };
    }

    const totalPaid = executiveMonthlyPaidTrend.reduce((sum, row) => sum + row.paidGross, 0);
    const monthlyAverage = totalPaid / executiveMonthlyPaidTrend.length;
    const currentValue = executiveMonthlyPaidTrend[executiveMonthlyPaidTrend.length - 1]?.paidGross ?? 0;
    const previousValue = executiveMonthlyPaidTrend[executiveMonthlyPaidTrend.length - 2]?.paidGross ?? 0;
    const baseline = previousValue || 1;
    const currentMonthGrowth = ((currentValue - previousValue) / baseline) * 100;

    return {
      monthlyAverage,
      totalPaid,
      currentMonthGrowth,
    };
  }, [executiveMonthlyPaidTrend]);

  const leadingDepartment = executiveDepartmentShareRows[0] ?? null;

  const executiveDonutBackground = useMemo(() => {
    if (executiveDepartmentShareRows.length === 0) {
      return "conic-gradient(#dbe4f3 0deg 360deg)";
    }

    let currentDegree = 0;
    const segments = executiveDepartmentShareRows
      .map((row) => {
        const start = currentDegree;
        currentDegree += row.share * 360;
        return `${row.color} ${start.toFixed(2)}deg ${currentDegree.toFixed(2)}deg`;
      })
      .join(", ");

    return `conic-gradient(${segments})`;
  }, [executiveDepartmentShareRows]);

  const w2YearOptions = useMemo(() => {
    const years = Array.from(new Set(payrollMonthOptions.map((month) => month.split("-")[0])));
    return years.sort((a, b) => Number(b) - Number(a));
  }, []);

  const selectedW2Employee = useMemo(
    () => employees.find((row) => row.id === selectedW2EmployeeId) ?? null,
    [employees, selectedW2EmployeeId],
  );

  const monthsForSelectedW2Year = useMemo(
    () => payrollMonthOptions.filter((month) => month.startsWith(`${selectedW2Year}-`)),
    [selectedW2Year],
  );

  const w2SummaryRows = useMemo<W2SummaryRow[]>(() => {
    return employees.map((employee) => {
      const paidMonthCount = monthsForSelectedW2Year.reduce((count, month) => {
        const paymentRecord = payrollPayments[`${month}-${employee.id}`];
        return paymentRecord?.isPaid ? count + 1 : count;
      }, 0);

      const wages = paidMonthCount > 0 ? employee.grossPay * paidMonthCount : employee.grossPay * 12;
      const federalIncomeTax = wages * 0.12;
      const socialSecurityTax = wages * 0.062;
      const medicareTax = wages * 0.0145;
      const stateWages = wages * 0.97;
      const stateIncomeTax = stateWages * 0.04;

      return {
        id: employee.id,
        employee: employee.fullName,
        department: employee.department,
        employeeStatus: employee.status,
        paidMonthCount,
        wages,
        federalIncomeTax,
        socialSecurityTax,
        medicareTax,
        stateWages,
        stateIncomeTax,
        filingStatus: paidMonthCount > 0 ? "Ready" : "Estimated",
      };
    });
  }, [employees, monthsForSelectedW2Year, payrollPayments]);

  const selectedW2Summary = useMemo(
    () => w2SummaryRows.find((row) => row.id === selectedW2EmployeeId) ?? null,
    [w2SummaryRows, selectedW2EmployeeId],
  );

  const selectedW2EmployeePaymentSummary = useMemo(() => {
    if (!selectedW2Employee) {
      return { paidMonthCount: 0, annualGrossWages: 0 };
    }

    const paidMonthCount = selectedW2Summary?.paidMonthCount ?? 0;
    const annualGrossWages = selectedW2Summary?.wages ?? selectedW2Employee.grossPay * 12;

    return {
      paidMonthCount,
      annualGrossWages,
    };
  }, [selectedW2Employee, selectedW2Summary]);

  const selectedW2Amounts = useMemo(() => {
    const wages = selectedW2Summary?.wages ?? selectedW2EmployeePaymentSummary.annualGrossWages;
    const federalIncomeTax = selectedW2Summary?.federalIncomeTax ?? wages * 0.12;
    const socialSecurityWages = wages;
    const socialSecurityTax = selectedW2Summary?.socialSecurityTax ?? socialSecurityWages * 0.062;
    const medicareWages = wages;
    const medicareTax = selectedW2Summary?.medicareTax ?? medicareWages * 0.0145;
    const stateWages = selectedW2Summary?.stateWages ?? wages * 0.97;
    const stateIncomeTax = selectedW2Summary?.stateIncomeTax ?? stateWages * 0.04;

    return {
      wages,
      federalIncomeTax,
      socialSecurityWages,
      socialSecurityTax,
      medicareWages,
      medicareTax,
      stateWages,
      stateIncomeTax,
    };
  }, [selectedW2Summary, selectedW2EmployeePaymentSummary.annualGrossWages]);

  const w2SummaryTotals = useMemo(
    () =>
      w2SummaryRows.reduce(
        (acc, row) => ({
          wages: acc.wages + row.wages,
          federalIncomeTax: acc.federalIncomeTax + row.federalIncomeTax,
          socialSecurityTax: acc.socialSecurityTax + row.socialSecurityTax,
          medicareTax: acc.medicareTax + row.medicareTax,
        }),
        { wages: 0, federalIncomeTax: 0, socialSecurityTax: 0, medicareTax: 0 },
      ),
    [w2SummaryRows],
  );

  const w3Totals = useMemo(() => {
    const socialSecurityWages = w2SummaryRows.reduce((sum, row) => sum + row.wages, 0);
    const medicareWages = socialSecurityWages;

    return {
      employeeCount: w2SummaryRows.length,
      wages: w2SummaryTotals.wages,
      federalIncomeTax: w2SummaryTotals.federalIncomeTax,
      socialSecurityWages,
      socialSecurityTax: w2SummaryTotals.socialSecurityTax,
      medicareWages,
      medicareTax: w2SummaryTotals.medicareTax,
      stateWages: w2SummaryRows.reduce((sum, row) => sum + row.stateWages, 0),
      stateIncomeTax: w2SummaryRows.reduce((sum, row) => sum + row.stateIncomeTax, 0),
    };
  }, [w2SummaryRows, w2SummaryTotals]);

  const portalYearPayments = useMemo(
    () => scopedVendorPayments.filter((payment) => payment.year === selected1099Year),
    [scopedVendorPayments, selected1099Year],
  );

  const vendorDashboardRows = useMemo<VendorDashboardRow[]>(
    () =>
      scopedVendors.map((vendor) => {
        const totalPaid = portalYearPayments
          .filter((payment) => payment.vendorId === vendor.vendorId)
          .reduce((sum, payment) => sum + payment.amount, 0);
        const is1099Eligible = vendorNeeds1099(vendor.entityType);
        const filingStatus = is1099Eligible && totalPaid >= 600 ? "MUST FILE" : "OK";
        const thresholdProgress = Math.min(totalPaid / 600, 1);
        const thresholdRemaining = Math.max(600 - totalPaid, 0);

        const lifecycleKey = `${activeCompanyId}-${selected1099Year}-${vendor.vendorId}`;
        const lifecycleStatus = filingLifecycle[lifecycleKey] ?? "Not Started";

        return {
          ...vendor,
          totalPaid,
          is1099Eligible,
          filingStatus: filingStatus as "MUST FILE" | "OK",
          lifecycleStatus,
          thresholdProgress,
          thresholdRemaining,
        };
      }),
    [activeCompanyId, filingLifecycle, portalYearPayments, scopedVendors, selected1099Year],
  );

  const mustFileVendorCount = useMemo(
    () => vendorDashboardRows.filter((row) => row.filingStatus === "MUST FILE").length,
    [vendorDashboardRows],
  );

  const filedVendorCount = useMemo(
    () => vendorDashboardRows.filter((row) => row.filingStatus === "MUST FILE" && row.lifecycleStatus === "Accepted").length,
    [vendorDashboardRows],
  );

  const rejectedVendorCount = useMemo(
    () => vendorDashboardRows.filter((row) => row.filingStatus === "MUST FILE" && row.lifecycleStatus === "Rejected").length,
    [vendorDashboardRows],
  );

  const pendingVendorCount = Math.max(mustFileVendorCount - filedVendorCount - rejectedVendorCount, 0);

  const topCostVendor = useMemo(() => {
    if (vendorDashboardRows.length === 0) {
      return null;
    }

    return vendorDashboardRows.reduce((top, row) => (row.totalPaid > top.totalPaid ? row : top), vendorDashboardRows[0]);
  }, [vendorDashboardRows]);

  const vendorCategorySpendRows = useMemo(() => {
    const spendByCategory = new Map<VendorCategory, number>();

    portalYearPayments.forEach((payment) => {
      const vendor = scopedVendors.find((row) => row.vendorId === payment.vendorId);
      const category = vendor?.category ?? "Operations";
      spendByCategory.set(category, (spendByCategory.get(category) ?? 0) + payment.amount);
    });

    return vendorCategoryOptions
      .map((category) => ({
        category,
        amount: spendByCategory.get(category) ?? 0,
      }))
      .filter((row) => row.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [portalYearPayments, scopedVendors]);

  const maxCategorySpend = Math.max(...vendorCategorySpendRows.map((row) => row.amount), 1);

  const communicationQueueRows = useMemo(
    () =>
      vendorDashboardRows
        .filter((row) => row.w9RequestStatus !== "Signed" || row.tinVerification !== "Verified")
        .map((row) => ({
          vendorId: row.vendorId,
          legalName: row.legalName,
          email: row.email,
          phone: row.phone || "N/A",
          reason:
            row.w9RequestStatus !== "Signed"
              ? "Missing W-9 signature"
              : row.tinVerification !== "Verified"
                ? "TIN mismatch"
                : "Review",
        })),
    [vendorDashboardRows],
  );

  const complianceAlerts = useMemo(() => {
    const alerts: Array<{ level: "warning" | "critical"; message: string }> = [];

    vendorDashboardRows.forEach((row) => {
      if (row.totalPaid >= 500 && row.totalPaid < 600) {
        alerts.push({
          level: "warning",
          message: `${row.vendorId} is at ${toUsd(row.totalPaid)} and close to 1099 threshold.`,
        });
      }

      if (row.tinVerification !== "Verified") {
        alerts.push({
          level: "critical",
          message: `${row.vendorId} has ${row.tinVerification.toLowerCase()} TIN. Review before filing.`,
        });
      }
    });

    const filingDeadline = new Date(Number(selected1099Year) + 1, 0, 31);
    const daysLeft = Math.ceil((filingDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0 && daysLeft <= 10) {
      alerts.push({
        level: "warning",
        message: `${daysLeft} day(s) left before 1099-NEC filing deadline (Jan 31).`,
      });
    }

    const knownVendorIds = new Set(scopedVendors.map((vendor) => vendor.vendorId));
    const unallocatedAmount = portalYearPayments
      .filter((payment) => !knownVendorIds.has(payment.vendorId))
      .reduce((sum, payment) => sum + payment.amount, 0);

    if (unallocatedAmount > 0) {
      alerts.push({
        level: "critical",
        message: `${toUsd(unallocatedAmount)} is not mapped to a valid vendor. Assign before 1099 filing.`,
      });
    }

    return alerts.slice(0, 6);
  }, [portalYearPayments, scopedVendors, selected1099Year, vendorDashboardRows]);

  const portalMonthlyTotals = useMemo(() => {
    const monthMap = new Map<string, number>();

    portalYearPayments.forEach((payment) => {
      const monthKey = payment.paymentDate.slice(0, 7);
      monthMap.set(monthKey, (monthMap.get(monthKey) ?? 0) + payment.amount);
    });

    return Array.from(monthMap.entries())
      .map(([month, total]) => ({ month, total, label: getMonthRange(month).label || month }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [portalYearPayments]);

  const portalStateDistribution = useMemo(() => {
    const stateMap = new Map<string, number>();
    scopedVendors.forEach((vendor) => {
      stateMap.set(vendor.state, (stateMap.get(vendor.state) ?? 0) + 1);
    });

    return Array.from(stateMap.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);
  }, [scopedVendors]);

  const maxMonthlyTotal = Math.max(...portalMonthlyTotals.map((row) => row.total), 1);
  const maxStateCount = Math.max(...portalStateDistribution.map((row) => row.count), 1);

  const selected1099Vendor = useMemo(
    () => scopedVendors.find((vendor) => vendor.vendorId === selected1099VendorId) ?? null,
    [scopedVendors, selected1099VendorId],
  );

  const selected1099VendorYearPayments = useMemo(
    () =>
      portalYearPayments
        .filter((payment) => payment.vendorId === selected1099VendorId)
        .sort((a, b) => a.paymentDate.localeCompare(b.paymentDate)),
    [portalYearPayments, selected1099VendorId],
  );

  const selected1099VendorTotal = useMemo(
    () => selected1099VendorYearPayments.reduce((sum, payment) => sum + payment.amount, 0),
    [selected1099VendorYearPayments],
  );

  const selected1099SignatureKey = `${selected1099Year}-${selected1099VendorId || "unknown"}`;
  const selected1099Signature = formSignatureLedger[selected1099SignatureKey] ?? null;

  const portalCards: ReportCard[] = [
    { title: "TOTAL VENDORS", value: String(scopedVendors.length), variant: "default" },
    {
      title: `${selected1099Year} FILED`,
      value: String(filedVendorCount),
      variant: "accent",
    },
    { title: `${selected1099Year} PENDING FILE`, value: String(pendingVendorCount), variant: "default" },
    {
      title: `${selected1099Year} TOTAL PAYMENTS`,
      value: toUsd(portalYearPayments.reduce((sum, payment) => sum + payment.amount, 0)),
      variant: "dark",
    },
  ];

  const dynamicEmployeeCards = [
    { ...employeeCards[0], value: String(employees.length) },
    { ...employeeCards[1], value: toUsd(totalGrossPayroll) },
    {
      ...employeeCards[2],
      value: toUsd(employees.length === 0 ? 0 : employees.reduce((sum, row) => sum + row.grossPay, 0) / employees.length),
    },
    { ...employeeCards[3], value: String(employees.filter((row) => row.status === "Inactive").length).padStart(2, "0") },
  ];

  const dynamicPayrollCards = [
    { title: `${payrollMonthMeta.label.toUpperCase()} GROSS PAYROLL`, value: toUsd(payrollTotals.gross), variant: "default" as CardVariant },
    { title: "TOTAL TAX WITHHOLDING", value: toUsd(payrollTotals.taxes), variant: "accent" as CardVariant },
    { title: "BENEFITS & 401(K)", value: toUsd(payrollTotals.benefits), variant: "default" as CardVariant },
    { title: "NET PAY DISBURSEMENT", value: toUsd(payrollTotals.net), variant: "dark" as CardVariant },
  ];

  const reportCards: ReportCard[] = [
    { title: "AVAILABLE DOCUMENTS", value: String(reportTypeOptions.length), variant: "default" },
    { title: "ACTIVE EMPLOYEE FILES", value: String(activeEmployees.length), variant: "accent" },
    { title: `${payrollMonthMeta.label.toUpperCase()} PAID`, value: `${paidEmployeeCount}/${activeEmployees.length}`, variant: "default" },
    { title: "PRINT READY", value: "YES", variant: "dark" },
  ];

  const settingsCards: ReportCard[] = [
    { title: "COMPANY LEGAL NAME", value: employerProfile.legalName, variant: "default" },
    { title: "EIN", value: employerProfile.ein, variant: "accent" },
    { title: "AUTHORIZED SIGNER", value: formSignerName, variant: "default" },
    { title: "BRAND READY", value: brandLogoName ? "LOGO UPLOADED" : "DEFAULT", variant: "dark" },
  ];

  const subscriptionCards: ReportCard[] = [
    { title: "CURRENT PLAN", value: subscriptionSettings.plan, variant: "default" },
    { title: "MONTHLY RATE", value: toUsd(subscriptionPlanCatalog.find((plan) => plan.plan === subscriptionSettings.plan)?.monthlyPrice ?? 0), variant: "accent" },
    { title: "BILLING", value: subscriptionSettings.billingCycle, variant: "default" },
    { title: "SEATS", value: String(subscriptionSettings.seats), variant: "dark" },
  ];

  const w2Cards: ReportCard[] =
    w2Section === "summary"
      ? [
          { title: "IRS FORM", value: "W-3", variant: "default" },
          { title: "TAX YEAR", value: selectedW2Year, variant: "accent" },
          { title: "TOTAL W-2 FORMS", value: String(w3Totals.employeeCount), variant: "default" },
          { title: "BOX 1 TOTAL WAGES", value: toUsd(w3Totals.wages), variant: "dark" },
        ]
      : [
          { title: "IRS FORM", value: "W-2", variant: "default" },
          { title: "TAX YEAR", value: selectedW2Year, variant: "accent" },
          {
            title: "EMPLOYEE",
            value: selectedW2Employee?.fullName ?? "No Employee",
            variant: "default",
          },
          {
            title: "BOX 1 WAGES",
            value: toUsd(selectedW2Amounts.wages),
            variant: "dark",
          },
        ];

  const reportFocusLabel =
    reportFocus === "employee_count"
      ? "Employee Count Summary"
      : reportFocus === "paid_months"
        ? "Paid Months & Disbursement"
        : reportFocus === "employee_statement"
          ? "Employee Account Statement"
          : reportFocus === "w2_transmittal"
            ? "W-2 / W-3 Annual Summary"
            : reportFocus === "form_1099_compliance"
              ? "1099-NEC Compliance Summary"
              : reportFocus === "tax_reconciliation"
                ? "Tax Reconciliation Report"
          : "No Report Selected";

  const reportFocusSubtitle =
    reportFocus === "employee_count"
      ? "Dedicated headcount page with department and active/inactive distribution"
      : reportFocus === "paid_months"
        ? "Dedicated monthly disbursement page with paid-month and amount analysis"
        : reportFocus === "employee_statement"
          ? "Dedicated employee ledger page with month-by-month payment history"
          : reportFocus === "w2_transmittal"
            ? "Dedicated annual wages and withholding page for W-2 and W-3 reconciliation"
            : reportFocus === "form_1099_compliance"
              ? "Dedicated 1099-NEC filing page with vendor threshold and must-file status"
              : reportFocus === "tax_reconciliation"
                ? "Dedicated reconciliation page to match disbursements with reportable 1099 totals"
          : "Choose a report to enter its dedicated page";

  const reportDocumentLabel = reportDocumentType === "statement" ? "Statement (Kashf)" : "Report (Taqreer)";
  const reportYearMonths = useMemo(
    () => payrollMonthOptions.filter((month) => month.startsWith(`${selectedReportYear}-`)),
    [selectedReportYear],
  );

  const reportSelectedEmployee = useMemo(
    () => employees.find((row) => row.id === selectedReportEmployeeId) ?? null,
    [employees, selectedReportEmployeeId],
  );

  const reportPaidMonthsRows = useMemo(
    () =>
      reportYearMonths.map((month) => {
        const label = getMonthRange(month).label;

        const totals = employees.reduce(
          (acc, employee) => {
            const payment = payrollPayments[getPayrollPaymentKey(employee.id, month)];
            if (!payment?.isPaid) {
              return acc;
            }

            const gross = employee.grossPay;
            const net = gross - gross * 0.12 - gross * 0.062 - gross * 0.0145 - gross * 0.04 - gross * 0.03;

            return {
              paidEmployees: acc.paidEmployees + 1,
              grossPaid: acc.grossPaid + gross,
              netPaid: acc.netPaid + net,
            };
          },
          { paidEmployees: 0, grossPaid: 0, netPaid: 0 },
        );

        return {
          month,
          label,
          paidEmployees: totals.paidEmployees,
          grossPaid: totals.grossPaid,
          netPaid: totals.netPaid,
        };
      }),
    [employees, payrollPayments, reportYearMonths],
  );

  const reportSelectedEmployeeLedger = useMemo(() => {
    if (!reportSelectedEmployee) {
      return [];
    }

    return reportYearMonths.map((month) => {
      const payment = payrollPayments[getPayrollPaymentKey(reportSelectedEmployee.id, month)];
      const gross = reportSelectedEmployee.grossPay;
      const net = gross - gross * 0.12 - gross * 0.062 - gross * 0.0145 - gross * 0.04 - gross * 0.03;

      return {
        month,
        label: getMonthRange(month).label,
        paymentMethod: payment?.paymentMethod ?? "-",
        payDate: payment?.isPaid ? payment.payDate || "-" : "-",
        isPaid: Boolean(payment?.isPaid),
        grossPaid: payment?.isPaid ? gross : 0,
        netPaid: payment?.isPaid ? net : 0,
      };
    });
  }, [payrollPayments, reportSelectedEmployee, reportYearMonths]);

  const reportEmployeeYearTotals = useMemo(
    () =>
      reportSelectedEmployeeLedger.reduce(
        (acc, row) => ({
          paidMonths: acc.paidMonths + (row.isPaid ? 1 : 0),
          grossPaid: acc.grossPaid + row.grossPaid,
          netPaid: acc.netPaid + row.netPaid,
        }),
        { paidMonths: 0, grossPaid: 0, netPaid: 0 },
      ),
    [reportSelectedEmployeeLedger],
  );

  const reportW2YearMonths = useMemo(
    () => payrollMonthOptions.filter((month) => month.startsWith(`${selectedReportYear}-`)),
    [selectedReportYear],
  );

  const reportW2Rows = useMemo<W2SummaryRow[]>(() => {
    return employees.map((employee) => {
      const paidMonthCount = reportW2YearMonths.reduce((count, month) => {
        const paymentRecord = payrollPayments[getPayrollPaymentKey(employee.id, month)];
        return paymentRecord?.isPaid ? count + 1 : count;
      }, 0);

      const wages = employee.grossPay * paidMonthCount;
      const federalIncomeTax = wages * 0.12;
      const socialSecurityTax = wages * 0.062;
      const medicareTax = wages * 0.0145;
      const stateWages = wages * 0.97;
      const stateIncomeTax = stateWages * 0.04;

      return {
        id: employee.id,
        employee: employee.fullName,
        department: employee.department,
        employeeStatus: employee.status,
        paidMonthCount,
        wages,
        federalIncomeTax,
        socialSecurityTax,
        medicareTax,
        stateWages,
        stateIncomeTax,
        filingStatus: paidMonthCount > 0 ? "Ready" : "Estimated",
      };
    });
  }, [employees, payrollPayments, reportW2YearMonths]);

  const reportW2Totals = useMemo(
    () =>
      reportW2Rows.reduce(
        (acc, row) => ({
          employeeCount: acc.employeeCount + 1,
          paidEmployees: acc.paidEmployees + (row.paidMonthCount > 0 ? 1 : 0),
          wages: acc.wages + row.wages,
          federalIncomeTax: acc.federalIncomeTax + row.federalIncomeTax,
          socialSecurityTax: acc.socialSecurityTax + row.socialSecurityTax,
          medicareTax: acc.medicareTax + row.medicareTax,
        }),
        { employeeCount: 0, paidEmployees: 0, wages: 0, federalIncomeTax: 0, socialSecurityTax: 0, medicareTax: 0 },
      ),
    [reportW2Rows],
  );

  const report1099YearPayments = useMemo(
    () => scopedVendorPayments.filter((payment) => payment.year === selectedReportYear),
    [scopedVendorPayments, selectedReportYear],
  );

  const report1099Rows = useMemo<Report1099Row[]>(
    () =>
      scopedVendors.map((vendor) => {
        const vendorPaymentsTotal = report1099YearPayments
          .filter((payment) => payment.vendorId === vendor.vendorId)
          .reduce((sum, payment) => sum + payment.amount, 0);
        const is1099Eligible = vendorNeeds1099(vendor.entityType);
        const filingStatus = is1099Eligible && vendorPaymentsTotal >= 600 ? "MUST FILE" : "OK";
        const lifecycleKey = `${activeCompanyId}-${selectedReportYear}-${vendor.vendorId}`;

        const thresholdProgress = Math.min((vendorPaymentsTotal / 600) * 100, 100);
        const thresholdRemaining = Math.max(600 - vendorPaymentsTotal, 0);

        return {
          ...vendor,
          totalPaid: vendorPaymentsTotal,
          is1099Eligible,
          filingStatus: filingStatus as "MUST FILE" | "OK",
          lifecycleStatus: filingLifecycle[lifecycleKey] ?? "Not Started",
          thresholdProgress,
          thresholdRemaining,
        };
      }),
    [activeCompanyId, filingLifecycle, report1099YearPayments, scopedVendors, selectedReportYear],
  );

  const report1099QuarterTotals = useMemo(
    () =>
      report1099YearPayments.reduce(
        (acc, payment) => {
          acc[payment.quarter] += payment.amount;
          return acc;
        },
        { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
      ),
    [report1099YearPayments],
  );

  const vendorFormValidation = useMemo(() => {
    const tinValid = vendorForm.taxId ? validateTinFormat(vendorForm.taxIdType, vendorForm.taxId) : false;
    const zipValid = vendorForm.zipCode ? isZipMatchingState(vendorForm.state, vendorForm.zipCode) : false;
    const isExemptEntity = !vendorNeeds1099(vendorForm.entityType);

    return {
      tinValid,
      zipValid,
      isExemptEntity,
    };
  }, [vendorForm.entityType, vendorForm.state, vendorForm.taxId, vendorForm.taxIdType, vendorForm.zipCode]);

  const reportKnownVendorIds = useMemo(() => new Set(scopedVendors.map((vendor) => vendor.vendorId)), [scopedVendors]);

  const reportUnallocatedPayments = useMemo(
    () => report1099YearPayments.filter((payment) => !reportKnownVendorIds.has(payment.vendorId)),
    [report1099YearPayments, reportKnownVendorIds],
  );

  const reportReconciliationTotals = useMemo(() => {
    const totalDisbursed = report1099YearPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const mappedPayments = report1099YearPayments
      .filter((payment) => reportKnownVendorIds.has(payment.vendorId))
      .reduce((sum, payment) => sum + payment.amount, 0);
    const required1099Total = report1099Rows
      .filter((row) => row.filingStatus === "MUST FILE")
      .reduce((sum, row) => sum + row.totalPaid, 0);

    return {
      totalDisbursed,
      mappedPayments,
      required1099Total,
      unallocatedAmount: totalDisbursed - mappedPayments,
      non1099Amount: mappedPayments - required1099Total,
    };
  }, [report1099Rows, report1099YearPayments, reportKnownVendorIds]);

  const reportPeriodLabel = `${selectedReportYear} Annual Window`;
  const reportGeneratedOn = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });
  const reportGeneratedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const reportReference = `TC360-${(reportFocus ?? "pending").toUpperCase()}-${reportDocumentType.toUpperCase()}-${selectedReportYear}`;

  const onEmployeeFieldChange = (field: keyof typeof employeeForm, value: string) => {
    setEmployeeForm((prev) => ({ ...prev, [field]: value }));
  };

  const onVendorFieldChange = (field: keyof typeof vendorForm, value: string) => {
    setVendorFormMessage("");
    setVendorForm((prev) => ({ ...prev, [field]: value }));
  };

  const onPaymentFieldChange = (field: keyof typeof paymentForm, value: string) => {
    setPaymentFormMessage("");
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const onCitySelectChange = (value: string) => {
    if (!value) {
      setEmployeeForm((prev) => ({ ...prev, city: "", state: "" }));
      return;
    }

    const [city, state] = value.split("|");
    setEmployeeForm((prev) => ({ ...prev, city, state }));
  };

  const handleAddEmployee = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check subscription limit
    if (!canAddEmployee) {
      setAuthMessage(upgradeMessage || "Employee limit reached. Please upgrade your plan.");
      setAuthMessageType("error");
      return;
    }

    const firstName = employeeForm.firstName.trim();
    const lastName = employeeForm.lastName.trim();
    const grossPay = Number(employeeForm.grossPay);

    if (!firstName || !lastName || Number.isNaN(grossPay) || grossPay <= 0) return;

    // If user has a company_id, save to Supabase
    if (supabaseUser?.company_id) {
      const { data, error } = await supabaseEmployeeService.createEmployee({
        company_id: supabaseUser.company_id,
        employee_id: Date.now().toString(),
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
        ssn: employeeForm.ssn.trim(),
        department: employeeForm.department.trim(),
        job_title: employeeForm.jobTitle.trim(),
        hire_date: employeeForm.hireDate.trim(),
        gross_pay: grossPay,
        address: employeeForm.address.trim(),
        city: employeeForm.city.trim(),
        state: employeeForm.state.trim(),
        zip: employeeForm.zipCode.trim(),
        status: "Active",
      });

      if (error) {
        console.error('Error creating employee:', error);
        return;
      }

      if (data) {
        // Convert to EmployeeRow format and add to local state
        const newEmployee: EmployeeRow = {
          id: parseInt(data.employee_id) || 0,
          firstName: data.first_name,
          lastName: data.last_name,
          fullName: `${data.first_name} ${data.last_name}`,
          ssn: data.ssn,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zip,
          department: data.department,
          jobTitle: data.job_title,
          hireDate: data.hire_date,
          grossPay: data.gross_pay,
          status: data.status as EmployeeStatus,
        };
        setEmployees((prev) => [...prev, newEmployee]);
      }
    } else {
      // Fallback to local state if no company_id
      const nextId = employees.length > 0 ? Math.max(...employees.map((row) => row.id)) + 1 : 1;
      const nextEmployee: EmployeeRow = {
        id: nextId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        ssn: employeeForm.ssn.trim(),
        address: employeeForm.address.trim(),
        city: employeeForm.city.trim(),
        state: employeeForm.state.trim(),
        zipCode: employeeForm.zipCode.trim(),
        department: employeeForm.department.trim(),
        jobTitle: employeeForm.jobTitle.trim(),
        hireDate: employeeForm.hireDate.trim(),
        grossPay,
        status: "Active",
      };

      setEmployees((prev) => [...prev, nextEmployee]);
    }

    setEmployeeForm(employeeFormTemplate);
    setIsAddFormOpen(false);
  };

  const handleAddVendor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check subscription limit
    if (!canAddVendor) {
      setVendorFormMessage(upgradeMessage || "Vendor limit reached. Please upgrade your plan.");
      return;
    }

    const vendorId = vendorForm.vendorId.trim().toUpperCase();
    const legalName = vendorForm.legalName.trim();
    const taxId = vendorForm.taxId.trim();
    const zipCode = vendorForm.zipCode.trim();

    if (!vendorId || !legalName || !taxId || !vendorForm.state || !zipCode) {
      setVendorFormMessage("Complete vendor ID, legal name, state, ZIP code, and tax ID before saving.");
      return;
    }

    if (!validateTinFormat(vendorForm.taxIdType, taxId)) {
      setVendorFormMessage(`Tax ID format is invalid for ${vendorForm.taxIdType}.`);
      return;
    }

    if (!isZipMatchingState(vendorForm.state, zipCode)) {
      setVendorFormMessage("ZIP code does not match the selected state profile.");
      return;
    }

    const vendorExists = vendors.some((vendor) => vendor.vendorId === vendorId);
    if (vendorExists) {
      setVendorFormMessage(`Vendor ID ${vendorId} already exists.`);
      return;
    }

    // If user has a company_id, save to Supabase
    if (supabaseUser?.company_id) {
      const { data, error } = await supabaseVendorService.createVendor({
        company_id: supabaseUser.company_id,
        vendor_id: vendorId,
        legal_name: legalName,
        address: vendorForm.address.trim(),
        zip: zipCode,
        email: vendorForm.email.trim(),
        state: vendorForm.state,
        category: vendorForm.category as 'Consulting' | 'Professional Services' | 'Contractor' | 'Other',
        tax_id_type: vendorForm.taxIdType,
        tax_id: taxId,
        entity_type: vendorForm.entityType,
        tin_verification_status: isTinMatchedToVendorName({ legalName, taxIdType: vendorForm.taxIdType, taxId }) ? "Verified" : "Pending",
        w9_status: "Not Requested",
      });

      if (error) {
        console.error('Error creating vendor:', error);
        setVendorFormMessage("Failed to create vendor in database.");
        return;
      }

      if (data) {
        // Convert to VendorRow format and add to local state
        const newVendor: VendorRow = {
          companyId: data.company_id,
          vendorId: data.vendor_id,
          legalName: data.legal_name,
          address: data.address,
          zipCode: data.zip,
          email: data.email,
          phone: "",
          state: data.state,
          category: data.category as VendorCategory,
          taxIdType: data.tax_id_type,
          taxId: data.tax_id,
          entityType: data.entity_type,
          tinVerification: data.tin_verification_status === "Verified" ? "Verified" : "Invalid",
          onboardingSource: "Manual",
          w9RequestStatus: data.w9_status === "Received" ? "Signed" : "Not Requested",
        };
        setVendors((prev) => [...prev, newVendor]);
      }
    } else {
      // Fallback to local state if no company_id
      const nextVendor: VendorRow = {
        companyId: activeCompanyId,
        vendorId,
        legalName,
        address: vendorForm.address.trim(),
        zipCode,
        email: vendorForm.email.trim(),
        phone: vendorForm.phone.trim(),
        state: vendorForm.state,
        category: vendorForm.category,
        taxIdType: vendorForm.taxIdType,
        taxId,
        entityType: vendorForm.entityType,
        tinVerification: isTinMatchedToVendorName({ legalName, taxIdType: vendorForm.taxIdType, taxId }) ? "Verified" : "Invalid",
        onboardingSource: "Manual",
        w9RequestStatus: "Not Requested",
      };

      setVendors((prev) => [...prev, nextVendor]);
    }

    setVendorForm(vendorFormTemplate);
    setVendorFormMessage("");
    setTinCheckMessage(
      `${vendorId} saved. ${vendorNeeds1099(vendorForm.entityType) ? "Entity requires 1099 threshold tracking." : "Entity is usually 1099-exempt."}`,
    );
    setSelected1099VendorId(vendorId);
    setIsVendorFormOpen(false);
  };

  const handleValidateTin = (vendorId: string) => {
    setVendors((prev) =>
      prev.map((vendor) => {
        if (vendor.vendorId !== vendorId) {
          return vendor;
        }

        const isValid = isTinMatchedToVendorName(vendor);
        return {
          ...vendor,
          tinVerification: isValid ? "Verified" : "Invalid",
        };
      }),
    );

    const vendor = vendors.find((item) => item.vendorId === vendorId);
    if (vendor) {
      const hasRegistryRecord = hasMockTinRegistryRecord(vendor.taxId);
      const isValid = isTinMatchedToVendorName(vendor);
      setTinCheckMessage(
        `${vendor.vendorId}: ${
          isValid
            ? hasRegistryRecord
              ? "TIN matched with vendor legal name."
              : "TIN format valid (no IRS registry record cached)."
            : "TIN mismatch. Legal name and tax ID do not align."
        }`,
      );
    }
  };

  const handleRequestW9 = (vendorId: string) => {
    const vendor = vendors.find((item) => item.vendorId === vendorId);
    if (!vendor) {
      return;
    }

    const token = `w9-${Math.random().toString(36).slice(2, 10)}`;
    const nowIso = new Date().toISOString();
    const invite: OnboardingInvite = {
      id: `${Date.now()}-${vendor.vendorId}`,
      companyId: activeCompanyId,
      token,
      createdAt: nowIso,
      status: "Completed",
    };

    const submission: OnboardingSubmission = {
      id: `${Date.now()}-${vendor.vendorId}-submission`,
      inviteToken: token,
      companyId: activeCompanyId,
      legalName: vendor.legalName,
      email: vendor.email,
      address: vendor.address,
      state: vendor.state,
      taxIdType: vendor.taxIdType,
      taxId: vendor.taxId,
      entityType: vendor.entityType,
      eSigned: true,
      signatureDate: nowIso,
      submittedAt: nowIso,
      approvalStatus: "Approved",
    };

    setOnboardingInvites((prev) => [invite, ...prev]);
    setOnboardingSubmissions((prev) => [submission, ...prev]);
    setVendors((prev) =>
      prev.map((row) =>
        row.vendorId === vendorId
          ? {
              ...row,
              onboardingSource: "W-9 Intake",
              w9RequestStatus: "Signed",
              w9SignedAt: nowIso,
              tinVerification: isTinMatchedToVendorName(row) ? "Verified" : "Invalid",
            }
          : row,
      ),
    );
    setW9RequestMessage(`W-9 request emailed to ${vendor.email}. Vendor submitted and e-signed successfully.`);
  };

  const handleAssignUnallocatedPayment = (paymentId: number) => {
    const selectedVendorId = reconciliationAssignByPaymentId[paymentId];
    if (!selectedVendorId) {
      setReconciliationMessage("Choose a vendor before assigning the payment.");
      return;
    }

    const selectedVendor = scopedVendors.find((vendor) => vendor.vendorId === selectedVendorId);
    if (!selectedVendor) {
      setReconciliationMessage("Selected vendor no longer exists in this company scope.");
      return;
    }

    setVendorPayments((prev) =>
      prev.map((payment) =>
        payment.id === paymentId
          ? {
              ...payment,
              vendorId: selectedVendor.vendorId,
              paymentState: selectedVendor.state,
            }
          : payment,
      ),
    );

    setReconciliationAssignByPaymentId((prev) => {
      const next = { ...prev };
      delete next[paymentId];
      return next;
    });
    setReconciliationMessage(`Payment #${paymentId} mapped to ${selectedVendor.vendorId}.`);
  };

  const handleAddVendorPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amount = Number(paymentForm.amount);
    const normalizedVendorId = paymentForm.vendorId || "UNASSIGNED";
    if (
      !paymentForm.paymentDate ||
      !paymentForm.invoiceNumber.trim() ||
      !paymentForm.paymentState ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      setPaymentFormMessage("Complete date, invoice number, amount, and payment state before saving.");
      return;
    }

    if (paymentDuplicateCandidates.length > 0) {
      const proceed = window.confirm(
        "Potential duplicate detected for this vendor (same invoice or amount in a close date range). Continue anyway?",
      );
      if (!proceed) {
        setPaymentFormMessage("Duplicate warning acknowledged. Review potential duplicates before saving.");
        return;
      }
    }

    const year = paymentForm.paymentDate.split("-")[0];
    const withholdingRate = getStateWithholdingRate(paymentForm.paymentState);
    const stateWithholding = amount * withholdingRate;
    const attachmentUrl = paymentAttachment ? URL.createObjectURL(paymentAttachment) : undefined;
    
    // If user has a company_id, save to Supabase
    if (supabaseUser?.company_id) {
      const { data, error } = await supabasePaymentService.createPayment({
        company_id: supabaseUser.company_id,
        vendor_id: normalizedVendorId,
        payment_date: paymentForm.paymentDate,
        invoice_number: paymentForm.invoiceNumber.trim(),
        amount,
        payment_state: paymentForm.paymentState,
      });

      if (error) {
        console.error('Error creating payment:', error);
        setPaymentFormMessage("Failed to create payment in database.");
        return;
      }

      if (data) {
        // Convert to VendorPaymentRow format and add to local state
        const month = new Date(paymentForm.paymentDate).getMonth() + 1;
        const quarterNum = Math.ceil(month / 3);
        const quarter = `Q${quarterNum}` as "Q1" | "Q2" | "Q3" | "Q4";
        
        const newPayment: VendorPaymentRow = {
          id: parseInt(data.id) || 0,
          companyId: data.company_id,
          vendorId: data.vendor_id,
          amount: data.amount,
          paymentDate: data.payment_date,
          invoiceNumber: data.invoice_number,
          paymentState: data.payment_state,
          stateWithholding,
          year,
          quarter,
          attachmentName: paymentAttachment?.name,
          attachmentUrl,
        };
        setVendorPayments((prev) => [...prev, newPayment]);
      }
    } else {
      // Fallback to local state if no company_id
      const nextPayment: VendorPaymentRow = {
        companyId: activeCompanyId,
        id: vendorPayments.length > 0 ? Math.max(...vendorPayments.map((payment) => payment.id)) + 1 : 1,
        vendorId: normalizedVendorId,
        paymentDate: paymentForm.paymentDate,
        invoiceNumber: paymentForm.invoiceNumber.trim(),
        amount,
        paymentState: paymentForm.paymentState,
        stateWithholding,
        year,
        quarter: getQuarterFromDate(paymentForm.paymentDate),
        attachmentName: paymentAttachment?.name,
        attachmentUrl,
      };

      setVendorPayments((prev) => [...prev, nextPayment]);
    }

    if (paymentAttachment) {
      setVendorDocuments((prev) => [
        ...prev,
        {
          id: prev.length > 0 ? Math.max(...prev.map((document) => document.id)) + 1 : 1,
          companyId: activeCompanyId,
          vendorId: normalizedVendorId,
          category: "Invoice",
          fileName: paymentAttachment.name,
          fileUrl: attachmentUrl,
          uploadedAt: new Date().toISOString(),
          note: `Attached from payment ${paymentForm.invoiceNumber.trim()}`,
        },
      ]);
    }
    setPaymentForm((prev) => ({
      ...paymentFormTemplate,
      vendorId: prev.vendorId || paymentForm.vendorId,
      paymentState: prev.paymentState || paymentForm.paymentState,
      paymentDate: "",
      amount: "",
      invoiceNumber: "",
    }));
    setPaymentAttachment(null);
    if (normalizedVendorId === "UNASSIGNED") {
      setEfileMessage("One payment was saved as unallocated. Review Tax Reconciliation before filing.");
    }
    setPaymentFormMessage("");
    setSelected1099Year(year);
    setIsPaymentFormOpen(false);
    setInvoiceScanMessage("");
    setInvoiceOcrText("");
  };

  const extractInvoiceData = (rawText: string) => {
    const text = rawText.replace(/\s+/g, " ");
    const invoiceMatch = text.match(/(?:invoice|inv)\s*(?:#|no\.?|number)?\s*[:\-]?\s*([a-z0-9-]+)/i);
    const amountMatch = text.match(/(?:amount|total|balance due|payment)\s*[:\-]?\s*\$?([0-9,]+(?:\.\d{2})?)/i) ??
      text.match(/\$\s*([0-9,]+(?:\.\d{2})?)/);
    const isoDateMatch = text.match(/(20\d{2}-\d{2}-\d{2})/);
    const usDateMatch = text.match(/(\d{1,2}\/\d{1,2}\/20\d{2})/);

    const normalizedText = text.toLowerCase();
    const matchedVendor = scopedVendors.find((vendor) => normalizedText.includes(vendor.legalName.toLowerCase()));

    const parsedDate = (() => {
      if (isoDateMatch) return isoDateMatch[1];
      if (!usDateMatch) return "";
      const [month, day, year] = usDateMatch[1].split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    })();

    return {
      invoiceNumber: invoiceMatch?.[1]?.toUpperCase() ?? "",
      amount: amountMatch?.[1]?.replace(/,/g, "") ?? "",
      paymentDate: parsedDate,
      vendorId: matchedVendor?.vendorId ?? "",
    };
  };

  const handleAutoScanInvoice = async () => {
    let scanSourceText = invoiceOcrText;

    if (!scanSourceText && paymentAttachment) {
      const fileName = paymentAttachment.name;
      if (paymentAttachment.type.startsWith("text/")) {
        scanSourceText = await paymentAttachment.text();
      } else {
        scanSourceText = fileName;
      }
    }

    if (!scanSourceText.trim()) {
      setInvoiceScanMessage("Upload an invoice or paste OCR text to run auto-scan.");
      return;
    }

    const parsed = extractInvoiceData(scanSourceText);
    setPaymentForm((prev) => ({
      ...prev,
      vendorId: parsed.vendorId || prev.vendorId,
      invoiceNumber: parsed.invoiceNumber || prev.invoiceNumber,
      amount: parsed.amount || prev.amount,
      paymentDate: parsed.paymentDate || prev.paymentDate,
      paymentState:
        scopedVendors.find((vendor) => vendor.vendorId === (parsed.vendorId || prev.vendorId))?.state || prev.paymentState,
    }));

    setInvoiceScanMessage("Invoice auto-scan completed. Review fields before saving.");
  };

  const handleCreateOnboardingLink = () => {
    const token = `w9-${Math.random().toString(36).slice(2, 10)}`;
    const invite: OnboardingInvite = {
      id: `${Date.now()}`,
      companyId: activeCompanyId,
      token,
      createdAt: new Date().toISOString(),
      status: "Open",
    };

    setOnboardingInvites((prev) => [invite, ...prev]);
    setActiveOnboardingToken(token);
    setW9Form(w9FormTemplate);
    setIsSelfOnboardingOpen(true);
  };

  const handleStartSelfOnboarding = (token: string) => {
    setActiveOnboardingToken(token);
    setW9Form(w9FormTemplate);
    setIsSelfOnboardingOpen(true);
  };

  const handleApproveOnboardingSubmission = (submissionId: string) => {
    const submission = onboardingSubmissions.find((item) => item.id === submissionId);
    if (!submission) return;

    const nextVendorNumber =
      scopedVendors.length > 0
        ? Math.max(...scopedVendors.map((vendor) => Number(vendor.vendorId.replace(/[^0-9]/g, "") || "0"))) + 1
        : 1001;
    const generatedVendorId = `V-${String(nextVendorNumber).padStart(4, "0")}`;

    const nextVendor: VendorRow = {
      companyId: submission.companyId,
      vendorId: generatedVendorId,
      legalName: submission.legalName,
      address: submission.address,
      zipCode: "",
      email: submission.email,
      phone: "",
      state: submission.state,
      category: "Consulting",
      taxIdType: submission.taxIdType,
      taxId: submission.taxId,
      entityType: submission.entityType,
      tinVerification: isTinMatchedToVendorName({ legalName: submission.legalName, taxIdType: submission.taxIdType, taxId: submission.taxId })
        ? "Verified"
        : "Invalid",
      onboardingSource: "W-9 Intake",
      w9RequestStatus: submission.eSigned ? "Signed" : "Sent",
      w9SignedAt: submission.signatureDate,
    };

    setVendors((prev) => [...prev, nextVendor]);
    setOnboardingSubmissions((prev) =>
      prev.map((item) => (item.id === submissionId ? { ...item, approvalStatus: "Approved" } : item)),
    );
    setSelected1099VendorId(generatedVendorId);
  };

  const handleVendorDocUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vendorDocForm.vendorId || !vendorDocFile) return;

    const nextDocument: VendorDocument = {
      id: vendorDocuments.length > 0 ? Math.max(...vendorDocuments.map((document) => document.id)) + 1 : 1,
      companyId: activeCompanyId,
      vendorId: vendorDocForm.vendorId,
      category: vendorDocForm.category,
      fileName: vendorDocFile.name,
      fileUrl: URL.createObjectURL(vendorDocFile),
      uploadedAt: new Date().toISOString(),
      note: vendorDocForm.note.trim(),
    };

    setVendorDocuments((prev) => [nextDocument, ...prev]);
    setVendorDocFile(null);
    setVendorDocForm({ vendorId: vendorDocForm.vendorId, category: vendorDocForm.category, note: "" });
  };

  const updateVendorFilingLifecycle = (vendorId: string, status: FilingLifecycleStatus) => {
    const lifecycleKey = `${activeCompanyId}-${selected1099Year}-${vendorId}`;
    setFilingLifecycle((prev) => ({
      ...prev,
      [lifecycleKey]: status,
    }));
  };

  const handleExportIrsPackage = () => {
    const eligibleRows = vendorDashboardRows.filter((row) => row.filingStatus === "MUST FILE");
    if (eligibleRows.length === 0) {
      setEfileMessage(`No MUST FILE vendors for ${selected1099Year}.`);
      return;
    }

    const txtRows = [
      `PAYER|${employerProfile.legalName}|${employerProfile.ein}|${selected1099Year}`,
      ...eligibleRows.map(
        (row) =>
          `RECIPIENT|${row.vendorId}|${row.legalName}|${row.taxIdType}|${row.taxId}|${row.state}|${row.totalPaid.toFixed(2)}`,
      ),
    ];

    const xmlRows = [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<Publication1220Package taxYear="${selected1099Year}">`,
      `  <Payer ein="${employerProfile.ein}" legalName="${employerProfile.legalName}" />`,
      ...eligibleRows.map(
        (row) =>
          `  <Recipient vendorId="${row.vendorId}" legalName="${row.legalName}" taxIdType="${row.taxIdType}" taxId="${row.taxId}" state="${row.state}" nonemployeeCompensation="${row.totalPaid.toFixed(2)}" />`,
      ),
      `</Publication1220Package>`,
    ];

    const txtBlob = new Blob([txtRows.join("\n")], { type: "text/plain" });
    const xmlBlob = new Blob([xmlRows.join("\n")], { type: "application/xml" });
    const txtUrl = URL.createObjectURL(txtBlob);
    const xmlUrl = URL.createObjectURL(xmlBlob);

    const txtLink = document.createElement("a");
    txtLink.href = txtUrl;
    txtLink.download = `PUB1220_1099_${selected1099Year}.txt`;
    txtLink.click();

    const xmlLink = document.createElement("a");
    xmlLink.href = xmlUrl;
    xmlLink.download = `PUB1220_1099_${selected1099Year}.xml`;
    xmlLink.click();

    setEfileMessage(`Publication 1220 package exported for ${eligibleRows.length} vendors.`);

    window.setTimeout(() => {
      URL.revokeObjectURL(txtUrl);
      URL.revokeObjectURL(xmlUrl);
    }, 60000);
  };

  const handleSendComplianceReminder = (channel: CommunicationChannel, vendorId?: string) => {
    const targets = vendorId ? communicationQueueRows.filter((row) => row.vendorId === vendorId) : communicationQueueRows;
    if (targets.length === 0) {
      setCommunicationBanner("No pending vendors need compliance reminders right now.");
      return;
    }

    const sentAt = new Date().toISOString();
    const logs: ComplianceMessageLog[] = targets.map((target) => ({
      id: `${Date.now()}-${target.vendorId}-${channel}`,
      vendorId: target.vendorId,
      channel,
      sentAt,
      template: `Compliance reminder: ${target.reason}`,
      status: "Sent",
    }));

    setComplianceMessageLog((prev) => [...logs, ...prev].slice(0, 80));
    setCommunicationBanner(`${channel} reminder sent to ${targets.length} vendor(s).`);
  };

  const handleExportTaxDeadlinesCalendar = () => {
    const nextYear = Number(selected1099Year) + 1;
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TaxCore360//Tax Deadlines//EN",
      "CALSCALE:GREGORIAN",
      `BEGIN:VEVENT`,
      `UID:tc360-1099-${selected1099Year}@taxcore360`,
      `SUMMARY:1099-NEC Filing Deadline`,
      `DTSTART;VALUE=DATE:${nextYear}0131`,
      `DTEND;VALUE=DATE:${nextYear}0201`,
      `DESCRIPTION:Submit Form 1099-NEC to IRS/SSA workflow by Jan 31.`,
      `END:VEVENT`,
      `BEGIN:VEVENT`,
      `UID:tc360-941-${selected1099Year}@taxcore360`,
      `SUMMARY:Quarterly Form 941 Due`,
      `DTSTART;VALUE=DATE:${nextYear}0131`,
      `DTEND;VALUE=DATE:${nextYear}0201`,
      `DESCRIPTION:Quarterly federal payroll filing due.`,
      `END:VEVENT`,
      "END:VCALENDAR",
    ];

    const icsBlob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const icsUrl = URL.createObjectURL(icsBlob);
    const link = document.createElement("a");
    link.href = icsUrl;
    link.download = `Tax_Deadlines_${selected1099Year}.ics`;
    link.click();
    setEfileMessage("Calendar file exported. Import it into Google Calendar to sync tax deadlines.");

    window.setTimeout(() => {
      URL.revokeObjectURL(icsUrl);
    }, 60000);
  };

  const handleExportAuditZip = async () => {
    const zip = new JSZip();
    const rowsToCsv = (rows: string[][]) => rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");

    const vendorCsvRows = [
      ["Vendor ID", "Legal Name", "Category", "Email", "State", "Tax ID Type", "Tax ID", "TIN Status", "W-9 Status"],
      ...scopedVendors.map((vendor) => [
        vendor.vendorId,
        vendor.legalName,
        vendor.category,
        vendor.email,
        vendor.state,
        vendor.taxIdType,
        vendor.taxId,
        vendor.tinVerification,
        vendor.w9RequestStatus ?? "Not Requested",
      ]),
    ];

    const paymentCsvRows = [
      ["Payment Date", "Vendor ID", "Invoice", "Amount", "State", "Withholding", "Quarter", "Year"],
      ...scopedVendorPayments.map((payment) => [
        payment.paymentDate,
        payment.vendorId,
        payment.invoiceNumber,
        payment.amount.toFixed(2),
        payment.paymentState,
        payment.stateWithholding.toFixed(2),
        payment.quarter,
        payment.year,
      ]),
    ];

    zip.file("01_Vendors/vendors.csv", rowsToCsv(vendorCsvRows));
    zip.file("02_Payments/payments.csv", rowsToCsv(paymentCsvRows));
    zip.file(
      "03_W9/status.txt",
      scopedVendors
        .map((vendor) => `${vendor.vendorId} | ${vendor.legalName} | ${vendor.w9RequestStatus ?? "Not Requested"}`)
        .join("\n"),
    );
    zip.file(
      "04_1099/filing_status.txt",
      vendorDashboardRows.map((row) => `${row.vendorId} | ${row.filingStatus} | ${toUsd(row.totalPaid)}`).join("\n"),
    );

    scopedVendorDocuments.forEach((document) => {
      zip.file(`05_Documents/${document.vendorId}/${document.fileName}.txt`, `Reference: ${document.fileName}\nNote: ${document.note}`);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const zipUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = zipUrl;
    link.download = `Audit_Ready_Package_${selected1099Year}.zip`;
    link.click();
    setEfileMessage("Audit-ready ZIP package generated with vendors, payments, W-9 status, and 1099 status.");

    window.setTimeout(() => {
      URL.revokeObjectURL(zipUrl);
    }, 60000);
  };

  const handleBrandLogoUpload = (file: File | null) => {
    if (!file) {
      return;
    }

    setBrandLogoUrl(URL.createObjectURL(file));
    setBrandLogoName(file.name);
    setCommunicationBanner("White-label logo updated. It will appear in printed reports and forms.");
  };

  const handleSign1099Form = () => {
    const signer = formSignerName.trim();
    if (!selected1099VendorId || !signer) {
      return;
    }

    setFormSignatureLedger((prev) => ({
      ...prev,
      [selected1099SignatureKey]: {
        signedBy: signer,
        signedAt: new Date().toISOString(),
      },
    }));
    setCommunicationBanner(`1099 digital signature captured for ${selected1099VendorId} (${selected1099Year}).`);
  };

  const handleBulkPayrollPay = async () => {
    const targetPayDate = bulkPayDate || getDefaultPaymentDate(selectedPayrollMonth);

    // If user has a company_id, save to Supabase
    if (supabaseUser?.company_id) {
      for (const employee of activeEmployees) {
        const paymentMethod = bulkPaymentMethod === "Bank Transfer" ? "Direct Deposit" : "Check";
        
        const { error } = await supabasePayrollService.createPayrollPayment({
          company_id: supabaseUser.company_id,
          employee_id: employee.id.toString(),
          payroll_month: selectedPayrollMonth,
          gross_pay: employee.grossPay,
          federal_tax: employee.grossPay * 0.15, // Simplified calculation
          state_tax: employee.grossPay * 0.05, // Simplified calculation
          social_security: employee.grossPay * 0.062, // Simplified calculation
          medicare: employee.grossPay * 0.0145, // Simplified calculation
          net_pay: employee.grossPay * 0.7235, // Simplified calculation
          payment_method: paymentMethod,
          status: "Paid",
          pay_date: targetPayDate,
        });

        if (error) {
          console.error('Error creating payroll payment:', error);
        }
      }
    }

    setPayrollPayments((prev) => {
      const next = { ...prev };

      activeEmployees.forEach((employee) => {
        const paymentKey = getPayrollPaymentKey(employee.id, selectedPayrollMonth);
        const existingPayment =
          prev[paymentKey] ??
          ({
            paymentMethod: bulkPaymentMethod,
            payDate: targetPayDate,
            isPaid: false,
          } as PayrollPaymentRecord);

        next[paymentKey] = {
          paymentMethod: existingPayment.paymentMethod,
          payDate: targetPayDate,
          // Paid state is tracked per employee and month.
          isPaid: true,
        };
      });

      return next;
    });
  };

  const handleRowPaymentMethodChange = (employeeId: number, paymentMethod: PaymentMethod) => {
    const paymentKey = getPayrollPaymentKey(employeeId, selectedPayrollMonth);

    setPayrollPayments((prev) => {
      const existingPayment =
        prev[paymentKey] ??
        ({
          paymentMethod: bulkPaymentMethod,
          payDate: bulkPayDate || getDefaultPaymentDate(selectedPayrollMonth),
          isPaid: false,
        } as PayrollPaymentRecord);

      return {
        ...prev,
        [paymentKey]: {
          ...existingPayment,
          paymentMethod,
        },
      };
    });
  };

  const handleGenerateOfficialW2Pdf = async () => {
    if (!selectedW2Employee) {
      return;
    }

    // Validate SSN format
    const ssnClean = selectedW2Employee.ssn.replace(/\D/g, '');
    if (ssnClean.length !== 9) {
      alert("Invalid SSN format. Please use XXX-XX-XXXX format.");
      return;
    }

    // Validate EIN format
    const einClean = employerProfile.ein.replace(/\D/g, '');
    if (einClean.length !== 9) {
      alert("Invalid EIN format. Please use XX-XXXXXXX format.");
      return;
    }

    setIsGeneratingOfficialW2(true);

    const pdfSources = [
      { url: "https://www.irs.gov/pub/irs-pdf/fw2.pdf", label: "official" },
      { url: "https://www.irs.gov/pub/irs-dft/fw2--dft.pdf", label: "draft fallback" },
    ] as const;

    const employerAddress = `${employerProfile.addressLine1}, ${employerProfile.addressLine2}`;
    const employeeAddress = `${selectedW2Employee.address}, ${selectedW2Employee.city}, ${selectedW2Employee.state} ${selectedW2Employee.zipCode}`;
    const stateCode = selectedW2Employee.state.slice(0, 2).toUpperCase();
    
    // Format SSN and EIN
    const formattedSSN = `${ssnClean.slice(0, 3)}-${ssnClean.slice(3, 5)}-${ssnClean.slice(5)}`;
    const formattedEIN = `${einClean.slice(0, 2)}-${einClean.slice(3)}`;
    
    const fieldValues = {
      employeeSsn: formattedSSN,
      employerEin: formattedEIN,
      employerNameAddress: `${employerProfile.legalName} | ${employerAddress}`,
      employeeName: selectedW2Employee.fullName,
      controlNumber: `${employerProfile.controlNumber}-${selectedW2Employee.id}`,
      employeeAddress,
      box1: toW2Amount(selectedW2Amounts.wages),
      box2: toW2Amount(selectedW2Amounts.federalIncomeTax),
      box3: toW2Amount(selectedW2Amounts.socialSecurityWages),
      box4: toW2Amount(selectedW2Amounts.socialSecurityTax),
      box5: toW2Amount(selectedW2Amounts.medicareWages),
      box6: toW2Amount(selectedW2Amounts.medicareTax),
      box7: toW2Amount(0), // Social security tips
      box8: toW2Amount(0), // Allocated tips
      box9: "", // Verification code
      box10: toW2Amount(0), // Dependent care benefits
      box11: toW2Amount(0), // Nonqualified plans
      box12aCode: "D",
      box12aAmount: toW2Amount(selectedW2Amounts.wages * 0.03),
      box12bCode: "",
      box12bAmount: toW2Amount(0),
      box12cCode: "",
      box12cAmount: toW2Amount(0),
      box12dCode: "",
      box12dAmount: toW2Amount(0),
      box13: "", // Statutory employee, retirement plan, third-party sick pay
      box14: `${selectedW2Employee.department} - ${selectedW2Employee.jobTitle}`,
      box15: stateCode,
      box16: toW2Amount(selectedW2Amounts.stateWages),
      box17: toW2Amount(selectedW2Amounts.stateIncomeTax),
      box18: toW2Amount(0), // Local wages
      box19: toW2Amount(0), // Local income tax
      box20: "", // Local name
    } as const;

    try {
      let generatedBlobUrl = "";

      for (const source of pdfSources) {
        try {
          const response = await fetch(source.url);
          if (!response.ok) {
            continue;
          }

          const pdfBytes = await response.arrayBuffer();
          const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
          const form = pdfDoc.getForm();
          const fields = form.getFields();

          if (fields.length === 0) {
            continue;
          }

          const trySetFieldValue = (field: unknown, value: string) => {
            if (field instanceof PDFTextField) {
              field.setText(value);
              return true;
            }

            if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
              try {
                field.select(value);
                return true;
              } catch {
                return false;
              }
            }

            return false;
          };

          const setFieldsByAliases = (aliases: readonly string[], value: string) => {
            let updatedCount = 0;

            fields.forEach((field) => {
              const acroField = (field as { acroField?: { getAlternateName?: () => string; getPartialName?: () => string } }).acroField;
              const descriptors = [field.getName(), acroField?.getAlternateName?.() ?? "", acroField?.getPartialName?.() ?? ""]
                .filter(Boolean)
                .map((token) => normalizeToken(token));

              const isMatch = aliases.some((alias) => descriptors.some((descriptor) => descriptor.includes(alias)));

              if (isMatch && trySetFieldValue(field, value)) {
                updatedCount += 1;
              }
            });

            return updatedCount;
          };

          const totalUpdatedFields = Object.entries(fieldValues).reduce((count, [key, value]) => {
            const aliases = w2FieldAliases[key as keyof typeof w2FieldAliases];
            return count + setFieldsByAliases(aliases, value);
          }, 0);

          if (totalUpdatedFields === 0) {
            continue;
          }

          const outputBytes = await pdfDoc.save();
          const outputArray = new Uint8Array(outputBytes);
          const outputBlob = new Blob([outputArray.buffer], { type: "application/pdf" });
          generatedBlobUrl = URL.createObjectURL(outputBlob);
          break;
        } catch {
          continue;
        }
      }

      if (!generatedBlobUrl) {
        return;
      }

      window.open(generatedBlobUrl, "_blank", "noopener,noreferrer");
      const downloadLink = document.createElement("a");
      downloadLink.href = generatedBlobUrl;
      downloadLink.download = `W2_${selectedW2Employee.lastName}_${selectedW2Year}.pdf`;
      downloadLink.click();

      window.setTimeout(() => {
        URL.revokeObjectURL(generatedBlobUrl);
      }, 60000);
    } finally {
      setIsGeneratingOfficialW2(false);
    }
  };

  const handlePrintReport = () => {
    if (viewMode === "reports" && !reportFocus) {
      return;
    }

    window.print();
  };

  const handleGenerateOfficialW3Pdf = async () => {
    // Validate EIN format
    const einClean = employerProfile.ein.replace(/\D/g, '');
    if (einClean.length !== 9) {
      alert("Invalid EIN format. Please use XX-XXXXXXX format.");
      return;
    }

    setIsGeneratingOfficialW2(true);

    const pdfSources = [
      { url: "https://www.irs.gov/pub/irs-pdf/fw3.pdf", label: "official" },
      { url: "https://www.irs.gov/pub/irs-dft/fw3--dft.pdf", label: "draft fallback" },
    ] as const;

    const employerAddress = `${employerProfile.addressLine1}, ${employerProfile.addressLine2}`;
    
    // Format EIN
    const formattedEIN = `${einClean.slice(0, 2)}-${einClean.slice(3)}`;
    
    const fieldValues = {
      employerEin: formattedEIN,
      employerName: employerProfile.legalName,
      employerAddress,
      kindOfPayer: "941", // Default to 941
      kindOfEmployer: "None apply", // Default
      box1: toW2Amount(w3Totals.wages),
      box2: toW2Amount(w3Totals.federalIncomeTax),
      box3: toW2Amount(w3Totals.socialSecurityWages),
      box4: toW2Amount(w3Totals.socialSecurityTax),
      box5: toW2Amount(w3Totals.medicareWages),
      box6: toW2Amount(w3Totals.medicareTax),
      box7: toW2Amount(0), // Social security tips
      box8: toW2Amount(0), // Allocated tips
      box9: "", // Verification code
      box10: toW2Amount(0), // Dependent care benefits
      box11: toW2Amount(0), // Nonqualified plans
      box12a: toW2Amount(0), // Box 12a
      box12b: toW2Amount(0), // Box 12b
      box12c: toW2Amount(0), // Box 12c
      box12d: toW2Amount(0), // Box 12d
      box13: "", // Statutory employee
      box14: "", // Other
      box15: "", // State
      box16: toW2Amount(w3Totals.stateWages),
      box17: toW2Amount(w3Totals.stateIncomeTax),
      box18: toW2Amount(0), // Local wages
      box19: toW2Amount(0), // Local income tax
      box20: "", // Local name
      totalForms: String(w3Totals.employeeCount),
      contactName: employerProfile.contactName || "Payroll Administrator",
      contactPhone: employerProfile.contactPhone || "",
      email: employerProfile.email || "",
      establishmentNumber: "",
      otherEIN: "",
      boxj: toW2Amount(0), // Social security tips
      boxk: toW2Amount(0), // Allocated tips
      boxl: toW2Amount(0), // Dependent care benefits
      boxm: toW2Amount(0), // Nonqualified plans
      boxn: toW2Amount(0), // Nontaxable elect. contributions
      boxo: toW2Amount(0), // Group-term life insurance
      boxp: toW2Amount(0), // 401(k) deferrals
      boxq: toW2Amount(0), // 403(b) deferrals
      boxr: toW2Amount(0), // Salary reduction contributions
      boxs: toW2Amount(0), // 408(p)(1) deferrals
      boxt: toW2Amount(0), // 401(a)(11) deferrals
      boxu: toW2Amount(0), // 408(k)(6) deferrals
      boxv: toW2Amount(0), // 402(g) deferrals
      boxw: toW2Amount(0), // 414(h)(2) deferrals
      boxx: toW2Amount(0), // Stock options
      boxy: toW2Amount(0), // Stock option income
      boxz: toW2Amount(0), // De minimis benefits
      boxaa: toW2Amount(0), // 409A deferrals
      boxab: toW2Amount(0), // 409A(v) deferrals
      boxac: toW2Amount(0), // Group-term life insurance over $50k
      boxad: toW2Amount(w3Totals.socialSecurityWages), // Social security tax wages
      boxae: toW2Amount(w3Totals.medicareWages), // Medicare tax wages
      boxaf: toW2Amount(0), // Additional Medicare tax wages
      boxag: toW2Amount(0), // Additional Medicare tax withheld
    } as const;

    try {
      let generatedBlobUrl = "";

      for (const source of pdfSources) {
        try {
          const response = await fetch(source.url);
          if (!response.ok) {
            continue;
          }

          const pdfBytes = await response.arrayBuffer();
          const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
          const form = pdfDoc.getForm();
          const fields = form.getFields();

          if (fields.length === 0) {
            continue;
          }

          const trySetFieldValue = (field: unknown, value: string) => {
            if (field instanceof PDFTextField) {
              field.setText(value);
              return true;
            }

            if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
              try {
                field.select(value);
                return true;
              } catch {
                return false;
              }
            }

            return false;
          };

          const setFieldsByAliases = (aliases: readonly string[], value: string) => {
            let updatedCount = 0;

            fields.forEach((field) => {
              const acroField = (field as { acroField?: { getAlternateName?: () => string; getPartialName?: () => string } }).acroField;
              const descriptors = [field.getName(), acroField?.getAlternateName?.() ?? "", acroField?.getPartialName?.() ?? ""]
                .filter(Boolean)
                .map((token) => normalizeToken(token));

              const isMatch = aliases.some((alias) => descriptors.some((descriptor) => descriptor.includes(alias)));

              if (isMatch && trySetFieldValue(field, value)) {
                updatedCount += 1;
              }
            });

            return updatedCount;
          };

          const totalUpdatedFields = Object.entries(fieldValues).reduce((count, [key, value]) => {
            const aliases = w3FieldAliases[key as keyof typeof w3FieldAliases];
            return count + setFieldsByAliases(aliases, value);
          }, 0);

          if (totalUpdatedFields === 0) {
            continue;
          }

          const outputBytes = await pdfDoc.save();
          const outputArray = new Uint8Array(outputBytes);
          const outputBlob = new Blob([outputArray.buffer], { type: "application/pdf" });
          generatedBlobUrl = URL.createObjectURL(outputBlob);
          break;
        } catch {
          continue;
        }
      }

      if (!generatedBlobUrl) {
        return;
      }

      window.open(generatedBlobUrl, "_blank", "noopener,noreferrer");
      const downloadLink = document.createElement("a");
      downloadLink.href = generatedBlobUrl;
      downloadLink.download = `W3_Transmittal_${selectedW2Year}.pdf`;
      downloadLink.click();

      window.setTimeout(() => {
        URL.revokeObjectURL(generatedBlobUrl);
      }, 60000);
    } finally {
      setIsGeneratingOfficialW2(false);
    }
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage("");
    setIsAuthenticating(true);
    console.log("Attempting sign in with:", loginForm.email);
    
    try {
      const result = await signIn(loginForm.email, loginForm.password);
      console.log("Sign in result:", result);
      
      if (!result.success) {
        setAuthMessage(result.error || "Failed to sign in");
        setAuthMessageType("error");
      } else {
        setAuthMessage("Sign in successful!");
        setAuthMessageType("success");
        // AuthContext will automatically update user state and redirect
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setAuthMessage("An error occurred during sign in");
      setAuthMessageType("error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleMfaSubmit = () => {
    // MFA not used with Supabase - this is a no-op
  };

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage("");
    
    if (registerForm.name.length < 2 || registerForm.password.length < 8) {
      setAuthMessage("Name must be at least 2 characters and password at least 8 characters");
      setAuthMessageType("error");
      return;
    }
    
    const result = await signUp(registerForm.email, registerForm.password, registerForm.name);
    
    if (!result.success) {
      setAuthMessage(result.error || "Failed to create account");
      setAuthMessageType("error");
    } else {
      setAuthMessage("Account created successfully! Please check your email to confirm.");
      setAuthMessageType("success");
      setAuthScreen("signin");
    }
  };

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage("");
    
    const result = await resetPassword(forgotEmail);
    
    if (!result.success) {
      setAuthMessage(result.error || "Failed to send reset email");
      setAuthMessageType("error");
    } else {
      setAuthMessage("Password reset email sent! Check your inbox.");
      setAuthMessageType("success");
    }
  };

  const handleSocialLogin = async (provider: string) => {
    const providerLower = provider.toLowerCase() as 'google' | 'microsoft' | 'apple' | 'github';
    const result = await signInWithOAuth(providerLower);
    
    if (!result.success) {
      setAuthMessage(result.error || `Failed to sign in with ${provider}`);
      setAuthMessageType("error");
    }
    // If successful, Supabase will redirect to the OAuth provider
  };

  const handleQuickBooksConnect = () => {
    const now = new Date().toISOString();
    setQuickbooksSync((prev) => ({
      ...prev,
      connected: true,
      companyName: employerProfile.legalName,
      realmId: "QB-SANDBOX-293004",
      lastSyncAt: now,
    }));
    setQuickbooksMessage("QuickBooks Online connected. Ready for vendor and payments sync.");
  };

  const handleQuickBooksSync = () => {
    if (!quickbooksSync.connected) {
      setQuickbooksMessage("Connect QuickBooks first.");
      return;
    }

    const now = new Date().toISOString();
    setQuickbooksSync((prev) => ({
      ...prev,
      vendorsSynced: scopedVendors.length,
      paymentsSynced: scopedVendorPayments.length,
      lastSyncAt: now,
    }));
    setQuickbooksMessage(`Sync completed at ${new Date(now).toLocaleString("en-US")}.`);
  };

  const handleCreateWorkspaceUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = userAdminForm.name.trim();
    const email = userAdminForm.email.trim().toLowerCase();
    const password = userAdminForm.password || "";

    if (!name || !email || password.length < 8) {
      setUserAdminMessage("Provide full name, valid email, and an 8+ character password.");
      return;
    }

    const exists = userDirectory.some((user) => user.email.toLowerCase() === email);
    if (exists) {
      setUserAdminMessage("User email already exists.");
      return;
    }

    setUserDirectory((prev) => [
      ...prev,
      {
        name,
        email,
        password,
        role: userAdminForm.role,
        status: "Active",
      },
    ]);
    setUserAdminForm({ name: "", email: "", role: "Operations Manager", password: "" });
    setUserAdminMessage("New workspace user created.");
  };

  const handlePlanSwitch = (plan: SubscriptionPlan) => {
    setSubscriptionSettings((prev) => ({
      ...prev,
      plan,
      billingCycle: getPlanDefaultCycle(plan),
      status: "Active",
    }));
    setSettingsMessage(`${plan} plan selected successfully.`);
  };

  const handleLogout = async () => {
    await signOut();
    setLoginForm((prev) => ({ ...prev, password: "" }));
    goToAuthScreen("welcome");
  };

  const handleSaveSettings = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsMessage("Settings saved. Company profile and branding are now active across forms and reports.");
    setCommunicationBanner("Settings updated successfully.");
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!supabaseUser) {
    // Show landing page if on welcome screen
    if (authScreen === "welcome") {
      return <LandingPage onNavigateToAuth={(screen) => goToAuthScreen(screen)} />;
    }
    
    // Show auth screen for signin/register/forgot
    return (
      <AuthScreen
        authScreen={authScreen}
        loginForm={loginForm}
        registerForm={registerForm}
        mfaCode=""
        forgotEmail={forgotEmail}
        registerMessage={authMessageType === "success" ? authMessage : ""}
        socialLoginMessage={authMessageType === "info" ? authMessage : ""}
        loginError={authMessageType === "error" ? authMessage : ""}
        mfaError=""
        forgotMessage={authMessageType === "success" ? authMessage : ""}
        registerError={authMessageType === "error" ? authMessage : ""}
        isAuthenticating={isAuthenticating}
        onPrepareSignIn={() => {
          goToAuthScreen("signin");
          setAuthMessage("");
        }}
        onPrepareRegister={() => {
          goToAuthScreen("register");
          setAuthMessage("");
        }}
        onScreenChange={goToAuthScreen}
        onLoginFormChange={(field: string, value: string) => setLoginForm((prev) => ({ ...prev, [field]: value }))}
        onRegisterFormChange={(field: string, value: string) => setRegisterForm((prev) => ({ ...prev, [field]: value }))}
        onMfaCodeChange={() => {}}
        onForgotEmailChange={(email: string) => setForgotEmail(email)}
        onLoginSubmit={handleLoginSubmit}
        onMfaSubmit={handleMfaSubmit}
        onForgotPassword={handleForgotPassword}
        onRegisterSubmit={handleRegisterSubmit}
        onSocialLogin={handleSocialLogin}
      />
    );
  }

  const content =
    viewMode === "employee"
      ? {
          title: "Employee Data",
          subtitle: "Payroll records and tax contribution by employee",
          cards: dynamicEmployeeCards,
          tableTitle: "EMPLOYEE DATA",
        }
      : viewMode === "w2"
        ? {
            title: w2Section === "summary" ? "W-3 Transmittal Report" : "W-2 Forms",
            subtitle:
              w2Section === "summary"
                ? "IRS Form W-3 totals linked automatically to payroll and W-2 data"
                : "IRS-aligned W-2 worksheet with high-accuracy print layout",
            cards: w2Cards,
            tableTitle: w2Section === "summary" ? "FORM W-3 (TRANSMITTAL OF WAGE AND TAX STATEMENTS)" : "FORM W-2 PREVIEW",
          }
      : viewMode === "payroll"
        ? {
            title: "Monthly Payroll Processing",
            subtitle: "US-compliant payroll register for monthly disbursements",
            cards: dynamicPayrollCards,
            tableTitle: "MONTHLY PAYROLL DISBURSEMENT",
          }
        : viewMode === "portal"
          ? {
              title:
                portalSection === "vendors"
                  ? "1099 Vendors Sheet"
                  : portalSection === "payments"
                    ? "1099 Payments Sheet"
                    : portalSection === "w9"
                      ? "W-9 Electronic Intake"
                    : portalSection === "communications"
                      ? "Compliance Communication Center"
                    : portalSection === "vault"
                      ? "Audit-Ready Vault"
                    : portalSection === "form"
                      ? "1099-NEC Official Form"
                      : "1099 Dashboard",
              subtitle:
                portalSection === "vendors"
                  ? "Master vendor registry with tax identity and legal entity classification"
                  : portalSection === "payments"
                    ? "Transaction ledger linked to vendor IDs with automatic year and quarter classification"
                    : portalSection === "w9"
                      ? "Self-service W-9 onboarding that writes directly into the vendor registry"
                    : portalSection === "communications"
                      ? "Automated email/SMS reminders for missing W-9 or invalid tax identity records"
                    : portalSection === "vault"
                      ? "Central storage for invoices, contracts, W-9 files, and 1099 copies"
                    : portalSection === "form"
                      ? "IRS-aligned 1099-NEC output auto-filled from vendor and payment sheets"
                      : "Automatic compliance status based on annual payment threshold and vendor profile",
              cards: portalCards,
              tableTitle:
                portalSection === "vendors"
                  ? "VENDORS SHEET"
                  : portalSection === "payments"
                    ? "PAYMENTS SHEET"
                    : portalSection === "w9"
                      ? "W-9 INTAKE"
                    : portalSection === "communications"
                      ? "COMPLIANCE COMMUNICATION"
                    : portalSection === "vault"
                      ? "DOCUMENT VAULT"
                    : portalSection === "form"
                      ? "FORM 1099-NEC"
                      : "DASHBOARD",
            }
        : viewMode === "reports"
          ? {
              title: reportFocus ? reportFocusLabel : "Reports Center",
              subtitle: reportFocus ? reportFocusSubtitle : "Printable statements and reports for executive, employee, and payroll data",
              cards: reportCards,
              tableTitle: reportFocus ? `REPORT PAGE - ${reportFocusLabel.toUpperCase()}` : "REPORTS & PRINT",
            }
        : viewMode === "subscriptions"
          ? {
              title: "User & Subscription Center",
              subtitle: "Manage plan package and workspace users from one centralized page",
              cards: subscriptionCards,
              tableTitle: "USER MANAGEMENT & SUBSCRIPTIONS",
            }
        : viewMode === "settings"
          ? {
              title: "System Settings",
              subtitle: "Manage company profile, tax identity, branding, and account access",
              cards: settingsCards,
              tableTitle: "SETTINGS CENTER",
            }
      : {
          title: "Quarterly Executive Overview",
          subtitle: "Monitoring tax liability for Q1 2026",
          cards: dynamicExecutiveCards,
          tableTitle: "DEPARTMENTAL COST BREAKDOWN",
        };

  return (
    <div className="app-shell min-h-screen text-[#1d3556]">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <AppSidebar
          brandLogoUrl={brandLogoUrl}
          platformName={platformName}
          authUser={{ name: supabaseUser.full_name || "User", email: supabaseUser.email, role: supabaseUser.role }}
          viewMode={viewMode}
          portalSection={portalSection}
          w2Section={w2Section}
          isWorkforceOpen={isWorkforceOpen}
          isW2Open={isW2Open}
          isPortalOpen={isPortalOpen}
          isTasksOpen={isTasksOpen}
          isDocumentsOpen={isDocumentsOpen}
          setViewMode={setViewModeWithRoute}
          setPortalSection={setPortalSectionWithRoute}
          setW2Section={setW2SectionWithRoute}
          setIsWorkforceOpen={setIsWorkforceOpen}
          setIsW2Open={setIsW2Open}
          setIsPortalOpen={setIsPortalOpen}
          setIsTasksOpen={setIsTasksOpen}
          setIsDocumentsOpen={setIsDocumentsOpen}
          onOpenReports={() => {
            setViewMode("reports");
            setReportFocus(null);
            navigate("/reports");
          }}
          onLogout={handleLogout}
          subscriptionTier={subscription?.tier || "free"}
          employeesUsed={employees.length}
          employeesLimit={subscription ? subscriptionService.getLimits(subscription.tier).maxEmployees : 5}
          vendorsUsed={vendors.length}
          vendorsLimit={subscription ? subscriptionService.getLimits(subscription.tier).maxVendors : 3}
        />

        <main className="min-w-0 flex-1 bg-[var(--page-bg)]">
          <header className="app-main-header px-6 py-5 md:px-8 xl:px-10">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[26px] font-extrabold tracking-tight text-slate-900 md:text-[28px]">{content.title}</h2>
                <p className="mt-1 text-[13px] text-slate-500 leading-relaxed">{content.subtitle}</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" /></svg>
                  {employerProfile.legalName}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/50 px-3 py-1.5 text-[11px] font-semibold text-blue-600">
                  <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" /></span>
                  {subscriptionSettings.plan}
                </span>
              </div>
            </div>
            {communicationBanner ? <p className="mt-3 animate-fade-in rounded-lg border border-blue-200/50 bg-blue-50 px-4 py-2 text-[12px] font-medium text-blue-700">{communicationBanner}</p> : null}
          </header>

          <section className="app-content space-y-6 px-6 py-6 md:px-8 xl:px-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {content.cards.map((card, i) => (
                <article
                  key={card.title}
                  className={dashboardCardClassName(card.variant)}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      card.variant === "dark" ? "text-slate-400" : "text-slate-400"
                    }`}
                  >
                    {card.title}
                  </p>
                  <p
                    className={`mt-2 text-[28px] font-extrabold leading-none tracking-tight ${
                      card.variant === "dark"
                        ? "text-white"
                        : card.variant === "accent"
                          ? "text-blue-600"
                          : "text-slate-900"
                    }`}
                  >
                    {card.value}
                  </p>
                </article>
              ))}
            </div>

            <section className="surface-panel overflow-hidden rounded-2xl">
              <h3 className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 text-[13px] font-bold uppercase tracking-wider text-slate-500">
                {content.tableTitle}
              </h3>

              {viewMode === "settings" ? (
                <SettingsView
                  platformName={platformName}
                  setPlatformName={setPlatformName}
                  employerProfile={employerProfile}
                  setEmployerProfile={setEmployerProfile}
                  subscriptionSettings={subscriptionSettings}
                  setSubscriptionSettings={setSubscriptionSettings}
                  formSignerName={formSignerName}
                  setFormSignerName={setFormSignerName}
                  brandLogoName={brandLogoName}
                  handleBrandLogoUpload={handleBrandLogoUpload}
                  handleSendComplianceReminder={handleSendComplianceReminder}
                  complianceMessageLog={complianceMessageLog}
                  settingsMessage={settingsMessage}
                  handleExportAuditZip={handleExportAuditZip}
                  handleExportTaxDeadlinesCalendar={handleExportTaxDeadlinesCalendar}
                  handleSaveSettings={handleSaveSettings}
                />
              ) : viewMode === "tasks" ? (
                <TasksView
                  companyId={supabaseUser.company_id || ''}
                  userId={supabaseUser.id || ''}
                />
              ) : viewMode === "documents" ? (
                <DocumentsView
                  companyId={supabaseUser.company_id || ''}
                  userId={supabaseUser.id || ''}
                />
              ) : viewMode === "subscriptions" ? (
                <SubscriptionsView
                  subscriptionPlanCatalog={subscriptionPlanCatalog}
                  subscriptionSettings={subscriptionSettings}
                  setSubscriptionSettings={setSubscriptionSettings}
                  handlePlanSwitch={handlePlanSwitch}
                  setSettingsMessage={setSettingsMessage}
                  paymentMethodSettings={paymentMethodSettings}
                  setPaymentMethodSettings={setPaymentMethodSettings}
                  invoiceHistory={invoiceHistory}
                  toUsd={toUsd}
                  userDirectory={userDirectory}
                  userAdminForm={userAdminForm}
                  setUserAdminForm={setUserAdminForm}
                  handleCreateWorkspaceUser={() => handleCreateWorkspaceUser({ preventDefault: () => {} } as any)}
                  userAdminMessage={userAdminMessage}
                  settingsMessage={settingsMessage}
                />
              ) : viewMode === "employee" ? (
                <EmployeeView employees={employees} setEmployees={setEmployees} setIsAddFormOpen={setIsAddFormOpen} />
              ) : viewMode === "w2" ? (
                <W2View
                  w2Section={w2Section}
                  selectedW2EmployeeId={selectedW2EmployeeId}
                  setSelectedW2EmployeeId={setSelectedW2EmployeeId as Dispatch<SetStateAction<number | null>>}
                  employees={employees}
                  selectedW2Year={selectedW2Year as any}
                  setSelectedW2Year={setSelectedW2Year as any}
                  w2YearOptions={w2YearOptions as any}
                  handleGenerateOfficialW2Pdf={handleGenerateOfficialW2Pdf}
                  handleGenerateOfficialW3Pdf={handleGenerateOfficialW3Pdf}
                  isGeneratingOfficialW2={isGeneratingOfficialW2}
                  toW2Amount={toW2Amount}
                  w3Totals={w3Totals}
                  employerProfile={employerProfile}
                />
              ) : viewMode === "payroll" ? (
                <PayrollView
                  activeEmployees={activeEmployees}
                  selectedPayrollMonth={selectedPayrollMonth}
                  setSelectedPayrollMonth={setSelectedPayrollMonth}
                  payrollMonthOptions={payrollMonthOptions}
                  getMonthRange={getMonthRange}
                  bulkPaymentMethod={bulkPaymentMethod}
                  setBulkPaymentMethod={setBulkPaymentMethod}
                  bulkPayDate={bulkPayDate}
                  setBulkPayDate={setBulkPayDate}
                  handleBulkPayrollPay={handleBulkPayrollPay}
                  isCurrentMonthPaid={isCurrentMonthPaid}
                  paidEmployeeCount={paidEmployeeCount}
                  payrollTableRows={payrollTableRows}
                  getPayrollPaymentRecord={getPayrollPaymentRecord}
                  handleRowPaymentMethodChange={handleRowPaymentMethodChange}
                  getDefaultPaymentDate={getDefaultPaymentDate}
                />
              ) : viewMode === "portal" ? (
                <PortalView
                  portalSection={portalSection}
                  setPortalSection={setPortalSection}
                  tinCheckMessage={tinCheckMessage}
                  w9RequestMessage={w9RequestMessage}
                  setIsW9FormOpen={setIsW9FormOpen}
                  setVendorFormMessage={setVendorFormMessage}
                  setIsVendorFormOpen={setIsVendorFormOpen}
                  scopedVendors={scopedVendors}
                  vendorNeeds1099={vendorNeeds1099}
                  handleValidateTin={handleValidateTin}
                  handleRequestW9={handleRequestW9}
                  setPaymentFormMessage={setPaymentFormMessage}
                  setIsPaymentFormOpen={setIsPaymentFormOpen}
                  scopedVendorPayments={scopedVendorPayments}
                  duplicatePaymentIds={duplicatePaymentIds}
                  toUsd={toUsd}
                  daysLeftToFile1099={daysLeftToFile1099}
                  form941CountdownDays={form941CountdownDays}
                  efileMessage={efileMessage}
                  selected1099Year={selected1099Year}
                  setSelected1099Year={setSelected1099Year}
                  w2YearOptions={w2YearOptions}
                  handleExportIrsPackage={handleExportIrsPackage}
                  complianceAlerts={complianceAlerts}
                  portalMonthlyTotals={portalMonthlyTotals}
                  maxMonthlyTotal={maxMonthlyTotal}
                  mustFileVendorCount={mustFileVendorCount}
                  filedVendorCount={filedVendorCount}
                  rejectedVendorCount={rejectedVendorCount}
                  pendingVendorCount={pendingVendorCount}
                  portalStateDistribution={portalStateDistribution}
                  maxStateCount={maxStateCount}
                  quickbooksSync={quickbooksSync}
                  handleQuickBooksConnect={handleQuickBooksConnect}
                  handleQuickBooksSync={handleQuickBooksSync}
                  quickbooksMessage={quickbooksMessage}
                  topCostVendor={topCostVendor}
                  maxCategorySpend={maxCategorySpend}
                  vendorDashboardRows={vendorDashboardRows}
                  updateVendorFilingLifecycle={updateVendorFilingLifecycle}
                  filingLifecycleOptions={filingLifecycleOptions}
                  handleCreateOnboardingLink={handleCreateOnboardingLink}
                  setActiveOnboardingToken={setActiveOnboardingToken}
                  setW9Form={setW9Form}
                  w9FormTemplate={w9FormTemplate}
                  onboardingInvites={onboardingInvites}
                  activeCompanyId={activeCompanyId}
                  handleStartSelfOnboarding={handleStartSelfOnboarding}
                  onboardingSubmissions={onboardingSubmissions}
                  handleApproveOnboardingSubmission={handleApproveOnboardingSubmission}
                  handleVendorDocUpload={handleVendorDocUpload}
                  vendorDocForm={vendorDocForm}
                  setVendorDocForm={setVendorDocForm}
                  setVendorDocFile={setVendorDocFile}
                  scopedVendorDocuments={scopedVendorDocuments}
                  selected1099VendorId={selected1099VendorId}
                  setSelected1099VendorId={setSelected1099VendorId}
                  vendors={vendors}
                  formSignerName={formSignerName}
                  setFormSignerName={setFormSignerName}
                  handleSign1099Form={handleSign1099Form}
                  selected1099Signature={selected1099Signature}
                  employerProfile={employerProfile}
                  selected1099Vendor={selected1099Vendor}
                  selected1099VendorTotal={selected1099VendorTotal}
                  selected1099VendorYearPayments={selected1099VendorYearPayments}
                />
              ) : viewMode === "reports" ? (
                <ReportsView
                  reportFocus={reportFocus}
                  reportTypeOptions={reportTypeOptions}
                  setReportFocus={setReportFocus}
                  reportFocusLabel={reportFocusLabel}
                  reportDocumentType={reportDocumentType}
                  setReportDocumentType={setReportDocumentType}
                  selectedReportYear={selectedReportYear}
                  setSelectedReportYear={setSelectedReportYear}
                  w2YearOptions={w2YearOptions}
                  selectedReportEmployeeId={selectedReportEmployeeId}
                  setSelectedReportEmployeeId={setSelectedReportEmployeeId}
                  employees={employees}
                  reportDocumentLabel={reportDocumentLabel}
                  reportReference={reportReference}
                  reportGeneratedOn={reportGeneratedOn}
                  reportGeneratedTime={reportGeneratedTime}
                  reportPeriodLabel={reportPeriodLabel}
                  activeEmployees={activeEmployees}
                  departmentOptions={departmentOptions}
                  reportPaidMonthsRows={reportPaidMonthsRows}
                  toUsd={toUsd}
                  payrollMethodSummary={payrollMethodSummary}
                  reportSelectedEmployee={reportSelectedEmployee}
                  reportSelectedEmployeeLedger={reportSelectedEmployeeLedger}
                  reportEmployeeYearTotals={reportEmployeeYearTotals}
                  reportW2Totals={reportW2Totals}
                  reportW2Rows={reportW2Rows}
                  report1099Rows={report1099Rows}
                  report1099YearPayments={report1099YearPayments}
                  report1099QuarterTotals={report1099QuarterTotals}
                  reconciliationMessage={reconciliationMessage}
                  reportReconciliationTotals={reportReconciliationTotals}
                  reportUnallocatedPayments={reportUnallocatedPayments}
                  reconciliationAssignByPaymentId={reconciliationAssignByPaymentId}
                  setReconciliationAssignByPaymentId={setReconciliationAssignByPaymentId}
                  scopedVendors={scopedVendors}
                  handleAssignUnallocatedPayment={handleAssignUnallocatedPayment}
                />
              ) : (
                <ExecutiveView
                  form941CountdownDays={form941CountdownDays}
                  daysLeftToFile1099={daysLeftToFile1099}
                  executiveTrendChart={executiveTrendChart}
                  executiveTrendSummary={executiveTrendSummary}
                  executiveDepartmentShareRows={executiveDepartmentShareRows}
                  executiveDonutBackground={executiveDonutBackground}
                  leadingDepartment={leadingDepartment}
                  executiveDepartmentRows={executiveDepartmentRows}
                  toUsd={toUsd}
                />
              )}
            </section>
          </section>
        </main>
      </div>

      {isVendorFormOpen && viewMode === "portal" && portalSection === "vendors" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#08142c]/45 px-6 py-10"
          onClick={() => setIsVendorFormOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#d4deec] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-[#e8eef8] bg-white px-8 py-5">
              <div>
                <h3 className="text-[24px] font-semibold tracking-tight text-[#102a4d]">Add New Vendor</h3>
                <p className="text-[13px] text-[#6a7e9d]">Create a vendor record for 1099 tracking and filing compliance.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVendorFormOpen(false)}
                className="rounded-lg border border-[#d8e1ef] px-3 py-2 text-[12px] font-semibold text-[#4a5f81] transition hover:bg-[#f4f7fd]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-6 px-8 py-7">
              {vendorFormMessage ? (
                <div className="rounded-lg border border-[#f0d4d8] bg-[#fff4f5] px-3 py-2 text-[12px] font-semibold text-[#a33b46]">
                  {vendorFormMessage}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Vendor ID</span>
                  <input
                    value={vendorForm.vendorId}
                    onChange={(event) => onVendorFieldChange("vendorId", event.target.value)}
                    placeholder="Vendor ID (ex: V-1010)"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Legal Name</span>
                  <input
                    value={vendorForm.legalName}
                    onChange={(event) => onVendorFieldChange("legalName", event.target.value)}
                    placeholder="Vendor legal name"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Email</span>
                  <input
                    value={vendorForm.email}
                    onChange={(event) => onVendorFieldChange("email", event.target.value)}
                    placeholder="billing@example.com"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Tax ID Type</span>
                  <select
                    value={vendorForm.taxIdType}
                    onChange={(event) => onVendorFieldChange("taxIdType", event.target.value as TaxIdType)}
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  >
                    <option value="EIN">EIN</option>
                    <option value="SSN">SSN</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Tax ID</span>
                  <input
                    value={vendorForm.taxId}
                    onChange={(event) => onVendorFieldChange("taxId", event.target.value)}
                    placeholder="Tax ID"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Entity Type</span>
                  <select
                    value={vendorForm.entityType}
                    onChange={(event) => onVendorFieldChange("entityType", event.target.value as VendorEntityType)}
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  >
                    <option value="Individual">Individual</option>
                    <option value="LLC">LLC</option>
                    <option value="Corporation">Corporation</option>
                    <option value="Partnership">Partnership</option>
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">State</span>
                  <select
                    value={vendorForm.state}
                    onChange={(event) => onVendorFieldChange("state", event.target.value)}
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  >
                    <option value="">Select state</option>
                    {usStateOptions.map((state) => (
                      <option key={`vendor-state-${state}`} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">ZIP Code</span>
                  <input
                    value={vendorForm.zipCode}
                    onChange={(event) => onVendorFieldChange("zipCode", event.target.value)}
                    placeholder="##### or #####-####"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
              </div>

              <label className="space-y-1.5">
                <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Address</span>
                <input
                  value={vendorForm.address}
                  onChange={(event) => onVendorFieldChange("address", event.target.value)}
                  placeholder="Street, City, State ZIP"
                  className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                />
              </label>

              <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#dbe3f0] bg-[#f8fbff] p-3 text-[12px]">
                <div>
                  <p className="font-semibold text-[#587095]">TIN Validation</p>
                  <p className={`mt-1 font-semibold ${vendorForm.taxId ? (vendorFormValidation.tinValid ? "text-[#1b7b44]" : "text-[#a02f39]") : "text-[#6b82a2]"}`}>
                    {vendorForm.taxId ? (vendorFormValidation.tinValid ? "Format is valid" : "Invalid format") : "Awaiting Tax ID"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[#587095]">ZIP / State Check</p>
                  <p
                    className={`mt-1 font-semibold ${
                      vendorForm.zipCode && vendorForm.state
                        ? vendorFormValidation.zipValid
                          ? "text-[#1b7b44]"
                          : "text-[#a02f39]"
                        : "text-[#6b82a2]"
                    }`}
                  >
                    {vendorForm.zipCode && vendorForm.state
                      ? vendorFormValidation.zipValid
                        ? "State profile matched"
                        : "ZIP does not match state"
                      : "Select state + ZIP"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[#587095]">Entity Logic</p>
                  <p className={`mt-1 font-semibold ${vendorFormValidation.isExemptEntity ? "text-[#8d5b1a]" : "text-[#2f65de]"}`}>
                    {vendorFormValidation.isExemptEntity ? "Corporation: usually 1099-exempt" : "Track against $600 threshold"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#ecf1f9] pt-5">
                <button
                  type="button"
                  onClick={() => setIsVendorFormOpen(false)}
                  className="rounded-lg border border-[#d8e1ef] px-4 py-2.5 text-[13px] font-semibold text-[#506386] transition hover:bg-[#f4f7fd]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#4f74b9] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#3f64a7]"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPaymentFormOpen && viewMode === "portal" && portalSection === "payments" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#08142c]/45 px-6 py-10"
          onClick={() => setIsPaymentFormOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#d4deec] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-[#e8eef8] bg-white px-8 py-5">
              <div>
                <h3 className="text-[24px] font-semibold tracking-tight text-[#102a4d]">Add Vendor Payment</h3>
                <p className="text-[13px] text-[#6a7e9d]">Log one outbound payment and classify it by year and quarter automatically.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentFormOpen(false)}
                className="rounded-lg border border-[#d8e1ef] px-3 py-2 text-[12px] font-semibold text-[#4a5f81] transition hover:bg-[#f4f7fd]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddVendorPayment} className="space-y-6 px-8 py-7">
              {paymentFormMessage ? (
                <div className="rounded-lg border border-[#f3dcb0] bg-[#fff7e8] px-3 py-2 text-[12px] font-semibold text-[#9b6100]">
                  {paymentFormMessage}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Vendor</span>
                  <select
                    value={paymentForm.vendorId}
                    onChange={(event) => onPaymentFieldChange("vendorId", event.target.value)}
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  >
                    <option value="">Select Vendor</option>
                    <option value="UNASSIGNED">Unassigned (suspense)</option>
                    {scopedVendors.map((vendor) => (
                      <option key={vendor.vendorId} value={vendor.vendorId}>
                        {vendor.vendorId} - {vendor.legalName}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Payment Date</span>
                  <input
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(event) => onPaymentFieldChange("paymentDate", event.target.value)}
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Invoice Number</span>
                  <input
                    value={paymentForm.invoiceNumber}
                    onChange={(event) => onPaymentFieldChange("invoiceNumber", event.target.value)}
                    placeholder="Invoice Number"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Amount (USD)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentForm.amount}
                    onChange={(event) => onPaymentFieldChange("amount", event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Payment State</span>
                  <select
                    value={paymentForm.paymentState}
                    onChange={(event) => onPaymentFieldChange("paymentState", event.target.value)}
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  >
                    <option value="">Select state</option>
                    {usStateOptions.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Invoice Document</span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.txt"
                    onChange={(event) => setPaymentAttachment(event.target.files?.[0] ?? null)}
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2 text-[12px] text-[#1e3557]"
                  />
                </label>
              </div>

              <div className="rounded-xl border border-[#dbe3f0] bg-[#f8fbff] p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[12px] font-semibold text-[#355a87]">OCR Auto-Scan</p>
                  <button
                    type="button"
                    onClick={handleAutoScanInvoice}
                    className="rounded-md border border-[#ccdaef] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#355a87]"
                  >
                    Auto Scan Invoice
                  </button>
                </div>
                <textarea
                  value={invoiceOcrText}
                  onChange={(event) => setInvoiceOcrText(event.target.value)}
                  placeholder="Paste OCR text from an invoice (optional)."
                  className="mt-2 h-20 w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2 text-[12px] text-[#1e3557] outline-none"
                />
                {invoiceScanMessage ? <p className="mt-2 text-[11px] font-semibold text-[#3f628d]">{invoiceScanMessage}</p> : null}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#ecf1f9] pt-5">
                <button
                  type="button"
                  onClick={() => setIsPaymentFormOpen(false)}
                  className="rounded-lg border border-[#d8e1ef] px-4 py-2.5 text-[13px] font-semibold text-[#506386] transition hover:bg-[#f4f7fd]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#4f74b9] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#3f64a7]"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddFormOpen && viewMode === "employee" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#08142c]/45 px-6 py-10"
          onClick={() => setIsAddFormOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-[#d4deec] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-[#e8eef8] bg-white px-8 py-5">
              <div>
                <h3 className="text-[24px] font-semibold tracking-tight text-[#102a4d]">Add New Employee</h3>
                <p className="text-[13px] text-[#6a7e9d]">Create a full employee record before saving to payroll data.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFormOpen(false)}
                className="rounded-lg border border-[#d8e1ef] px-3 py-2 text-[12px] font-semibold text-[#4a5f81] transition hover:bg-[#f4f7fd]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-6 px-8 py-7">
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">First Name</span>
                  <input
                    value={employeeForm.firstName}
                    onChange={(event) => onEmployeeFieldChange("firstName", event.target.value)}
                    placeholder="Enter first name"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Last Name</span>
                  <input
                    value={employeeForm.lastName}
                    onChange={(event) => onEmployeeFieldChange("lastName", event.target.value)}
                    placeholder="Enter last name"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">SSN</span>
                  <input
                    value={employeeForm.ssn}
                    onChange={(event) => onEmployeeFieldChange("ssn", event.target.value)}
                    placeholder="000-00-0000"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Department</span>
                  <select
                    value={employeeForm.department}
                    onChange={(event) => onEmployeeFieldChange("department", event.target.value)}
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  >
                    <option value="">Select department</option>
                    {departmentOptions.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Job Title</span>
                  <input
                    value={employeeForm.jobTitle}
                    onChange={(event) => onEmployeeFieldChange("jobTitle", event.target.value)}
                    placeholder="Enter job title"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Hire Date</span>
                  <input
                    type="date"
                    value={employeeForm.hireDate}
                    onChange={(event) => onEmployeeFieldChange("hireDate", event.target.value)}
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Gross Pay (Monthly)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={employeeForm.grossPay}
                    onChange={(event) => onEmployeeFieldChange("grossPay", event.target.value)}
                    placeholder="Enter monthly gross pay"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="col-span-3 space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Address</span>
                  <input
                    value={employeeForm.address}
                    onChange={(event) => onEmployeeFieldChange("address", event.target.value)}
                    placeholder="Enter full address"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">City</span>
                  <select
                    value={employeeForm.city && employeeForm.state ? `${employeeForm.city}|${employeeForm.state}` : ""}
                    onChange={(event) => onCitySelectChange(event.target.value)}
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  >
                    <option value="">Select city</option>
                    {usCityOptions.map((option) => (
                      <option key={`${option.city}-${option.state}`} value={`${option.city}|${option.state}`}>
                        {option.city}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">State</span>
                  <input
                    value={employeeForm.state}
                    readOnly
                    placeholder="Auto-filled from city"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-[#f6f8fc] px-3 py-2.5 text-[13px] text-[#1e3557] outline-none"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">ZIP Code</span>
                  <input
                    value={employeeForm.zipCode}
                    onChange={(event) => onEmployeeFieldChange("zipCode", event.target.value)}
                    placeholder="ZIP code"
                    className="w-full rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  />
                </label>
              </div>

              <div className="flex items-end justify-between border-t border-[#ecf1f9] pt-5">
                <label className="space-y-1.5">
                  <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Status</span>
                  <select
                    value={employeeForm.status}
                    onChange={(event) => onEmployeeFieldChange("status", event.target.value as EmployeeStatus)}
                    className="rounded-lg border border-[#d9e2f0] bg-white px-3 py-2.5 text-[13px] font-medium text-[#1e3557] outline-none transition focus:border-[#5a74ef]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddFormOpen(false)}
                    className="rounded-lg border border-[#d8e1ef] px-4 py-2.5 text-[13px] font-semibold text-[#506386] transition hover:bg-[#f4f7fd]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#4f74b9] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#3f64a7]"
                  >
                    Save Employee
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
