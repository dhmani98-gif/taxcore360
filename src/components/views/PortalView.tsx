import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Building2, CircleAlert } from "lucide-react";
import type {
  EmployerProfile,
  FilingLifecycleStatus,
  OnboardingInvite,
  OnboardingSubmission,
  PortalSection,
  QuickBooksSyncState,
  VendorDocument,
  VendorPaymentRow,
  VendorRow,
} from "../../app/types";

type ComplianceAlert = {
  level: "warning" | "critical";
  message: string;
};

type PortalMonthlyTotal = {
  month: string;
  total: number;
  label: string;
};

type PortalStateDistributionRow = {
  state: string;
  count: number;
};

type VendorDashboardRow = VendorRow & {
  totalPaid: number;
  is1099Eligible: boolean;
  filingStatus: "MUST FILE" | "OK";
  lifecycleStatus: FilingLifecycleStatus;
  thresholdProgress: number;
  thresholdRemaining: number;
};

type VendorDocFormState = {
  vendorId: string;
  category: VendorDocument["category"];
  note: string;
};

type SignatureRecord = {
  signedBy: string;
  signedAt: string;
};

type PortalViewProps = {
  portalSection: PortalSection;
  setPortalSection: Dispatch<SetStateAction<PortalSection>>;
  tinCheckMessage: string;
  w9RequestMessage: string;
  setIsW9FormOpen: Dispatch<SetStateAction<boolean>>;
  setVendorFormMessage: Dispatch<SetStateAction<string>>;
  setIsVendorFormOpen: Dispatch<SetStateAction<boolean>>;
  scopedVendors: VendorRow[];
  vendorNeeds1099: (entityType: VendorRow["entityType"]) => boolean;
  handleValidateTin: (vendorId: string) => void;
  handleRequestW9: (vendorId: string) => void;
  setPaymentFormMessage: Dispatch<SetStateAction<string>>;
  setIsPaymentFormOpen: Dispatch<SetStateAction<boolean>>;
  scopedVendorPayments: VendorPaymentRow[];
  duplicatePaymentIds: Set<number>;
  toUsd: (value: number) => string;
  daysLeftToFile1099: number;
  form941CountdownDays: number;
  efileMessage: string;
  selected1099Year: string;
  setSelected1099Year: Dispatch<SetStateAction<string>>;
  w2YearOptions: string[];
  handleExportIrsPackage: () => void;
  complianceAlerts: ComplianceAlert[];
  portalMonthlyTotals: PortalMonthlyTotal[];
  maxMonthlyTotal: number;
  mustFileVendorCount: number;
  filedVendorCount: number;
  rejectedVendorCount: number;
  pendingVendorCount: number;
  portalStateDistribution: PortalStateDistributionRow[];
  maxStateCount: number;
  quickbooksSync: QuickBooksSyncState;
  handleQuickBooksConnect: () => void;
  handleQuickBooksSync: () => void;
  quickbooksMessage: string;
  topCostVendor: VendorDashboardRow | null;
  maxCategorySpend: number;
  vendorDashboardRows: VendorDashboardRow[];
  updateVendorFilingLifecycle: (vendorId: string, status: FilingLifecycleStatus) => void;
  filingLifecycleOptions: FilingLifecycleStatus[];
  handleCreateOnboardingLink: () => void;
  setActiveOnboardingToken: Dispatch<SetStateAction<string>>;
  setW9Form: Dispatch<SetStateAction<any>>;
  w9FormTemplate: any;
  onboardingInvites: OnboardingInvite[];
  activeCompanyId: string;
  handleStartSelfOnboarding: (token: string) => void;
  onboardingSubmissions: OnboardingSubmission[];
  handleApproveOnboardingSubmission: (submissionId: string) => void;
  handleVendorDocUpload: (event: FormEvent<HTMLFormElement>) => void;
  vendorDocForm: VendorDocFormState;
  setVendorDocForm: Dispatch<SetStateAction<VendorDocFormState>>;
  setVendorDocFile: Dispatch<SetStateAction<File | null>>;
  scopedVendorDocuments: VendorDocument[];
  selected1099VendorId: string;
  setSelected1099VendorId: Dispatch<SetStateAction<string>>;
  vendors: VendorRow[];
  handlePrintReport: () => void;
  formSignerName: string;
  setFormSignerName: Dispatch<SetStateAction<string>>;
  handleSign1099Form: () => void;
  selected1099Signature: SignatureRecord | null;
  employerProfile: EmployerProfile;
  selected1099Vendor: VendorRow | null;
  selected1099VendorTotal: number;
  selected1099VendorYearPayments: VendorPaymentRow[];
};

