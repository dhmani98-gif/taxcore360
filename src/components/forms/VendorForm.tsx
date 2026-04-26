import React from "react";
import { vendorService } from "../../services/vendorService";
import { usStateOptions } from "../../app/data";

interface VendorFormProps {
  vendorForm: any;
  setVendorForm: React.Dispatch<React.SetStateAction<any>>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  message?: string;
  validation?: any;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const labelCls = "text-[10px] font-bold uppercase tracking-wider text-slate-400";

export const VendorForm: React.FC<VendorFormProps> = ({
  vendorForm,
  setVendorForm,
  isOpen,
  onClose,
  onSubmit,
  message,
  validation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-6 py-10" onClick={onClose}>
      <div className="modal-content max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200/60 bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-md px-8 py-5">
          <div>
            <h3 className="text-[22px] font-extrabold tracking-tight text-slate-900">Add New Vendor</h3>
            <p className="mt-0.5 text-[13px] text-slate-400">Create a vendor record for 1099 tracking and filing compliance.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300">Close</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 px-8 py-7">
          {message ? <div className="animate-fade-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-medium text-rose-600">{message}</div> : null}

          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2"><span className={labelCls}>Vendor ID</span><input value={vendorForm.vendorId} onChange={(e) => vendorService.handleVendorFieldChange("vendorId", e.target.value, setVendorForm)} placeholder="V-1010" className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Legal Name</span><input value={vendorForm.legalName} onChange={(e) => vendorService.handleVendorFieldChange("legalName", e.target.value, setVendorForm)} placeholder="Vendor legal name" className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Email</span><input value={vendorForm.email} onChange={(e) => vendorService.handleVendorFieldChange("email", e.target.value, setVendorForm)} placeholder="billing@example.com" className={inputCls} /></label>
            <label className="space-y-2">
              <span className={labelCls}>Tax ID Type</span>
              <select value={vendorForm.taxIdType} onChange={(e) => vendorService.handleVendorFieldChange("taxIdType", e.target.value, setVendorForm)} className={inputCls}>
                <option value="EIN">EIN</option><option value="SSN">SSN</option>
              </select>
            </label>
            <label className="space-y-2"><span className={labelCls}>Tax ID</span><input value={vendorForm.taxId} onChange={(e) => vendorService.handleVendorFieldChange("taxId", e.target.value, setVendorForm)} placeholder="Tax ID" className={inputCls} /></label>
            <label className="space-y-2">
              <span className={labelCls}>Entity Type</span>
              <select value={vendorForm.entityType} onChange={(e) => vendorService.handleVendorFieldChange("entityType", e.target.value, setVendorForm)} className={inputCls}>
                <option value="Individual">Individual</option><option value="LLC">LLC</option><option value="Corporation">Corporation</option><option value="Partnership">Partnership</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className={labelCls}>State</span>
              <select value={vendorForm.state} onChange={(e) => vendorService.handleVendorFieldChange("state", e.target.value, setVendorForm)} className={inputCls}>
                <option value="">Select state</option>
                {usStateOptions.map((s) => <option key={`vendor-state-${s}`} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="space-y-2"><span className={labelCls}>ZIP Code</span><input value={vendorForm.zipCode} onChange={(e) => vendorService.handleVendorFieldChange("zipCode", e.target.value, setVendorForm)} placeholder="##### or #####-####" className={inputCls} /></label>
          </div>

          <label className="space-y-2 block"><span className={labelCls}>Address</span><input value={vendorForm.address} onChange={(e) => vendorService.handleVendorFieldChange("address", e.target.value, setVendorForm)} placeholder="Street, City, State ZIP" className={inputCls} /></label>

          {validation && (
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-[12px]">
              <div>
                <p className="font-bold text-slate-500">TIN Validation</p>
                <p className={`mt-1 font-bold ${vendorForm.taxId ? (validation.tinValid ? "text-emerald-600" : "text-rose-500") : "text-slate-400"}`}>
                  {vendorForm.taxId ? (validation.tinValid ? "Format is valid" : "Invalid format") : "Awaiting Tax ID"}
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-500">ZIP / State</p>
                <p className={`mt-1 font-bold ${vendorForm.zipCode && vendorForm.state ? (validation.zipValid ? "text-emerald-600" : "text-rose-500") : "text-slate-400"}`}>
                  {vendorForm.zipCode && vendorForm.state ? (validation.zipValid ? "Matched" : "Mismatch") : "Select both"}
                </p>
              </div>
              <div>
                <p className="font-bold text-slate-500">Entity Logic</p>
                <p className={`mt-1 font-bold ${validation.isExemptEntity ? "text-amber-600" : "text-blue-600"}`}>
                  {validation.isExemptEntity ? "1099-exempt" : "Track $600 threshold"}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-[13px] font-bold text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]">Cancel</button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] transition-all hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98]">Save Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
};
