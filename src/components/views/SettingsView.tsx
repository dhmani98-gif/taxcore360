import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { CommunicationChannel, ComplianceMessageLog, EmployerProfile, SubscriptionSettings } from "../../app/types";

type SettingsViewProps = {
  platformName: string;
  setPlatformName: Dispatch<SetStateAction<string>>;
  employerProfile: EmployerProfile;
  setEmployerProfile: Dispatch<SetStateAction<EmployerProfile>>;
  subscriptionSettings: SubscriptionSettings;
  setSubscriptionSettings: Dispatch<SetStateAction<SubscriptionSettings>>;
  formSignerName: string;
  setFormSignerName: Dispatch<SetStateAction<string>>;
  brandLogoName: string;
  handleBrandLogoUpload: (file: File | null) => void;
  handleSendComplianceReminder: (channel: CommunicationChannel) => void;
  complianceMessageLog: ComplianceMessageLog[];
  settingsMessage: string;
  handleExportAuditZip: () => void;
  handleExportTaxDeadlinesCalendar: () => void;
  handleSaveSettings: (event: FormEvent<HTMLFormElement>) => void;
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const labelCls = "text-[10px] font-bold uppercase tracking-wider text-slate-400";
const ghostBtnCls =
  "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[12px] font-bold text-slate-600 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm active:scale-[0.98]";

export function SettingsView({
  platformName,
  setPlatformName,
  employerProfile,
  setEmployerProfile,
  subscriptionSettings,
  setSubscriptionSettings,
  formSignerName,
  setFormSignerName,
  brandLogoName,
  handleBrandLogoUpload,
  handleSendComplianceReminder,
  complianceMessageLog,
  settingsMessage,
  handleExportAuditZip,
  handleExportTaxDeadlinesCalendar,
  handleSaveSettings,
}: SettingsViewProps) {
  return (
    <div className="px-6 py-6 animate-fade-in">
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Company Profile */}
        <div className="surface-panel rounded-2xl p-6">
          <p className="mb-5 text-[12px] font-bold uppercase tracking-wider text-slate-400">Company Profile</p>
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2"><span className={labelCls}>Platform Name</span><input value={platformName} onChange={(e) => setPlatformName(e.target.value)} className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Legal Name</span><input value={employerProfile.legalName} onChange={(e) => setEmployerProfile((p) => ({ ...p, legalName: e.target.value }))} className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Employer EIN</span><input value={employerProfile.ein} onChange={(e) => setEmployerProfile((p) => ({ ...p, ein: e.target.value }))} className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Control Number</span><input value={employerProfile.controlNumber} onChange={(e) => setEmployerProfile((p) => ({ ...p, controlNumber: e.target.value }))} className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Address Line 1</span><input value={employerProfile.addressLine1} onChange={(e) => setEmployerProfile((p) => ({ ...p, addressLine1: e.target.value }))} className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Address Line 2</span><input value={employerProfile.addressLine2} onChange={(e) => setEmployerProfile((p) => ({ ...p, addressLine2: e.target.value }))} className={inputCls} /></label>
          </div>
        </div>

        {/* Subscription */}
        <div className="surface-panel rounded-2xl p-6">
          <p className="mb-5 text-[12px] font-bold uppercase tracking-wider text-slate-400">Subscription & Compliance</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-4">
              <p className={labelCls}>Active Plan</p>
              <p className="mt-2 text-[16px] font-extrabold text-slate-900">{subscriptionSettings.plan}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-4">
              <p className={labelCls}>Billing Cycle</p>
              <p className="mt-2 text-[16px] font-extrabold text-slate-900">{subscriptionSettings.billingCycle}</p>
            </div>
            <label className="space-y-2"><span className={labelCls}>Renewal Date</span><input type="date" value={subscriptionSettings.renewalDate} onChange={(e) => setSubscriptionSettings((p) => ({ ...p, renewalDate: e.target.value, status: "Active" }))} className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Seats</span><input type="number" min={1} value={subscriptionSettings.seats} onChange={(e) => setSubscriptionSettings((p) => ({ ...p, seats: Number(e.target.value) || p.seats }))} className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Authorized Signer</span><input value={formSignerName} onChange={(e) => setFormSignerName(e.target.value)} className={inputCls} /></label>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="surface-panel rounded-2xl p-6">
          <p className={labelCls}>Brand Logo</p>
          <div className="mt-3 flex items-center gap-4">
            <label className="cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-white px-8 py-5 text-center transition-all hover:border-blue-400 hover:bg-blue-50/30">
              <p className="text-[12px] font-semibold text-slate-500">Click to upload</p>
              <p className="mt-0.5 text-[10px] text-slate-400">.png · .jpg · .jpeg</p>
              <input type="file" accept=".png,.jpg,.jpeg" onChange={(e) => handleBrandLogoUpload(e.target.files?.[0] ?? null)} className="hidden" />
            </label>
            {brandLogoName ? <span className="badge-info">{brandLogoName}</span> : null}
          </div>
        </div>

        {/* Communication */}
        <div className="surface-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className={labelCls}>Compliance Communication</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => handleSendComplianceReminder("Email")} className={ghostBtnCls}>Send Email</button>
              <button type="button" onClick={() => handleSendComplianceReminder("SMS")} className={ghostBtnCls}>Send SMS</button>
            </div>
          </div>
          <p className="mt-2 text-[12px] text-slate-400">Sent: <span className="font-bold text-slate-600">{complianceMessageLog.length}</span></p>
          <div className="mt-3 max-h-28 space-y-1.5 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            {complianceMessageLog.slice(0, 4).map((log) => (
              <p key={log.id} className="text-[11px] text-slate-500">{log.channel} to {log.vendorId} at {new Date(log.sentAt).toLocaleString("en-US")}</p>
            ))}
            {complianceMessageLog.length === 0 ? <p className="text-[11px] text-slate-400">No reminders sent yet.</p> : null}
          </div>
        </div>

        {settingsMessage ? <div className="animate-fade-in rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-semibold text-emerald-700">{settingsMessage}</div> : null}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <button type="button" onClick={handleExportAuditZip} className={ghostBtnCls}>Export Audit ZIP</button>
          <button type="button" onClick={handleExportTaxDeadlinesCalendar} className={ghostBtnCls}>Export Calendar (.ics)</button>
          <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-[12px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] transition-all hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98]">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}