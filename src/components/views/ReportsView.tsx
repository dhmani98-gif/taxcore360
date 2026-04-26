import type { Dispatch, SetStateAction } from "react";
import type {
  EmployeeRow,
  FilingLifecycleStatus,
  PaymentMethod,
  ReportDocumentType,
  ReportFocus,
  VendorPaymentRow,
  VendorRow,
  W2SummaryRow,
} from "../../app/types";

type ReportTypeOption = {
  key: ReportFocus;
  title: string;
  text: string;
};

type PaidMonthsRow = {
  month: string;
  label: string;
  paidEmployees: number;
  grossPaid: number;
  netPaid: number;
};

type EmployeeLedgerRow = {
  month: string;
  label: string;
  paymentMethod: string;
  payDate: string;
  isPaid: boolean;
  grossPaid: number;
  netPaid: number;
};

type ReportW2Totals = {
  employeeCount: number;
  paidEmployees: number;
  wages: number;
  federalIncomeTax: number;
  socialSecurityTax: number;
  medicareTax: number;
};

type Report1099Row = VendorRow & {
  totalPaid: number;
  is1099Eligible: boolean;
  filingStatus: "MUST FILE" | "OK";
  lifecycleStatus: FilingLifecycleStatus;
};

type Report1099QuarterTotals = {
  Q1: number;
  Q2: number;
  Q3: number;
  Q4: number;
};

type ReportReconciliationTotals = {
  totalDisbursed: number;
  mappedPayments: number;
  required1099Total: number;
  unallocatedAmount: number;
  non1099Amount: number;
};

type ReportsViewProps = {
  reportFocus: ReportFocus | null;
  setReportFocus: Dispatch<SetStateAction<ReportFocus | null>>;
  reportTypeOptions: ReportTypeOption[];
  reportFocusLabel: string;
  reportDocumentType: ReportDocumentType;
  setReportDocumentType: Dispatch<SetStateAction<ReportDocumentType>>;
  selectedReportYear: string;
  setSelectedReportYear: Dispatch<SetStateAction<string>>;
  w2YearOptions: string[];
  selectedReportEmployeeId: number;
  setSelectedReportEmployeeId: Dispatch<SetStateAction<number>>;
  employees: EmployeeRow[];
  handlePrintReport: () => void;
  reportDocumentLabel: string;
  reportReference: string;
  reportGeneratedOn: string;
  reportGeneratedTime: string;
  reportPeriodLabel: string;
  activeEmployees: EmployeeRow[];
  departmentOptions: string[];
  reportPaidMonthsRows: PaidMonthsRow[];
  toUsd: (value: number) => string;
  payrollMethodSummary: Record<PaymentMethod, number>;
  reportSelectedEmployee: EmployeeRow | null;
  reportSelectedEmployeeLedger: EmployeeLedgerRow[];
  reportEmployeeYearTotals: {
    paidMonths: number;
    grossPaid: number;
    netPaid: number;
  };
  reportW2Totals: ReportW2Totals;
  reportW2Rows: W2SummaryRow[];
  report1099Rows: Report1099Row[];
  report1099YearPayments: VendorPaymentRow[];
  report1099QuarterTotals: Report1099QuarterTotals;
  reconciliationMessage: string;
  reportReconciliationTotals: ReportReconciliationTotals;
  reportUnallocatedPayments: VendorPaymentRow[];
  reconciliationAssignByPaymentId: Record<number, string>;
  setReconciliationAssignByPaymentId: Dispatch<SetStateAction<Record<number, string>>>;
  scopedVendors: VendorRow[];
  handleAssignUnallocatedPayment: (paymentId: number) => void;
};

