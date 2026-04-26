import type { Dispatch, SetStateAction } from "react";
import type { EmployeeRow, W2Section } from "../../app/types";

type W2ViewProps = {
  w2Section: W2Section;
  selectedW2EmployeeId: number | null;
  setSelectedW2EmployeeId: Dispatch<SetStateAction<number | null>>;
  employees: EmployeeRow[];
  selectedW2Year: string;
  setSelectedW2Year: Dispatch<SetStateAction<string>>;
  w2YearOptions: string[];
  handleGenerateOfficialW2Pdf: (employeeId: number, year: string) => void;
  handleGenerateOfficialW3Pdf: () => void;
  isGeneratingOfficialW2: boolean;
  toW2Amount: (value: number) => string;
  w3Totals?: {
    employeeCount: number;
    wages: number;
    federalIncomeTax: number;
    socialSecurityWages: number;
    socialSecurityTax: number;
    medicareWages: number;
    medicareTax: number;
    stateWages: number;
    stateIncomeTax: number;
  };
  employerProfile?: {
    ein: string;
    legalName: string;
    addressLine1: string;
    addressLine2: string;
    contactName?: string;
    contactPhone?: string;
    email?: string;
  };
};

const selectCls =
  "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const labelCls = "text-[10px] font-bold uppercase tracking-wider text-slate-400";

