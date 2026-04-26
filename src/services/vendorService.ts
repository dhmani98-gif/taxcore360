import type { VendorRow, VendorPaymentRow, OnboardingInvite, OnboardingSubmission, FilingLifecycleStatus } from "../app/types";
import { vendorFormTemplate, paymentFormTemplate } from "../app/data";
import { validateTinFormat, isZipMatchingState, isTinMatchedToVendorName, getStateWithholdingRate, getQuarterFromDate } from "../app/utils";

export const vendorService = {
  createVendor: (
    formData: any,
    activeCompanyId: string,
    _currentVendors: VendorRow[]
  ): VendorRow => {
    return {
      companyId: activeCompanyId,
      vendorId: formData.vendorId.trim().toUpperCase(),
      legalName: formData.legalName.trim(),
      address: formData.address.trim(),
      zipCode: formData.zipCode.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      state: formData.state,
      category: formData.category,
      taxIdType: formData.taxIdType,
      taxId: formData.taxId.trim(),
      entityType: formData.entityType,
      tinVerification: isTinMatchedToVendorName({
        legalName: formData.legalName.trim(),
        taxIdType: formData.taxIdType,
        taxId: formData.taxId.trim(),
      }) ? "Verified" : "Invalid",
      onboardingSource: "Manual",
      w9RequestStatus: "Not Requested",
    };
  },

  validateVendorForm: (formData: any, currentVendors: VendorRow[]): string | null => {
    const vendorId = formData.vendorId.trim().toUpperCase();
    const legalName = formData.legalName.trim();
    const taxId = formData.taxId.trim();
    const zipCode = formData.zipCode.trim();

    if (!vendorId || !legalName || !taxId || !formData.state || !zipCode) {
      return "Complete vendor ID, legal name, state, ZIP code, and tax ID before saving.";
    }

    if (!validateTinFormat(formData.taxIdType, taxId)) {
      return `Tax ID format is invalid for ${formData.taxIdType}.`;
    }

    if (!isZipMatchingState(formData.state, zipCode)) {
      return "ZIP code does not match the selected state profile.";
    }

    const vendorExists = currentVendors.some((vendor) => vendor.vendorId === vendorId);
    if (vendorExists) {
      return `Vendor ID ${vendorId} already exists.`;
    }

    return null;
  },

  createVendorPayment: (
    formData: any,
    activeCompanyId: string,
    currentPayments: VendorPaymentRow[],
    attachment?: File | null
  ): { payment: VendorPaymentRow; attachmentUrl?: string } => {
    const year = formData.paymentDate.split("-")[0];
    const stateWithholding = Number(formData.amount || 0) * getStateWithholdingRate(formData.paymentState);

    const attachmentUrl = attachment ? URL.createObjectURL(attachment) : undefined;

    const payment: VendorPaymentRow = {
      companyId: activeCompanyId,
      id: currentPayments.length > 0 ? Math.max(...currentPayments.map((payment) => payment.id)) + 1 : 1,
      vendorId: formData.vendorId || "UNASSIGNED",
      paymentDate: formData.paymentDate,
      invoiceNumber: formData.invoiceNumber.trim(),
      amount: Number(formData.amount),
      paymentState: formData.paymentState,
      stateWithholding,
      year,
      quarter: getQuarterFromDate(formData.paymentDate),
      attachmentName: attachment?.name,
      attachmentUrl,
    };

    return { payment, attachmentUrl };
  },

  validatePaymentForm: (formData: any): string | null => {
    const amount = Number(formData.amount);

    if (
      !formData.paymentDate ||
      !formData.invoiceNumber.trim() ||
      !formData.paymentState ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      return "Complete date, invoice number, amount, and payment state before saving.";
    }

    return null;
  },

  validateTin: (vendorId: string, vendors: VendorRow[]) => {
    const vendor = vendors.find((item) => item.vendorId === vendorId);
    if (!vendor) return { message: "Vendor not found", isValid: false };

    const isValid = isTinMatchedToVendorName(vendor);
    const hasRegistryRecord = false; // Simplified, should check mock registry

    return {
      message: `${vendor.vendorId}: ${
        isValid
          ? hasRegistryRecord
            ? "TIN matched with vendor legal name."
            : "TIN format valid (no IRS registry record cached)."
          : "TIN mismatch. Legal name and tax ID do not align."
      }`,
      isValid,
    };
  },

  createW9Request: (
    vendor: VendorRow,
    activeCompanyId: string
  ): { invite: OnboardingInvite; submission: OnboardingSubmission } => {
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

    return { invite, submission };
  },

  updateVendorFilingLifecycle: (
    vendorId: string,
    status: FilingLifecycleStatus,
    activeCompanyId: string,
    selectedYear: string,
    currentLifecycle: Record<string, FilingLifecycleStatus>
  ): Record<string, FilingLifecycleStatus> => {
    const lifecycleKey = `${activeCompanyId}-${selectedYear}-${vendorId}`;
    return {
      ...currentLifecycle,
      [lifecycleKey]: status,
    };
  },

  resetVendorForm: () => ({
    ...vendorFormTemplate,
    vendorId: `V-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`.toUpperCase(),
  }),
  resetPaymentForm: () => paymentFormTemplate,

  handleVendorFieldChange: (
    field: keyof typeof vendorFormTemplate,
    value: string,
    setForm: React.Dispatch<React.SetStateAction<typeof vendorFormTemplate>>
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  },

  handlePaymentFieldChange: (
    field: keyof typeof paymentFormTemplate,
    value: string,
    setForm: React.Dispatch<React.SetStateAction<typeof paymentFormTemplate>>
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  },
};