export function ReportsView({
  reportFocus,
  setReportFocus,
  reportTypeOptions,
  reportFocusLabel,
  reportDocumentType,
  setReportDocumentType,
  selectedReportYear,
  setSelectedReportYear,
  w2YearOptions,
  selectedReportEmployeeId,
  setSelectedReportEmployeeId,
  employees,
  handlePrintReport,
  reportDocumentLabel,
  reportReference,
  reportGeneratedOn,
  reportGeneratedTime,
  reportPeriodLabel,
  activeEmployees,
  departmentOptions,
  reportPaidMonthsRows,
  toUsd,
  payrollMethodSummary,
  reportSelectedEmployee,
  reportSelectedEmployeeLedger,
  reportEmployeeYearTotals,
  reportW2Totals,
  reportW2Rows,
  report1099Rows,
  report1099YearPayments,
  report1099QuarterTotals,
  reconciliationMessage,
  reportReconciliationTotals,
  reportUnallocatedPayments,
  reconciliationAssignByPaymentId,
  setReconciliationAssignByPaymentId,
  scopedVendors,
  handleAssignUnallocatedPayment,
}: ReportsViewProps) {
  return (
    <>
      {!reportFocus ? (
        <div className="no-print border-b border-[#edf1f7] bg-[#fbfcff] px-5 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Choose Report Page</p>
            <span className="rounded-md border border-[#d7e2f2] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4a6388]">
              {reportTypeOptions.length} report pages available
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {reportTypeOptions.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setReportFocus(item.key)}
                className="rounded-xl border border-[#dbe3f0] bg-white px-4 py-3 text-left transition hover:border-[#c6d6ef] hover:bg-[#f8fbff]"
              >
                <p className="text-[14px] font-semibold text-[#163d69]">{item.title}</p>
                <p className="mt-1 text-[12px] text-[#617a9f]">{item.text}</p>
                <p className="mt-2 text-[11px] font-semibold text-[#2f65de]">Open Report Page</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="no-print flex items-center justify-between border-b border-[#edf1f7] bg-[#fbfcff] px-5 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#7b8eaa]">Report Workspace</p>
              <p className="text-[15px] font-semibold text-[#1f426d]">{reportFocusLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setReportFocus(null)}
              className="rounded-lg border border-[#cdd9ec] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#345986] transition hover:bg-[#f2f6fd]"
            >
              Back To Reports
            </button>
          </div>

          <div className="no-print flex flex-wrap items-end gap-3 border-b border-[#edf1f7] bg-white px-5 py-3">
            <label className="space-y-1.5">
              <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Document Type</span>
              <select
                value={reportDocumentType}
                onChange={(event) => setReportDocumentType(event.target.value as ReportDocumentType)}
                className="min-w-[170px] rounded-lg border border-[#d2dcee] bg-white px-2.5 py-2 text-[12px] font-semibold text-[#28486f] outline-none focus:border-[#4f74b9]"
              >
                <option value="statement">Statement (Kashf)</option>
                <option value="report">Report (Taqreer)</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Year</span>
              <select
                value={selectedReportYear}
                onChange={(event) => setSelectedReportYear(event.target.value)}
                className="min-w-[130px] rounded-lg border border-[#d2dcee] bg-white px-2.5 py-2 text-[12px] font-semibold text-[#28486f] outline-none focus:border-[#4f74b9]"
              >
                {w2YearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            {reportFocus === "employee_statement" && (
              <label className="space-y-1.5">
                <span className="text-[12px] font-semibold tracking-wide text-[#6a7f9f]">Employee</span>
                <select
                  value={selectedReportEmployeeId}
                  onChange={(event) => setSelectedReportEmployeeId(Number(event.target.value))}
                  className="min-w-[210px] rounded-lg border border-[#d2dcee] bg-white px-2.5 py-2 text-[12px] font-semibold text-[#28486f] outline-none focus:border-[#4f74b9]"
                >
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.fullName}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <button
              type="button"
              onClick={handlePrintReport}
              className="rounded-lg bg-[#4f74b9] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#3f64a7]"
            >
              Print Document
            </button>
          </div>

          <div id="print-report-area" className="report-shell mx-4 mb-4 mt-3 rounded-xl border border-[#dbe3f0] bg-white p-6">
            <div className="report-header mb-5 border-b border-[#e8eef8] pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6f84a5]">TaxCore360 Reporting Document</p>
                  <h4 className="mt-1 text-[24px] font-semibold text-[#102a4d]">{reportFocusLabel}</h4>
                  <p className="mt-1 text-[13px] font-semibold text-[#2a4f7c]">{reportDocumentLabel}</p>
                </div>
                <div className="rounded-lg border border-[#d7e0ef] bg-[#f8faff] px-3 py-2 text-right text-[11px] text-[#4a6388]">
                  <p>
                    <span className="font-semibold text-[#1d406c]">Reference:</span> {reportReference}
                  </p>
                  <p>
                    <span className="font-semibold text-[#1d406c]">Generated:</span> {reportGeneratedOn}
                  </p>
                  <p>
                    <span className="font-semibold text-[#1d406c]">Time:</span> {reportGeneratedTime}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 rounded-lg border border-[#dfe6f3] bg-[#fbfcff] p-3 text-[11px] text-[#4e6487]">
                <p>
                  <span className="font-semibold text-[#1f426f]">Report:</span> {reportFocusLabel}
                </p>
                <p>
                  <span className="font-semibold text-[#1f426f]">Document:</span> {reportDocumentLabel}
                </p>
                <p>
                  <span className="font-semibold text-[#1f426f]">Period:</span> {reportPeriodLabel}
                </p>
                <p>
                  <span className="font-semibold text-[#1f426f]">Prepared By:</span> Payroll Administrator
                </p>
              </div>
            </div>

            {reportFocus === "employee_count" && reportDocumentType === "statement" && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Total Employees</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{employees.length}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Active</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{activeEmployees.length}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Inactive</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{employees.length - activeEmployees.length}</p>
                  </div>
                </div>

                <table className="print-table w-full border-collapse overflow-hidden rounded-lg border border-[#dbe3f0]">
                  <thead className="bg-[#4f74b9] text-white">
                    <tr>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Department</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Employee Count</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Active</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Inactive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentOptions.map((department) => {
                      const departmentEmployees = employees.filter((row) => row.department === department);
                      if (departmentEmployees.length === 0) {
                        return null;
                      }

                      return (
                        <tr key={department} className="border-t border-[#e3eaf6]">
                          <td className="px-3 py-2 text-[12px] font-medium text-[#163a61]">{department}</td>
                          <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{departmentEmployees.length}</td>
                          <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{departmentEmployees.filter((row) => row.status === "Active").length}</td>
                          <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{departmentEmployees.filter((row) => row.status === "Inactive").length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {reportFocus === "employee_count" && reportDocumentType === "report" && (
              <div className="space-y-4 text-[13px] text-[#1d3c60]">
                <p>
                  Employee count remains the baseline for payroll capacity planning. This report highlights total workforce size and status split across each department.
                </p>
                <p>Total employees registered: {employees.length}</p>
                <p>Active employees connected to payroll: {activeEmployees.length}</p>
                <p>Inactive employees excluded from payroll: {employees.length - activeEmployees.length}</p>
              </div>
            )}

            {reportFocus === "paid_months" && reportDocumentType === "statement" && (
              <div className="space-y-4">
                <table className="print-table w-full border-collapse overflow-hidden rounded-lg border border-[#dbe3f0]">
                  <thead className="bg-[#4f74b9] text-white">
                    <tr>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Month</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Paid Employees</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Gross Amount Paid</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Net Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportPaidMonthsRows.map((row) => (
                      <tr key={row.month} className="border-t border-[#e3eaf6]">
                        <td className="px-3 py-2 text-[12px] font-medium text-[#163a61]">{row.label}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{row.paidEmployees}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{toUsd(row.grossPaid)}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{toUsd(row.netPaid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportFocus === "paid_months" && reportDocumentType === "report" && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Months Posted</p>
                    <p className="text-[18px] font-semibold text-[#113257]">
                      {reportPaidMonthsRows.filter((row) => row.paidEmployees > 0).length}/{reportPaidMonthsRows.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Gross Paid</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{toUsd(reportPaidMonthsRows.reduce((sum, row) => sum + row.grossPaid, 0))}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Net Disbursed</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{toUsd(reportPaidMonthsRows.reduce((sum, row) => sum + row.netPaid, 0))}</p>
                  </div>
                </div>

                <table className="print-table w-full border-collapse overflow-hidden rounded-lg border border-[#dbe3f0]">
                  <thead className="bg-[#4f74b9] text-white">
                    <tr>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Payment Method</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.keys(payrollMethodSummary) as PaymentMethod[]).map((method) => (
                      <tr key={method} className="border-t border-[#e3eaf6]">
                        <td className="px-3 py-2 text-[12px] font-medium text-[#163a61]">{method}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{payrollMethodSummary[method]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportFocus === "employee_statement" && reportDocumentType === "statement" && (
              <div className="space-y-4">
                <p className="text-[13px] font-semibold text-[#22486f]">
                  Employee: {reportSelectedEmployee?.fullName || "-"} | Department: {reportSelectedEmployee?.department || "-"}
                </p>
                <table className="print-table w-full border-collapse overflow-hidden rounded-lg border border-[#dbe3f0]">
                  <thead className="bg-[#4f74b9] text-white">
                    <tr>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Month</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Payment Method</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Pay Date</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Gross Paid</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Net Paid</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportSelectedEmployeeLedger.map((row) => (
                      <tr key={row.month} className="border-t border-[#e3eaf6]">
                        <td className="px-3 py-2 text-[12px] font-medium text-[#163a61]">{row.label}</td>
                        <td className="px-3 py-2 text-[12px] text-[#23486f]">{row.paymentMethod}</td>
                        <td className="px-3 py-2 text-[12px] text-[#23486f]">{row.payDate}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{toUsd(row.grossPaid)}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{toUsd(row.netPaid)}</td>
                        <td className="px-3 py-2 text-[12px] text-[#23486f]">{row.isPaid ? "Paid" : "Pending"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportFocus === "employee_statement" && reportDocumentType === "report" && (
              <div className="space-y-5">
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Employee</p>
                    <p className="text-[16px] font-semibold text-[#113257]">{reportSelectedEmployee?.fullName || "-"}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Paid Months</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{reportEmployeeYearTotals.paidMonths}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Gross Paid</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{toUsd(reportEmployeeYearTotals.grossPaid)}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Net Paid</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{toUsd(reportEmployeeYearTotals.netPaid)}</p>
                  </div>
                </div>

                <p className="text-[13px] text-[#1d3c60]">
                  Account statement for {reportSelectedEmployee?.fullName || "the selected employee"} in {selectedReportYear}. Posted months are counted only when payroll is marked as paid.
                </p>
              </div>
            )}

            {reportFocus === "w2_transmittal" && reportDocumentType === "statement" && (
              <div className="space-y-5">
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Total Employees</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{reportW2Totals.employeeCount}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Employees With Paid Wages</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{reportW2Totals.paidEmployees}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">W-3 Box 1 Wages</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{toUsd(reportW2Totals.wages)}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">W-3 Box 2 Fed Withholding</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{toUsd(reportW2Totals.federalIncomeTax)}</p>
                  </div>
                </div>

                <table className="print-table w-full border-collapse overflow-hidden rounded-lg border border-[#dbe3f0]">
                  <thead className="bg-[#4f74b9] text-white">
                    <tr>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Employee</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Department</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Paid Months</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Box 1 Wages</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Box 2 Fed Tax</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">FICA (Box 4 + 6)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportW2Rows.map((row) => (
                      <tr key={row.id} className="border-t border-[#e3eaf6]">
                        <td className="px-3 py-2 text-[12px] font-medium text-[#163a61]">{row.employee}</td>
                        <td className="px-3 py-2 text-[12px] text-[#23486f]">{row.department}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{row.paidMonthCount}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{toUsd(row.wages)}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{toUsd(row.federalIncomeTax)}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{toUsd(row.socialSecurityTax + row.medicareTax)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportFocus === "w2_transmittal" && reportDocumentType === "report" && (
              <div className="space-y-4 text-[13px] text-[#1d3c60]">
                <p>
                  This annual W-2/W-3 report summarizes payroll wages and withholdings used for IRS and SSA reconciliation. Values are auto-linked from payroll payment records for the selected year.
                </p>
                <p>W-3 Box 1 wages total: {toUsd(reportW2Totals.wages)}</p>
                <p>W-3 Box 2 federal withholding total: {toUsd(reportW2Totals.federalIncomeTax)}</p>
                <p>W-3 FICA taxes (Box 4 + Box 6): {toUsd(reportW2Totals.socialSecurityTax + reportW2Totals.medicareTax)}</p>
                <p>Employees included with paid payroll records: {reportW2Totals.paidEmployees}</p>
              </div>
            )}

            {reportFocus === "form_1099_compliance" && reportDocumentType === "statement" && (
              <div className="space-y-5">
                <div className="grid grid-cols-4 gap-3">
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Total Vendors</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{report1099Rows.length}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">1099 Eligible Vendors</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{report1099Rows.filter((row) => row.is1099Eligible).length}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">MUST FILE</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{report1099Rows.filter((row) => row.filingStatus === "MUST FILE").length}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Total Annual Payments</p>
                    <p className="text-[18px] font-semibold text-[#113257]">{toUsd(report1099YearPayments.reduce((sum, payment) => sum + payment.amount, 0))}</p>
                  </div>
                </div>

                <table className="print-table w-full border-collapse overflow-hidden rounded-lg border border-[#dbe3f0]">
                  <thead className="bg-[#4f74b9] text-white">
                    <tr>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Vendor ID</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Vendor Name</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Entity</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Annual Paid</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">1099 Eligibility</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Filing Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report1099Rows.map((row) => (
                      <tr key={row.vendorId} className="border-t border-[#e3eaf6]">
                        <td className="px-3 py-2 text-[12px] font-medium text-[#163a61]">{row.vendorId}</td>
                        <td className="px-3 py-2 text-[12px] text-[#23486f]">{row.legalName}</td>
                        <td className="px-3 py-2 text-[12px] text-[#23486f]">{row.entityType}</td>
                        <td className="px-3 py-2 text-right text-[12px] text-[#23486f]">{toUsd(row.totalPaid)}</td>
                        <td className="px-3 py-2 text-[12px] text-[#23486f]">{row.is1099Eligible ? "Eligible" : "Exempt"}</td>
                        <td className="px-3 py-2 text-[12px] font-semibold text-[#23486f]">{row.filingStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportFocus === "form_1099_compliance" && reportDocumentType === "report" && (
              <div className="space-y-5">
                <div className="grid grid-cols-4 gap-3">
                  {(Object.keys(report1099QuarterTotals) as Array<keyof Report1099QuarterTotals>).map((quarterKey) => (
                    <div key={quarterKey} className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                      <p className="text-[11px] font-semibold text-[#7789a6]">{quarterKey} Total Paid</p>
                      <p className="text-[18px] font-semibold text-[#113257]">{toUsd(report1099QuarterTotals[quarterKey])}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[13px] text-[#1d3c60]">
                  Form 1099-NEC compliance is based on annual vendor totals and entity classification. Vendors marked MUST FILE are non-corporate entities that crossed the $600 threshold within the selected year.
                </p>
              </div>
            )}

            {reportFocus === "tax_reconciliation" && reportDocumentType === "statement" && (
              <div className="space-y-5">
                {reconciliationMessage ? (
                  <div className="rounded-lg border border-[#d7e3f4] bg-[#f4f8ff] px-3 py-2 text-[12px] font-semibold text-[#355a87]">
                    {reconciliationMessage}
                  </div>
                ) : null}

                <div className="grid grid-cols-5 gap-3">
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Total Disbursed</p>
                    <p className="text-[17px] font-semibold text-[#113257]">{toUsd(reportReconciliationTotals.totalDisbursed)}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Mapped to Vendor</p>
                    <p className="text-[17px] font-semibold text-[#113257]">{toUsd(reportReconciliationTotals.mappedPayments)}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Included in 1099</p>
                    <p className="text-[17px] font-semibold text-[#113257]">{toUsd(reportReconciliationTotals.required1099Total)}</p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Unallocated</p>
                    <p className={`text-[17px] font-semibold ${reportReconciliationTotals.unallocatedAmount > 0 ? "text-[#a33b46]" : "text-[#1b7b44]"}`}>
                      {toUsd(reportReconciliationTotals.unallocatedAmount)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#dbe3f0] px-4 py-3">
                    <p className="text-[11px] font-semibold text-[#7789a6]">Non-1099 Amount</p>
                    <p className="text-[17px] font-semibold text-[#113257]">{toUsd(reportReconciliationTotals.non1099Amount)}</p>
                  </div>
                </div>

                <table className="print-table w-full border-collapse overflow-hidden rounded-lg border border-[#dbe3f0]">
                  <thead className="bg-[#4f74b9] text-white">
                    <tr>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Payment Date</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Invoice</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Vendor ID</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">State</th>
                      <th className="px-3 py-2 text-right text-[12px] font-semibold">Amount</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Reconciliation Note</th>
                      <th className="px-3 py-2 text-left text-[12px] font-semibold">Assign Vendor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportUnallocatedPayments.length === 0 ? (
                      <tr className="border-t border-[#e3eaf6]">
                        <td colSpan={7} className="px-3 py-3 text-center text-[12px] font-semibold text-[#1b7b44]">
                          No unallocated payments found. Reconciliation is balanced for vendor mapping.
                        </td>
                      </tr>
                    ) : (
                      reportUnallocatedPayments.map((payment) => (
                        <tr key={`recon-${payment.id}`} className="border-t border-[#e3eaf6]">
                          <td className="px-3 py-2 text-[12px] text-[#23486f]">{payment.paymentDate}</td>
                          <td className="px-3 py-2 text-[12px] text-[#23486f]">{payment.invoiceNumber}</td>
                          <td className="px-3 py-2 text-[12px] font-semibold text-[#a33b46]">{payment.vendorId}</td>
                          <td className="px-3 py-2 text-[12px] text-[#23486f]">{payment.paymentState}</td>
                          <td className="px-3 py-2 text-right text-[12px] font-semibold text-[#23486f]">{toUsd(payment.amount)}</td>
                          <td className="px-3 py-2 text-[12px] text-[#a33b46]">Assign to a valid vendor before e-file.</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={reconciliationAssignByPaymentId[payment.id] ?? ""}
                                onChange={(event) =>
                                  setReconciliationAssignByPaymentId((prev) => ({
                                    ...prev,
                                    [payment.id]: event.target.value,
                                  }))
                                }
                                className="rounded-md border border-[#d4deec] bg-white px-2 py-1 text-[11px] font-semibold text-[#28486f] outline-none"
                              >
                                <option value="">Select Vendor</option>
                                {scopedVendors.map((vendor) => (
                                  <option key={`recon-vendor-${payment.id}-${vendor.vendorId}`} value={vendor.vendorId}>
                                    {vendor.vendorId}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleAssignUnallocatedPayment(payment.id)}
                                className="rounded-md bg-[#4f74b9] px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-[#3f64a7]"
                              >
                                Assign
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {reportFocus === "tax_reconciliation" && reportDocumentType === "report" && (
              <div className="space-y-4 text-[13px] text-[#1d3c60]">
                <p>
                  Reconciliation ensures every outbound payment is represented correctly before 1099 e-filing. The system compares full-year disbursements against mapped vendor totals and reportable 1099 totals.
                </p>
                <p>Total disbursement ledger: {toUsd(reportReconciliationTotals.totalDisbursed)}</p>
                <p>Mapped to approved vendors: {toUsd(reportReconciliationTotals.mappedPayments)}</p>
                <p>Reportable on 1099 forms (MUST FILE vendors): {toUsd(reportReconciliationTotals.required1099Total)}</p>
                <p>
                  Unallocated exceptions:
                  <span className={`font-semibold ${reportReconciliationTotals.unallocatedAmount > 0 ? " text-[#a33b46]" : " text-[#1b7b44]"}`}>
                    {` ${toUsd(reportReconciliationTotals.unallocatedAmount)}`}
                  </span>
                </p>
                {reportReconciliationTotals.unallocatedAmount > 0 ? (
                  <p className="font-semibold text-[#a33b46]">Action required: map unallocated rows to vendors before Publication 1220 export.</p>
                ) : (
                  <p className="font-semibold text-[#1b7b44]">Status: reconciliation balanced for vendor mapping.</p>
                )}
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-5 border-t border-[#e4ebf6] pt-5 text-[11px] text-[#4b6388]">
              <div>
                <p className="font-semibold uppercase tracking-[0.2em] text-[#6d83a5]">Compliance Note</p>
                <p className="mt-2 leading-relaxed">
                  This report is generated from TaxCore360 records. Numbers are linked automatically to employee and payroll data for audit and internal review.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-t border-[#9fb2cf] pt-2">
                  <p className="font-semibold text-[#24486f]">Prepared By</p>
                  <p>Payroll Team</p>
                </div>
                <div className="border-t border-[#9fb2cf] pt-2">
                  <p className="font-semibold text-[#24486f]">Approved By</p>
                  <p>Finance Manager</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}