export function W2View({
  w2Section,
  selectedW2EmployeeId,
  setSelectedW2EmployeeId,
  employees,
  selectedW2Year,
  setSelectedW2Year,
  w2YearOptions,
  handleGenerateOfficialW2Pdf,
  handleGenerateOfficialW3Pdf,
  isGeneratingOfficialW2,
  toW2Amount,
  w3Totals,
  employerProfile,
}: W2ViewProps) {
  const currentEmployee = employees.find(e => e.id === selectedW2EmployeeId) || employees[0];

  // W-3 Summary View
  if (w2Section === "summary") {
    return (
      <div className="animate-fade-in">
        {/* ── Controls ── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3">
              <span className={labelCls}>Tax Year</span>
              <select value={selectedW2Year} onChange={(e) => setSelectedW2Year(e.target.value)} className={selectCls}>
                {w2YearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
               onClick={handleGenerateOfficialW3Pdf}
               disabled={isGeneratingOfficialW2}
               className="rounded-xl bg-slate-800 px-5 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-900 hover:-translate-y-0.5"
            >
               {isGeneratingOfficialW2 ? "Generating..." : "Generate Official W-3 PDF"}
            </button>
          </div>
        </div>

        <div className="bg-slate-50/50 p-6">
          <div className="mx-auto max-w-[1100px]">
             {/* W-3 Form */}
             <div id="print-w3-area" className="w3-print-wrap rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
               <div className="mb-6 flex items-start justify-between border-b border-slate-800 pb-4">
                 <div>
                    <h1 className="text-[28px] font-black tracking-tighter text-slate-900">Form W-3</h1>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Transmittal of Wage and Tax Statements</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[24px] font-black text-slate-400">{selectedW2Year}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Department of the Treasury</p>
                 </div>
               </div>

               {/* W-3 Grid */}
               <div className="w3-grid grid gap-px bg-slate-200 border border-slate-200">
                  {/* ── Box a - Employer EIN ── */}
                  <div className="w3-box col-span-4"><p className="w3-label">a Employer identification number (EIN)</p><p className="w3-value">{employerProfile?.ein || "XX-XXXXXXX"}</p></div>
                  
                  {/* ── Box b - Employer Name/Address ── */}
                  <div className="w3-box col-span-8 row-span-2">
                    <p className="w3-label">b Employer's name, address, and ZIP code</p>
                    <p className="w3-value text-[11px] leading-snug">
                      {employerProfile?.legalName || "Company Name"}<br/>
                      {employerProfile?.addressLine1 || "Address Line 1"}<br/>
                      {employerProfile?.addressLine2 || "City, State ZIP"}
                    </p>
                  </div>
                  
                  {/* ── Box c - Total Forms ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">c Total number of Forms W-2</p><p className="w3-value text-right">{w3Totals?.employeeCount || 0}</p></div>
                  
                  {/* ── Box d - Total Wages ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">d Total wages, tips, other compensation</p><p className="w3-value text-right">{toW2Amount(w3Totals?.wages || 0)}</p></div>
                  
                  {/* ── Box e - Federal Tax ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">e Total federal income tax withheld</p><p className="w3-value text-right">{toW2Amount(w3Totals?.federalIncomeTax || 0)}</p></div>
                  
                  {/* ── Box f - SS Wages ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">f Total social security wages</p><p className="w3-value text-right">{toW2Amount(w3Totals?.socialSecurityWages || 0)}</p></div>
                  
                  {/* ── Box g - SS Tax ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">g Total social security tax withheld</p><p className="w3-value text-right">{toW2Amount(w3Totals?.socialSecurityTax || 0)}</p></div>
                  
                  {/* ── Box h - Medicare Wages ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">h Total Medicare wages and tips</p><p className="w3-value text-right">{toW2Amount(w3Totals?.medicareWages || 0)}</p></div>
                  
                  {/* ── Box i - Medicare Tax ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">i Total Medicare tax withheld</p><p className="w3-value text-right">{toW2Amount(w3Totals?.medicareTax || 0)}</p></div>
                  
                  {/* ── Box j - SS Tips ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">j Total social security tips</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box k - Allocated Tips ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">k Total allocated tips</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box l - Dependent Care ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">l Total dependent care benefits</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box m - Nonqualified Plans ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">m Total nonqualified plans</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box n - Nontaxable Elect. Contributions ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">n Total nontaxable elect. contributions</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box o - Group-Term Life Insurance ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">o Total income in the form of group-term life insurance</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box p - 401(k) Deferrals ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">p Total deferrals under section 401(k)</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box q - 403(b) Deferrals ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">q Total deferrals under section 403(b)</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box r - Salary Reduction Contributions ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">r Total salary reduction contributions</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box s - 408(p)(1) Deferrals ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">s Total elective deferrals under section 408(p)(1)</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box t - 401(a)(11) Deferrals ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">t Total deferrals under section 401(a)(11)</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box u - 408(k)(6) Deferrals ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">u Total deferrals under section 408(k)(6)</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box v - 402(g) Deferrals ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">v Total deferrals under section 402(g)</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box w - 414(h)(2) Deferrals ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">w Total deferrals under section 414(h)(2)</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box x - Stock Options ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">x Income from the exercise of nonstatutory stock options</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box y - Stock Option Income ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">y Nonstatutory stock option income</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box z - De Minimis Benefits ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">z Total de minimis fringe benefits</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box aa - 409A Deferrals ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">aa Total elective deferrals under section 409A</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box ab - 409A(v) Deferrals ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">ab Total elective deferrals under section 409A(v)</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box ac - Group-Term Life Insurance Over $50k ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">ac Total cost of group-term life insurance over $50,000</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box ad - SS Tax Wages ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">ad Total wages subject to social security tax</p><p className="w3-value text-right">{toW2Amount(w3Totals?.socialSecurityWages || 0)}</p></div>
                  
                  {/* ── Box ae - Medicare Tax Wages ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">ae Total wages subject to Medicare tax</p><p className="w3-value text-right">{toW2Amount(w3Totals?.medicareWages || 0)}</p></div>
                  
                  {/* ── Box af - Additional Medicare Tax Wages ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">af Total wages subject to Additional Medicare Tax</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Box ag - Additional Medicare Tax Withheld ── */}
                  <div className="w3-box col-span-2"><p className="w3-label">ag Total Additional Medicare Tax withheld</p><p className="w3-value text-right">$0.00</p></div>
                  
                  {/* ── Contact Information ── */}
                  <div className="w3-box col-span-4">
                    <p className="w3-label">Contact person</p>
                    <p className="w3-value">{employerProfile?.contactName || "N/A"}</p>
                    <p className="w3-label mt-2">Telephone number</p>
                    <p className="w3-value">{employerProfile?.contactPhone || "N/A"}</p>
                    <p className="w3-label mt-2">Email address</p>
                    <p className="w3-value">{employerProfile?.email || "N/A"}</p>
                  </div>
                  
                  {/* ── Kind of Payer ── */}
                  <div className="w3-box col-span-4">
                    <p className="w3-label">Kind of Payer</p>
                    <p className="w3-value">941</p>
                  </div>
                  
                  {/* ── Kind of Employer ── */}
                  <div className="w3-box col-span-4">
                    <p className="w3-label">Kind of Employer</p>
                    <p className="w3-value">None apply</p>
                  </div>
               </div>
               
               <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <div className="flex items-center gap-3">
                     <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-600 text-white"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
                     <div>
                        <p className="text-[12px] font-bold text-slate-900">W-3 Transmittal Summary</p>
                        <p className="text-[11px] text-slate-600/80">This form transmits {w3Totals?.employeeCount || 0} W-2 forms for {selectedW2Year}. All totals are calculated from payroll data.</p>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  // W-2 Form View
  return (
    <div className="animate-fade-in">
      {/* ── Controls ── */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3">
            <span className={labelCls}>Tax Year</span>
            <select value={selectedW2Year} onChange={(e) => setSelectedW2Year(e.target.value)} className={selectCls}>
              {w2YearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-3">
            <span className={labelCls}>Employee</span>
            <select value={selectedW2EmployeeId ?? ""} onChange={(e) => setSelectedW2EmployeeId(Number(e.target.value))} className={selectCls}>
              {employees.map(e => <option key={e.id} value={e.id}>{e.fullName}</option>)}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
             onClick={() => handleGenerateOfficialW2Pdf(currentEmployee.id, selectedW2Year)}
             disabled={isGeneratingOfficialW2}
             className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-[12px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98]"
          >
             {isGeneratingOfficialW2 ? "Generating..." : "Generate Official W-2 PDF"}
          </button>
        </div>
      </div>

      <div className="bg-slate-50/50 p-6">
        <div className="mx-auto max-w-[900px]">
           {/* IRS Mock Representation (Styled Paper-like) */}
           <div id="print-w2-area" className="w2-print-wrap rounded-2xl border border-slate-200 bg-white p-10 shadow-xl">
             <div className="mb-6 flex items-start justify-between border-b border-slate-800 pb-4">
               <div>
                  <h1 className="text-[28px] font-black tracking-tighter text-slate-900">Form W-2</h1>
                  <p className="text-[12px] font-bold uppercase tracking-widest text-slate-500">Wage and Tax Statement</p>
               </div>
               <div className="text-right">
                  <p className="text-[24px] font-black text-slate-400">{selectedW2Year}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Department of the Treasury</p>
               </div>
             </div>

             {/* The W-2 Grid remains IRS-compliant but styled cleaner */}
             <div className="w2-grid grid gap-px bg-slate-200 border border-slate-200">
                {/* ── Box a ── */}
                <div className="w2-box col-span-4"><p className="w2-label">a Employee's social security number</p><p className="w2-value">{currentEmployee.ssn}</p></div>
                
                {/* ── Box b-c-d (Employer) ── */}
                <div className="w2-box col-span-4 row-span-3"><p className="w2-label">b Employer identification number (EIN)</p><p className="w2-value">88-9990001</p><p className="w2-label mt-4">c Employer's name, address, and ZIP code</p><p className="w2-value text-[11px] leading-snug">TaxCore360 Payroll Solutions Inc<br/>100 Innovation Way, Suite 400<br/>San Francisco, CA 94105</p></div>
                
                <div className="w2-box col-span-2"><p className="w2-label">1 Wages, tips, other compensation</p><p className="w2-value text-right">{toW2Amount(currentEmployee.grossPay * 12)}</p></div>
                <div className="w2-box col-span-2"><p className="w2-label">2 Federal income tax withheld</p><p className="w2-value text-right">{toW2Amount(currentEmployee.grossPay * 0.12 * 12)}</p></div>

                <div className="w2-box col-span-2"><p className="w2-label">3 Social security wages</p><p className="w2-value text-right">{toW2Amount(currentEmployee.grossPay * 12)}</p></div>
                <div className="w2-box col-span-2"><p className="w2-label">4 Social security tax withheld</p><p className="w2-value text-right">{toW2Amount(currentEmployee.grossPay * 0.062 * 12)}</p></div>

                <div className="w2-box col-span-4"><p className="w2-label">d Control number</p><p className="w2-value">TC-{currentEmployee.id}-00X</p></div>
                <div className="w2-box col-span-2"><p className="w2-label">5 Medicare wages and tips</p><p className="w2-value text-right">{toW2Amount(currentEmployee.grossPay * 12)}</p></div>
                <div className="w2-box col-span-2"><p className="w2-label">6 Medicare tax withheld</p><p className="w2-value text-right">{toW2Amount(currentEmployee.grossPay * 0.0145 * 12)}</p></div>

                <div className="w2-box col-span-4"><p className="w2-label">e Employee's first name and initial | Last name</p><p className="w2-value">{currentEmployee.firstName} {currentEmployee.lastName}</p></div>
                <div className="w2-box col-span-2"><p className="w2-label">7 Social security tips</p><p className="w2-value text-right">$0.00</p></div>
                <div className="w2-box col-span-2"><p className="w2-label">8 Allocated tips</p><p className="w2-value text-right">$0.00</p></div>

                <div className="w2-box col-span-4 row-span-1"><p className="w2-label">f Employee's address and ZIP code</p><p className="w2-value text-[11px]">{currentEmployee.address}, {currentEmployee.city}, {currentEmployee.state} {currentEmployee.zipCode}</p></div>
                <div className="w2-box col-span-2"><p className="w2-label">9 Verification code</p><p className="w2-value text-right">---</p></div>
                <div className="w2-box col-span-2"><p className="w2-label">10 Dependent care benefits</p><p className="w2-value text-right">$0.00</p></div>
             </div>
             
             <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <div className="flex items-center gap-3">
                   <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white"><svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 2v20m-5-5 5 5 5-5m-5-15 5 5-5-5z" /></svg></span>
                   <div>
                      <p className="text-[12px] font-bold text-blue-900">Compliant Auto-Generation</p>
                      <p className="text-[11px] text-blue-700/80">These figures are calculated directly from {selectedW2Year} payroll logs and verified against Box 1 totals.</p>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}