import type { Dispatch, SetStateAction } from "react";
import type { EmployeeRow, PaymentMethod, PayrollPaymentRecord, PayrollRow } from "../../app/types";

type PayrollViewProps = {
  activeEmployees: EmployeeRow[];
  selectedPayrollMonth: string;
  setSelectedPayrollMonth: Dispatch<SetStateAction<string>>;
  payrollMonthOptions: string[];
  getMonthRange: (month: string) => { label: string };
  bulkPaymentMethod: PaymentMethod;
  setBulkPaymentMethod: Dispatch<SetStateAction<PaymentMethod>>;
  bulkPayDate: string;
  setBulkPayDate: Dispatch<SetStateAction<string>>;
  handleBulkPayrollPay: () => void;
  isCurrentMonthPaid: boolean;
  paidEmployeeCount: number;
  payrollTableRows: PayrollRow[];
  getPayrollPaymentRecord: (employeeId: number, month: string) => PayrollPaymentRecord;
  handleRowPaymentMethodChange: (employeeId: number, paymentMethod: PaymentMethod) => void;
  getDefaultPaymentDate: (month: string) => string;
};

export function PayrollView({
  activeEmployees,
  selectedPayrollMonth,
  setSelectedPayrollMonth,
  payrollMonthOptions,
  getMonthRange,
  bulkPaymentMethod,
  setBulkPaymentMethod,
  bulkPayDate,
  setBulkPayDate,
  handleBulkPayrollPay,
  isCurrentMonthPaid,
  paidEmployeeCount,
  payrollTableRows,
  getPayrollPaymentRecord,
  handleRowPaymentMethodChange,
  getDefaultPaymentDate,
}: PayrollViewProps) {
  const selectCls =
    "rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[12px] font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
  const labelCls = "text-[10px] font-bold uppercase tracking-wider text-slate-400";

  return (
    <>
      {/* ── Controls ── */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-3">
          <p className={labelCls}>Month</p>
          <select value={selectedPayrollMonth} onChange={(e) => setSelectedPayrollMonth(e.target.value)} className={selectCls}>
            {payrollMonthOptions.map((m) => <option key={m} value={m}>{getMonthRange(m).label}</option>)}
          </select>
        </div>
        <p className="text-[12px] text-slate-400">USD · Monthly · Active: <span className="font-bold text-slate-600">{activeEmployees.length}</span></p>
      </div>

      {/* ── Bulk Actions ── */}
      <div className="flex flex-wrap items-end gap-4 border-b border-slate-100 bg-slate-50/40 px-6 py-4">
        <label className="space-y-1.5">
          <span className={labelCls}>Method</span>
          <select value={bulkPaymentMethod} onChange={(e) => setBulkPaymentMethod(e.target.value as PaymentMethod)} className={selectCls}>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Check">Check</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className={labelCls}>Pay Date</span>
          <input type="date" value={bulkPayDate} onChange={(e) => setBulkPayDate(e.target.value)} className={selectCls} />
        </label>
        <button type="button" onClick={handleBulkPayrollPay} className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-[12px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] transition-all hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98]">
          {isCurrentMonthPaid ? "Re-Run Payroll" : "Pay All Active"}
        </button>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2">
          <span className={`h-2 w-2 rounded-full ${paidEmployeeCount === activeEmployees.length && activeEmployees.length > 0 ? "bg-emerald-500" : "bg-amber-400"}`} />
          <p className="text-[11px] font-bold text-slate-600 tabular-nums">{paidEmployeeCount}/{activeEmployees.length}</p>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto px-5 pb-5 pt-4">
        <table className="min-w-[1780px] w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700">
              {["Employee", "Dept", "Period", "Gross", "Fed W/H", "SS 6.2%", "Medicare", "State Tax", "Pre-tax", "Net Pay", "Method", "Pay Date", "Status"].map(
                (h, i) => (
                  <th key={h} className={`border-r border-white/5 px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-300 whitespace-nowrap ${
                    i >= 3 && i <= 9 ? "text-right" : "text-left"
                  } ${i === 12 ? "border-r-0" : ""}`}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {payrollTableRows.map((row, index) => {
              const rec = getPayrollPaymentRecord(row.id, selectedPayrollMonth);
              return (
                <tr key={row.id} className={`table-row-hover text-[13px] text-slate-700 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                  <td className="border-r border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">{row.employee}</td>
                  <td className="border-r border-b border-slate-100 px-4 py-3">{row.department}</td>
                  <td className="border-r border-b border-slate-100 px-4 py-3 whitespace-nowrap text-slate-500">{row.payPeriod}</td>
                  <td className="border-r border-b border-slate-100 px-4 py-3 text-right tabular-nums">{row.grossPay}</td>
                  <td className="border-r border-b border-slate-100 px-4 py-3 text-right tabular-nums">{row.federalWithholding}</td>
                  <td className="border-r border-b border-slate-100 px-4 py-3 text-right tabular-nums">{row.socialSecurity}</td>
                  <td className="border-r border-b border-slate-100 px-4 py-3 text-right tabular-nums">{row.medicare}</td>
                  <td className="border-r border-b border-slate-100 px-4 py-3 text-right tabular-nums">{row.stateTax}</td>
                  <td className="border-r border-b border-slate-100 px-4 py-3 text-right tabular-nums">{row.pretaxDeductions}</td>
                  <td className="border-r border-b border-slate-100 px-4 py-3 text-right font-bold tabular-nums text-slate-900">{row.netPay}</td>
                  <td className="border-r border-b border-slate-100 px-4 py-2.5">
                    <select
                      value={rec.paymentMethod}
                      onChange={(e) => handleRowPaymentMethodChange(row.id, e.target.value as PaymentMethod)}
                      className="w-full min-w-[120px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 outline-none focus:border-blue-500"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Check">Check</option>
                    </select>
                  </td>
                  <td className="border-r border-b border-slate-100 px-4 py-3 text-[12px] font-semibold text-slate-600 whitespace-nowrap tabular-nums">
                    {rec.isPaid ? rec.payDate : bulkPayDate || getDefaultPaymentDate(selectedPayrollMonth)}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3">
                    <span className={rec.isPaid ? "badge-success" : "badge-warning"}>
                      <span className={`h-1.5 w-1.5 rounded-full ${rec.isPaid ? "bg-emerald-500" : "bg-amber-400"}`} />
                      {rec.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}