export function PortalView({
  portalSection,
  setPortalSection,
  tinCheckMessage,
  w9RequestMessage,
  setIsW9FormOpen,
  setVendorFormMessage,
  setIsVendorFormOpen,
  scopedVendors,
  vendorNeeds1099,
  handleValidateTin,
  handleRequestW9,
  setPaymentFormMessage,
  setIsPaymentFormOpen,
  scopedVendorPayments,
  duplicatePaymentIds,
  toUsd,
  daysLeftToFile1099,
  form941CountdownDays,
  efileMessage,
  selected1099Year,
  setSelected1099Year,
  w2YearOptions,
  handleExportIrsPackage,
  complianceAlerts,
  portalMonthlyTotals,
  maxMonthlyTotal,
  mustFileVendorCount,
  filedVendorCount,
  rejectedVendorCount,
  pendingVendorCount,
  portalStateDistribution,
  maxStateCount,
  quickbooksSync,
  handleQuickBooksConnect,
  handleQuickBooksSync,
  quickbooksMessage,
  topCostVendor,
  maxCategorySpend,
  vendorDashboardRows,
  updateVendorFilingLifecycle,
  filingLifecycleOptions,
  handleCreateOnboardingLink,
  setActiveOnboardingToken,
  setW9Form,
  w9FormTemplate,
  onboardingInvites,
  activeCompanyId,
  handleStartSelfOnboarding,
  onboardingSubmissions,
  handleApproveOnboardingSubmission,
  handleVendorDocUpload,
  vendorDocForm,
  setVendorDocForm,
  setVendorDocFile,
  scopedVendorDocuments,
  selected1099VendorId,
  setSelected1099VendorId,
  vendors,
  handlePrintReport,
  formSignerName,
  setFormSignerName,
  handleSign1099Form,
  selected1099Signature,
  employerProfile,
  selected1099Vendor,
  selected1099VendorTotal,
  selected1099VendorYearPayments,
}: PortalViewProps) {
  return (
    <>
      {portalSection === "vendors" && (
        <>
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div>
              <p className="text-[12px] font-bold tracking-tight text-slate-500">
                Vendor sheet is your master registry for tax identity and entity classification.
              </p>
              {(tinCheckMessage || w9RequestMessage) && (
                <div className="mt-2 flex gap-2">
                  {tinCheckMessage && <span className="badge-info text-[10px]">{tinCheckMessage}</span>}
                  {w9RequestMessage && <span className="badge-warning text-[10px]">{w9RequestMessage}</span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setPortalSection("w9");
                  setIsW9FormOpen(true);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-bold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
              >
                W-9 Intake
              </button>
              <button
                type="button"
                onClick={() => {
                  setVendorFormMessage("");
                  setIsVendorFormOpen(true);
                }}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-[12px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] transition-all hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Add Vendor
              </button>
            </div>
          </div>

          <div className="overflow-x-auto px-6 pb-6 pt-4">
            <table className="min-w-[1860px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Vendor ID</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Vendor Name</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Address</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Email</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Phone</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Category</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Tax ID Type</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Tax ID</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">State</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">ZIP</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Entity Type</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">1099 Rule</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">TIN Match</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">W-9 Status</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedVendors.map((vendor) => (
                  <tr key={vendor.vendorId} className="table-row-hover text-[12px] text-slate-700">
                    <td className="px-4 py-3 font-extrabold text-slate-900">{vendor.vendorId}</td>
                    <td className="px-4 py-3 font-bold">{vendor.legalName}</td>
                    <td className="px-4 py-3 text-slate-500">{vendor.address}</td>
                    <td className="px-4 py-3 text-slate-500">{vendor.email}</td>
                    <td className="px-4 py-3 text-slate-500">{vendor.phone || "-"}</td>
                    <td className="px-4 py-3"><span className="badge-info leading-none">{vendor.category}</span></td>
                    <td className="px-4 py-3 text-slate-400 font-bold">{vendor.taxIdType}</td>
                    <td className="px-4 py-3 font-mono font-medium">{vendor.taxId}</td>
                    <td className="px-4 py-3 text-slate-500">{vendor.state}</td>
                    <td className="px-4 py-3 text-slate-500">{vendor.zipCode || "-"}</td>
                    <td className="px-4 py-3 font-medium text-slate-600">{vendor.entityType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge-${vendorNeeds1099(vendor.entityType) ? "info" : "neutral"} min-w-[90px] text-center`}
                      >
                        {vendorNeeds1099(vendor.entityType) ? "Track for 1099" : "Exempt"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge-${
                          vendor.tinVerification === "Verified"
                            ? "success"
                            : vendor.tinVerification === "Invalid"
                              ? "error"
                              : "warning"
                        } min-w-[70px] text-center`}
                      >
                        {vendor.tinVerification}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge-${
                          vendor.w9RequestStatus === "Signed"
                            ? "success"
                            : vendor.w9RequestStatus === "Sent"
                              ? "warning"
                              : "neutral"
                        } min-w-[90px] text-center`}
                      >
                        {vendor.w9RequestStatus ?? "Not Requested"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleValidateTin(vendor.vendorId)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
                        >
                          Validate
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestW9(vendor.vendorId)}
                          className="rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-600 transition-all hover:bg-blue-100 active:scale-[0.98]"
                        >
                          Request W-9
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {portalSection === "payments" && (
        <>
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <p className="text-[12px] font-bold tracking-tight text-slate-500">
              Payment sheet logs disbursements with automatic year and quarter tagging.
            </p>
            <button
              type="button"
              onClick={() => {
                setPaymentFormMessage("");
                setIsPaymentFormOpen(true);
              }}
              disabled={scopedVendors.length === 0}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-[12px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Payment
            </button>
          </div>

          <div className="overflow-x-auto px-6 pb-6 pt-4">
            <table className="min-w-[1380px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Date</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Vendor ID</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Vendor Name</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Invoice #</th>
                  <th className="px-4 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-300">Amount</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">State</th>
                  <th className="px-4 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-300">Withholding</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Year</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Quarter</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Risk</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedVendorPayments
                  .slice()
                  .sort((a, b) => b.paymentDate.localeCompare(a.paymentDate))
                  .map((payment) => {
                    const vendor = scopedVendors.find((row) => row.vendorId === payment.vendorId);
                    const duplicateRisk = duplicatePaymentIds.has(payment.id);

                    return (
                      <tr
                        key={payment.id}
                        className={`table-row-hover text-[12px] text-slate-700 ${duplicateRisk ? "bg-amber-50/30" : ""}`}
                      >
                        <td className="px-4 py-3 text-slate-400 font-medium">{payment.paymentDate}</td>
                        <td className="px-4 py-3 font-extrabold text-slate-900">{payment.vendorId}</td>
                        <td className="px-4 py-3 font-bold">
                          {vendor?.legalName ?? (payment.vendorId === "UNASSIGNED" ? "Unassigned Pool" : "-")}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{payment.invoiceNumber}</td>
                        <td className="px-4 py-3 text-right font-black text-slate-900">{toUsd(payment.amount)}</td>
                        <td className="px-4 py-3 text-slate-500">{payment.paymentState}</td>
                        <td className="px-4 py-3 text-right text-slate-500 font-bold">{toUsd(payment.stateWithholding)}</td>
                        <td className="px-4 py-3 text-slate-400">{payment.year}</td>
                        <td className="px-4 py-3 text-slate-400"><span className="badge-neutral">{payment.quarter}</span></td>
                        <td className="px-4 py-3">
                          <span
                            className={`badge-${duplicateRisk ? "warning" : "success"} min-w-[70px] text-center`}
                          >
                            {duplicateRisk ? "Duplicate Risk" : "Clear"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {payment.attachmentUrl ? (
                            <a href={payment.attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 hover:underline">
                              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></svg>
                              {payment.attachmentName || "View File"}
                            </a>
                          ) : (
                            <span className="text-slate-300 font-medium italic">No document</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {portalSection === "dashboard" && (
        <>
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div>
              <p className="text-[12px] font-bold tracking-tight text-slate-500">
                Quarterly compliance overview: totals, thresholds, and multi-state filing status.
              </p>
              <div className="mt-2 flex gap-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5"><span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" /></span>{daysLeftToFile1099} Days to 1099-NEC Deadline</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{form941CountdownDays} Days to Form 941</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selected1099Year}
                onChange={(event) => setSelected1099Year(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-slate-700 outline-none transition-all focus:border-blue-500"
              >
                {w2YearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
              <button
                type="button"
                onClick={handleExportIrsPackage}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-900 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Export Pub 1220
              </button>
            </div>
          </div>

          {efileMessage && (
            <div className="mx-6 mt-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                <CircleAlert className="h-4 w-4" />
              </div>
              <p className="text-[12px] font-bold text-blue-800">{efileMessage}</p>
            </div>
          )}

          {complianceAlerts.length > 0 && (
            <div className="mx-6 mt-4 space-y-3">
              {complianceAlerts.map((alert, index) => (
                <div
                  key={`${alert.message}-${index}`}
                  className={`flex items-center gap-3 rounded-2xl border p-4 transition-all hover:translate-x-1 ${
                    alert.level === "critical" 
                      ? "border-rose-100 bg-rose-50/50 text-rose-800 shadow-sm" 
                      : "border-amber-100 bg-amber-50/50 text-amber-800 shadow-sm"
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg shadow-sm ${
                    alert.level === "critical" ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                  }`}>
                    <CircleAlert className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {alert.level === "critical" ? "Critical Priority" : "Compliance Alert"}
                    </p>
                    <p className="text-[12px] font-bold">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 px-6 pt-6 lg:grid-cols-4">
            <section className="surface-panel rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Annual Trend</p>
              <div className="mt-5 space-y-4">
                {portalMonthlyTotals.map((row) => (
                  <div key={row.month} className="group">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">{row.label}</span>
                      <span className="text-slate-900">{toUsd(row.total)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 group-hover:from-blue-500 group-hover:to-blue-300" 
                        style={{ width: `${Math.max((row.total / maxMonthlyTotal) * 100, 4)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-panel rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">1099 Pipeline</p>
              <div className="mt-5 space-y-3">
                {[
                  { label: "MUST FILE", val: mustFileVendorCount, color: "rose" },
                  { label: "Accepted", val: filedVendorCount, color: "emerald" },
                  { label: "Rejected", val: rejectedVendorCount, color: "rose" },
                  { label: "Pending", val: pendingVendorCount, color: "amber" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50/50 p-2.5 px-3">
                    <span className="text-[11px] font-bold text-slate-500">{item.label}</span>
                    <span className={`text-[13px] font-black text-${item.color}-600`}>{item.val}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-panel rounded-2xl p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">State Distribution</p>
              <div className="mt-5 space-y-4">
                {portalStateDistribution.map((row) => (
                  <div key={row.state} className="group">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-500">{row.state}</span>
                      <span className="text-slate-900">{row.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div 
                        className="h-full rounded-full bg-slate-400 transition-all duration-500 group-hover:bg-blue-500" 
                        style={{ width: `${Math.max((row.count / maxStateCount) * 100, 10)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-panel rounded-2xl p-5 border-blue-100/50">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">QuickBooks Sync</p>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="mt-5 space-y-2 text-[11px]">
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="font-bold text-slate-400">Status</span>
                  <span className={`font-black ${quickbooksSync.connected ? "text-emerald-600" : "text-rose-600"}`}>
                    {quickbooksSync.connected ? "Active" : "Disconnected"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-1.5">
                  <span className="font-bold text-slate-400">Realm</span>
                  <span className="font-black text-slate-900">{quickbooksSync.realmId || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-400">Vendors</span>
                  <span className="font-black text-slate-900">{quickbooksSync.vendorsSynced}</span>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={handleQuickBooksConnect} className="flex-1 rounded-xl border border-slate-200 py-2 text-[11px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]">
                  Connect
                </button>
                <button type="button" onClick={handleQuickBooksSync} className="flex-1 rounded-xl bg-blue-600 py-2 text-[11px] font-bold text-white shadow-md shadow-blue-600/20 active:scale-[0.98]">
                  Sync
                </button>
              </div>
              {quickbooksMessage && <p className="mt-3 text-center text-[10px] font-bold text-blue-600/80">{quickbooksMessage}</p>}
            </section>
          </div>
          <div className="mx-6 mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50/40 p-5 text-[12px]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Cost Vendor</p>
                <p className="font-extrabold text-slate-900">
                  {topCostVendor ? `${topCostVendor.legalName} (${toUsd(topCostVendor.totalPaid)})` : "No data available"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm text-slate-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Category Spend</p>
                <p className="font-extrabold text-slate-900">{toUsd(maxCategorySpend)}</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto px-6 pb-6 pt-6">
            <table className="min-w-[1430px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Vendor ID</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Vendor Name</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Entity</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Tax ID</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">TIN</th>
                  <th className="px-4 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-300">Total Paid</th>
                  <th className="px-4 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-300">Threshold</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300 text-center">Progress Tracking</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Compliance</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorDashboardRows.map((row) => (
                  <tr key={row.vendorId} className="table-row-hover text-[12px] text-slate-700">
                    <td className="px-4 py-4 font-extrabold text-slate-900">{row.vendorId}</td>
                    <td className="px-4 py-4 font-bold">{row.legalName}</td>
                    <td className="px-4 py-4 text-slate-500">{row.entityType}</td>
                    <td className="px-4 py-4 font-mono text-[11px]"><span className="text-slate-400 mr-1">{row.taxIdType}</span>{row.taxId}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`badge-${row.tinVerification === "Verified" ? "success" : row.tinVerification === "Invalid" ? "error" : "warning"} min-w-[70px]`}>
                        {row.tinVerification}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-black text-slate-900">{toUsd(row.totalPaid)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`badge-${row.totalPaid >= 600 ? "warning" : "neutral"} font-bold`}>
                        {row.totalPaid >= 600 ? "Triggered" : "Below"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="min-w-[180px]">
                        <div className="mb-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                          <span className={row.totalPaid >= 600 ? "text-amber-600" : "text-blue-600"}>{Math.round(row.thresholdProgress * 100)}%</span>
                          <span className="text-slate-400">{row.thresholdRemaining > 0 ? `${toUsd(row.thresholdRemaining)} to go` : "Filing Required"}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${row.totalPaid >= 600 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" : "bg-blue-500"}`}
                            style={{ width: `${Math.max(row.thresholdProgress * 100, 3)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`badge-${row.filingStatus === "MUST FILE" ? "error" : "success"} min-w-[80px] text-center`}>
                        {row.filingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={row.lifecycleStatus}
                        onChange={(event) => updateVendorFilingLifecycle(row.vendorId, event.target.value as FilingLifecycleStatus)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 outline-none hover:border-slate-300 transition-all focus:border-blue-500"
                      >
                        {filingLifecycleOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {portalSection === "w9" && (
        <>
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <p className="text-[12px] font-bold tracking-tight text-slate-500">
              Send intake requests to vendors to collect W-9 data electronically.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCreateOnboardingLink}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-bold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]"
              >
                Generate Intake Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveOnboardingToken(`manual-${Date.now()}`);
                  setW9Form(w9FormTemplate);
                  setIsW9FormOpen(true);
                }}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Manual Entry
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 px-6 py-6">
            <div className="surface-panel rounded-2xl p-5 border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Intake Records</p>
              <p className="mt-2 text-[28px] font-black text-slate-900">{scopedVendors.length}</p>
            </div>
            <div className="surface-panel rounded-2xl p-5 border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">W-9 Onboarded</p>
              <p className="mt-2 text-[28px] font-black text-slate-900">
                {scopedVendors.filter((v) => v.onboardingSource === "W-9 Intake").length}
              </p>
            </div>
            <div className="surface-panel rounded-2xl p-5 border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">TIN Ready</p>
              <p className="mt-2 text-[28px] font-black text-emerald-600">
                {scopedVendors.filter((v) => v.tinVerification === "Verified").length}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto px-6 pb-6">
            <table className="min-w-[1160px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Vendor ID</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Legal Name</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">ID Type</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Tax ID</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">State</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Source</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">TIN Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedVendors.map((vendor) => (
                  <tr key={`w9-${vendor.vendorId}`} className="table-row-hover text-[12px] text-slate-700">
                    <td className="px-4 py-3.5 font-extrabold text-slate-900">{vendor.vendorId}</td>
                    <td className="px-4 py-3.5 font-bold">{vendor.legalName}</td>
                    <td className="px-4 py-3.5 text-slate-400 font-bold text-[11px]">{vendor.taxIdType}</td>
                    <td className="px-4 py-3.5 font-mono text-[11px]">{vendor.taxId}</td>
                    <td className="px-4 py-3.5 text-slate-500">{vendor.state}</td>
                    <td className="px-4 py-3.5"><span className="badge-info">{vendor.onboardingSource}</span></td>
                    <td className="px-4 py-3.5">
                      <span className={`badge-${vendor.tinVerification === "Verified" ? "success" : "warning"}`}>
                        {vendor.tinVerification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <div className="grid grid-cols-2 gap-6 px-6 pb-6">
            <section className="surface-panel rounded-2xl p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Onboarding Links</p>
              <div className="space-y-3">
                {onboardingInvites
                  .filter((invite) => invite.companyId === activeCompanyId)
                  .slice(0, 6)
                  .map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3 transition-all hover:border-slate-200">
                      <div className="flex-1 truncate mr-4">
                        <p className="font-bold text-slate-800 text-[12px] truncate">{`taxcore360.com/onboard/${invite.token}`}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{invite.status}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStartSelfOnboarding(invite.token)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
                      >
                        Copy Link
                      </button>
                    </div>
                  ))}
              </div>
            </section>

            <section className="surface-panel rounded-2xl p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Pending Approvals</p>
              <div className="space-y-3">
                {onboardingSubmissions
                  .filter((submission) => submission.companyId === activeCompanyId)
                  .slice(0, 6)
                  .map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3">
                      <div>
                        <p className="font-extrabold text-slate-900 text-[12px]">{submission.legalName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{submission.taxIdType}: {submission.taxId}</p>
                      </div>
                      {submission.approvalStatus === "Approved" ? (
                        <span className="badge-success">Approved</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApproveOnboardingSubmission(submission.id)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-blue-600/20 active:scale-[0.98]"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          </div>
        </>
      )}

      {portalSection === "vault" && (
        <>
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <p className="text-[12px] font-bold tracking-tight text-slate-500">
              Audit-ready archive for vendor agreements, W-9s, and issued 1099 copies.
            </p>
          </div>

          <form 
            onSubmit={handleVendorDocUpload} 
            className="grid grid-cols-[1.2fr_1fr_1.2fr_1fr_auto] items-end gap-4 border-b border-slate-100 bg-white px-6 py-6"
          >
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Vendor</span>
              <select
                value={vendorDocForm.vendorId}
                onChange={(event) => setVendorDocForm((prev) => ({ ...prev, vendorId: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500 transition-all"
              >
                <option value="">Select Vendor</option>
                {scopedVendors.map((vendor) => (
                  <option key={vendor.vendorId} value={vendor.vendorId}>
                    {vendor.vendorId} — {vendor.legalName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</span>
              <select
                value={vendorDocForm.category}
                onChange={(event) => setVendorDocForm((prev) => ({ ...prev, category: event.target.value as VendorDocument["category"] }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500 transition-all"
              >
                <option value="Invoice">Invoice</option>
                <option value="Contract">Contract</option>
                <option value="W-9">W-9</option>
                <option value="1099 Copy">1099 Copy</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description / Notes</span>
              <input
                value={vendorDocForm.note}
                onChange={(event) => setVendorDocForm((prev) => ({ ...prev, note: event.target.value }))}
                placeholder="Brief description..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">File Attachment</span>
              <input
                type="file"
                onChange={(event) => setVendorDocFile(event.target.files?.[0] ?? null)}
                className="w-full text-[12px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
              />
            </div>

            <button 
              type="submit" 
              className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
            >
              Upload
            </button>
          </form>

          <div className="overflow-x-auto px-6 pb-6 pt-6">
            <table className="min-w-[980px] overflow-hidden rounded-2xl border border-slate-200/60 bg-white">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Vendor</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Category</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Document Name</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Upload Date</th>
                  <th className="px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-widest text-slate-300">Notes</th>
                  <th className="px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedVendorDocuments.map((document) => {
                  const vendor = scopedVendors.find((row) => row.vendorId === document.vendorId);
                  return (
                    <tr key={document.id} className="table-row-hover text-[12px] text-slate-700">
                      <td className="px-4 py-4 font-extrabold text-slate-900">{vendor?.legalName ?? document.vendorId}</td>
                      <td className="px-4 py-4">
                        <span className={`badge-${document.category === "W-9" ? "success" : document.category === "1099 Copy" ? "info" : "neutral"} font-bold`}>
                          {document.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium italic text-slate-500">{document.fileName}</td>
                      <td className="px-4 py-4 text-slate-400 font-bold">{new Date(document.uploadedAt).toLocaleDateString("en-US")}</td>
                      <td className="px-4 py-4 text-slate-600 max-w-[200px] truncate">{document.note || "—"}</td>
                      <td className="px-4 py-4 text-center">
                        {document.fileUrl ? (
                          <a 
                            href={document.fileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 transition-all hover:bg-blue-100"
                          >
                            View Document
                          </a>
                        ) : (
                          <span className="text-slate-300 font-bold uppercase text-[10px]">No File</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {portalSection === "form" && (
        <>
          <div className="no-print flex flex-wrap items-end gap-5 border-b border-slate-100 bg-slate-50/50 px-6 py-6">
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reporting Year</span>
              <select
                value={selected1099Year}
                onChange={(event) => setSelected1099Year(event.target.value)}
                className="min-w-[120px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500 transition-all"
              >
                {w2YearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Recipient</span>
              <select
                value={selected1099VendorId}
                onChange={(event) => setSelected1099VendorId(event.target.value)}
                className="min-w-[280px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500 transition-all"
              >
                {vendors.map((vendor) => <option key={vendor.vendorId} value={vendor.vendorId}>{vendor.vendorId} — {vendor.legalName}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrintReport}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-slate-800/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all"
              >
                Print 1099-NEC
              </button>
              <a
                href="https://www.irs.gov/pub/irs-pdf/f1099nec.pdf"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-bold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]"
              >
                Official PDF
              </a>
            </div>

            <div className="flex-1 min-w-[300px] flex items-end gap-3 rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
              <div className="flex-1 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Signature Authority</span>
                <input
                  value={formSignerName}
                  onChange={(event) => setFormSignerName(event.target.value)}
                  placeholder="Enter full legal name..."
                  className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-[12px] font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-400 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleSign1099Form}
                className="rounded-xl bg-blue-600 px-5 py-2 text-[12px] font-bold text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                Apply Signature
              </button>
            </div>

            {selected1099Signature && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-[11px] font-bold text-emerald-700">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Duly Signed by {selected1099Signature.signedBy}
              </div>
            )}
          </div>

          <div id="print-1099-area" className="w2-print-wrap px-6 pb-12 pt-8 bg-slate-100/50">
            <div className="w3-sheet mx-auto w-full max-w-[1120px] rounded-2xl border border-slate-800/20 bg-white p-12 shadow-2xl relative overflow-hidden">
              {/* Official Decorative Orbs for Form Context */}
              <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 translate-y-[-50%] rounded-full bg-blue-50/50 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-64 w-64 translate-x-[-50%] translate-y-[50%] rounded-full bg-slate-50/50 blur-3xl" />

              <div className="relative z-10 mb-10 flex items-start justify-between border-b-2 border-slate-900 pb-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-900 flex items-center justify-center p-2">
                       <svg viewBox="0 0 24 24" className="text-white h-full w-full" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department of the Treasury</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Internal Revenue Service</p>
                    </div>
                  </div>
                  <h4 className="text-[42px] font-black tracking-tighter text-slate-900 leading-none">Form 1099-NEC</h4>
                  <p className="mt-2 text-[14px] font-bold text-slate-500 italic">Nonemployee Compensation — Tax Year {selected1099Year}</p>
                </div>
                <div className="text-right border-l-2 border-slate-900 pl-8 h-full flex flex-col justify-center">
                  <p className="text-[12px] font-black uppercase tracking-widest text-slate-900">OMB No. 1545-0116</p>
                  <p className="mt-2 rounded bg-slate-900 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white">Copy B - Recipient</p>
                </div>
              </div>

              <div className="relative z-10 w3-grid mb-10 grid gap-4">
                <div className="w2-box col-span-6 rounded-xl border-2 border-slate-900 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">PAYER'S name, street address, city or town, state or province, country, ZIP or foreign postal code</p>
                  <p className="text-[15px] font-black text-slate-900 leading-tight">{employerProfile.legalName}</p>
                  <p className="text-[14px] font-bold text-slate-600 mt-1">{employerProfile.addressLine1}</p>
                  {employerProfile.addressLine2 && <p className="text-[14px] font-bold text-slate-600">{employerProfile.addressLine2}</p>}
                </div>
                <div className="w2-box col-span-3 rounded-xl border-2 border-slate-900 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">PAYER'S TIN</p>
                  <p className="text-[18px] font-black text-slate-900 tracking-widest">{employerProfile.ein}</p>
                </div>
                <div className="w2-box col-span-3 rounded-xl border-2 border-slate-900 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">RECIPIENT'S TIN ({selected1099Vendor?.taxIdType || "SSN"})</p>
                  <p className="text-[18px] font-black text-slate-900 tracking-widest">{selected1099Vendor?.taxId || "— — —"}</p>
                </div>

                <div className="w2-box col-span-8 rounded-xl border-2 border-slate-900 p-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">RECIPIENT'S name, street address, city or town, state or province, country, ZIP or foreign postal code</p>
                  <p className="text-[18px] font-black text-slate-900 mb-2">{selected1099Vendor?.legalName || "—"}</p>
                  <p className="text-[14px] font-bold text-slate-700">{selected1099Vendor?.address || "No address provided"}</p>
                  <p className="text-[12px] font-bold text-slate-400 mt-2">{selected1099Vendor?.email || "No email provided"}</p>
                </div>
                <div className="w2-box col-span-4 rounded-xl border-2 border-slate-900 p-4 bg-slate-50">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">1 Nonemployee compensation</p>
                  <p className="text-[32px] font-black text-slate-900 leading-none mt-4">{toUsd(selected1099VendorTotal)}</p>
                </div>
              </div>

              <div className="relative z-10 overflow-x-auto rounded-2xl border-2 border-slate-900 overflow-hidden">
                <table className="print-table w-full">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Payment Date</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Document / Invoice</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest">Fiscal Period</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest">Amount Reported</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selected1099VendorYearPayments.map((payment) => (
                      <tr key={payment.id} className="text-[13px] text-slate-700">
                        <td className="px-6 py-4 font-bold">{payment.paymentDate}</td>
                        <td className="px-6 py-4 font-mono text-[12px]">{payment.invoiceNumber}</td>
                        <td className="px-6 py-4"><span className="badge-neutral">{payment.quarter}</span></td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">{toUsd(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="relative z-10 mt-10 flex items-center justify-between border-t-2 border-slate-100 pt-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <p>TaxCore360 Official Compliance Document</p>
                <p>Verify Authenticity at taxcore360.com/validate</p>
              </div>

              {selected1099Signature && (
                <div className="absolute bottom-20 right-20 rotate-[-12deg] pointer-events-none opacity-30 select-none">
                  <div className="rounded-xl border-4 border-emerald-600 p-6">
                    <p className="text-[24px] font-black text-emerald-600 uppercase">Electronically Signed</p>
                    <p className="text-[14px] font-black text-emerald-600 mt-1">{selected1099Signature.signedBy}</p>
                    <p className="text-[10px] font-bold text-emerald-600 mt-1">{new Date(selected1099Signature.signedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}