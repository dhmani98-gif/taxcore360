import { useState } from "react";
import type { AuthUser, ViewMode, PortalSection, W2Section } from "../app/types";
import {
  companyOptions,
  initialAppUserDirectory,
  initialEmployeeRows,
  initialEmployerProfile,
  initialSubscriptionSettings,
  initialVendors,
  initialVendorPayments,
  payrollMonthOptions,
  employeeFormTemplate,
  vendorFormTemplate,
  paymentFormTemplate,
} from "../app/data";

export const useAppState = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [pendingAuthUser, setPendingAuthUser] = useState<any>(null);
  const [authScreen, setAuthScreen] = useState<any>("welcome");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [mfaCode, setMfaCode] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("executive");
  const [portalSection, setPortalSection] = useState<PortalSection>("dashboard");
  const [w2Section, setW2Section] = useState<W2Section>("form");
  const [isWorkforceOpen, setIsWorkforceOpen] = useState(true);
  const [isW2Open, setIsW2Open] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  // Form visibility states
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  // Data state
  const [employees, setEmployees] = useState(initialEmployeeRows);
  const [vendors, setVendors] = useState(initialVendors);
  const [vendorPayments, setVendorPayments] = useState(initialVendorPayments);
  const [userDirectory, setUserDirectory] = useState(initialAppUserDirectory);
  const [employerProfile, setEmployerProfile] = useState(initialEmployerProfile);
  const [subscriptionSettings, setSubscriptionSettings] = useState(initialSubscriptionSettings);

  // Form data
  const [employeeForm, setEmployeeForm] = useState(employeeFormTemplate);
  const [vendorForm, setVendorForm] = useState(vendorFormTemplate);
  const [paymentForm, setPaymentForm] = useState(paymentFormTemplate);

  // Selection states
  const [selected1099VendorId, setSelected1099VendorId] = useState(initialVendors[0]?.vendorId ?? "");
  const [selected1099Year, setSelected1099Year] = useState(payrollMonthOptions[0]?.split("-")[0] ?? String(new Date().getFullYear()));
  const [selectedPayrollMonth, setSelectedPayrollMonth] = useState(payrollMonthOptions[0] ?? `${new Date().getFullYear()}-01`);
  const [selectedW2EmployeeId, setSelectedW2EmployeeId] = useState(initialEmployeeRows[0]?.id ?? 0);
  const [selectedW2Year, setSelectedW2Year] = useState(payrollMonthOptions[0]?.split("-")[0] ?? String(new Date().getFullYear()));

  // Computed values
  const activeCompanyId = companyOptions[0]?.id ?? "TC360-HQ";
  const defaultYear = payrollMonthOptions[0]?.split("-")[0] ?? String(new Date().getFullYear());
  const defaultPayrollMonth = payrollMonthOptions[0] ?? `${defaultYear}-01`;

  return {
    // Authentication
    isAuthenticated,
    setIsAuthenticated,
    authUser,
    setAuthUser,
    pendingAuthUser,
    setPendingAuthUser,
    authScreen,
    setAuthScreen,
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    mfaCode,
    setMfaCode,
    forgotEmail,
    setForgotEmail,

    // UI state
    viewMode,
    setViewMode,
    portalSection,
    setPortalSection,
    w2Section,
    setW2Section,
    isWorkforceOpen,
    setIsWorkforceOpen,
    isW2Open,
    setIsW2Open,
    isPortalOpen,
    setIsPortalOpen,

    // Form visibility
    isAddFormOpen,
    setIsAddFormOpen,
    isVendorFormOpen,
    setIsVendorFormOpen,
    isPaymentFormOpen,
    setIsPaymentFormOpen,

    // Data
    employees,
    setEmployees,
    vendors,
    setVendors,
    vendorPayments,
    setVendorPayments,
    userDirectory,
    setUserDirectory,
    employerProfile,
    setEmployerProfile,
    subscriptionSettings,
    setSubscriptionSettings,

    // Forms
    employeeForm,
    setEmployeeForm,
    vendorForm,
    setVendorForm,
    paymentForm,
    setPaymentForm,

    // Selections
    selected1099VendorId,
    setSelected1099VendorId,
    selected1099Year,
    setSelected1099Year,
    selectedPayrollMonth,
    setSelectedPayrollMonth,
    selectedW2EmployeeId,
    setSelectedW2EmployeeId,
    selectedW2Year,
    setSelectedW2Year,

    // Computed
    activeCompanyId,
    defaultYear,
    defaultPayrollMonth,
  };
};
