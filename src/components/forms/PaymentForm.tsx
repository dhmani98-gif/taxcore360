import React from "react";
import { vendorService } from "../../services/vendorService";
import { usStateOptions } from "../../app/data";

interface PaymentFormProps {
  paymentForm: any;
  setPaymentForm: React.Dispatch<React.SetStateAction<any>>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  message?: string;
  attachment: File | null;
  setAttachment: React.Dispatch<React.SetStateAction<File | null>>;
  ocrText: string;
  setOcrText: React.Dispatch<React.SetStateAction<string>>;
  scanMessage?: string;
  onAutoScan: () => void;
  scopedVendors: any[];
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const labelCls = "text-[10px] font-bold uppercase tracking-wider text-slate-400";

export const PaymentForm: React.FC<PaymentFormProps> = ({
  paymentForm,
  setPaymentForm,
  isOpen,
  onClose,
  onSubmit,
  message,
  setAttachment,
  ocrText,
  setOcrText,
  scanMessage,
  onAutoScan,
  scopedVendors,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-6 py-10" onClick={onClose}>
      <div className="modal-content max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200/60 bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-md px-8 py-5">
          <div>
            <h3 className="text-[22px] font-extrabold tracking-tight text-slate-900">Add Vendor Payment</h3>
            <p className="mt-0.5 text-[13px] text-slate-400">Log one outbound payment and classify it automatically.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300">Close</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 px-8 py-7">
          {message ? <div className="animate-fade-in rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] font-medium text-amber-700">{message}</div> : null}

          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className={labelCls}>Vendor</span>
              <select value={paymentForm.vendorId} onChange={(e) => vendorService.handlePaymentFieldChange("vendorId", e.target.value, setPaymentForm)} className={inputCls}>
                <option value="">Select Vendor</option>
                <option value="UNASSIGNED">Unassigned (suspense)</option>
                {scopedVendors.map((v) => <option key={v.vendorId} value={v.vendorId}>{v.vendorId} - {v.legalName}</option>)}
              </select>
            </label>
            <label className="space-y-2"><span className={labelCls}>Payment Date</span><input type="date" value={paymentForm.paymentDate} onChange={(e) => vendorService.handlePaymentFieldChange("paymentDate", e.target.value, setPaymentForm)} className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Invoice Number</span><input value={paymentForm.invoiceNumber} onChange={(e) => vendorService.handlePaymentFieldChange("invoiceNumber", e.target.value, setPaymentForm)} placeholder="Invoice Number" className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Amount (USD)</span><input type="number" step="0.01" min="0" value={paymentForm.amount} onChange={(e) => vendorService.handlePaymentFieldChange("amount", e.target.value, setPaymentForm)} placeholder="0.00" className={inputCls} /></label>
            <label className="space-y-2">
              <span className={labelCls}>Payment State</span>
              <select value={paymentForm.paymentState} onChange={(e) => vendorService.handlePaymentFieldChange("paymentState", e.target.value, setPaymentForm)} className={inputCls}>
                <option value="">Select state</option>
                {usStateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className={labelCls}>Invoice Document</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.txt" onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-[11px] file:font-bold file:text-blue-600" />
            </label>
          </div>

          <div className="surface-panel rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold text-slate-700">OCR Auto-Scan</p>
              <button type="button" onClick={onAutoScan} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 transition-all hover:bg-slate-50">Auto Scan Invoice</button>
            </div>
            <textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              placeholder="Paste OCR text from an invoice (optional)."
              className="mt-3 h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[12px] text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            {scanMessage ? <p className="mt-2 text-[11px] font-semibold text-blue-600">{scanMessage}</p> : null}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-[13px] font-bold text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]">Cancel</button>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] transition-all hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98]">Save Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
};
