import React from "react";
import { employeeService } from "../../services/employeeService";
import { departmentOptions, usCityOptions } from "../../app/data";

interface EmployeeFormProps {
  employeeForm: any;
  setEmployeeForm: React.Dispatch<React.SetStateAction<any>>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  message?: string;
}

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const labelCls = "text-[10px] font-bold uppercase tracking-wider text-slate-400";

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employeeForm,
  setEmployeeForm,
  isOpen,
  onClose,
  onSubmit,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-6 py-10" onClick={onClose}>
      <div className="modal-content max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200/60 bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur-md px-8 py-5">
          <div>
            <h3 className="text-[22px] font-extrabold tracking-tight text-slate-900">Add New Employee</h3>
            <p className="mt-0.5 text-[13px] text-slate-400">Create a full employee record before saving to payroll data.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300">Close</button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 px-8 py-7">
          {message ? <div className="animate-fade-in rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] font-medium text-rose-600">{message}</div> : null}

          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-2"><span className={labelCls}>First Name</span><input value={employeeForm.firstName} onChange={(e) => employeeService.handleFieldChange("firstName", e.target.value, setEmployeeForm)} placeholder="Enter first name" className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Last Name</span><input value={employeeForm.lastName} onChange={(e) => employeeService.handleFieldChange("lastName", e.target.value, setEmployeeForm)} placeholder="Enter last name" className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>SSN</span><input value={employeeForm.ssn} onChange={(e) => employeeService.handleFieldChange("ssn", e.target.value, setEmployeeForm)} placeholder="000-00-0000" className={inputCls} /></label>
            <label className="space-y-2">
              <span className={labelCls}>Department</span>
              <select value={employeeForm.department} onChange={(e) => employeeService.handleFieldChange("department", e.target.value, setEmployeeForm)} className={inputCls}>
                <option value="">Select department</option>
                {departmentOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label className="space-y-2"><span className={labelCls}>Job Title</span><input value={employeeForm.jobTitle} onChange={(e) => employeeService.handleFieldChange("jobTitle", e.target.value, setEmployeeForm)} placeholder="Enter job title" className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Hire Date</span><input type="date" value={employeeForm.hireDate} onChange={(e) => employeeService.handleFieldChange("hireDate", e.target.value, setEmployeeForm)} className={inputCls} /></label>
            <label className="space-y-2"><span className={labelCls}>Gross Pay (Monthly)</span><input type="number" min="0" step="0.01" value={employeeForm.grossPay} onChange={(e) => employeeService.handleFieldChange("grossPay", e.target.value, setEmployeeForm)} placeholder="Enter monthly gross pay" className={inputCls} /></label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="col-span-3 space-y-2"><span className={labelCls}>Address</span><input value={employeeForm.address} onChange={(e) => employeeService.handleFieldChange("address", e.target.value, setEmployeeForm)} placeholder="Enter full address" className={inputCls} /></label>
            <label className="space-y-2">
              <span className={labelCls}>City</span>
              <select value={employeeForm.city && employeeForm.state ? `${employeeForm.city}|${employeeForm.state}` : ""} onChange={(e) => employeeService.handleCitySelectChange(e.target.value, setEmployeeForm)} className={inputCls}>
                <option value="">Select city</option>
                {usCityOptions.map((o) => <option key={`${o.city}-${o.state}`} value={`${o.city}|${o.state}`}>{o.city}</option>)}
              </select>
            </label>
            <label className="space-y-2"><span className={labelCls}>State</span><input value={employeeForm.state} readOnly placeholder="Auto-filled" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[13px] text-slate-600 outline-none" /></label>
            <label className="space-y-2"><span className={labelCls}>ZIP Code</span><input value={employeeForm.zipCode} onChange={(e) => employeeService.handleFieldChange("zipCode", e.target.value, setEmployeeForm)} placeholder="ZIP code" className={inputCls} /></label>
          </div>

          <div className="flex items-end justify-between border-t border-slate-100 pt-5">
            <label className="space-y-2">
              <span className={labelCls}>Status</span>
              <select value={employeeForm.status} onChange={(e) => employeeService.handleFieldChange("status", e.target.value, setEmployeeForm)} className={inputCls}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-[13px] font-bold text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]">Cancel</button>
              <button type="submit" className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-2.5 text-[13px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] transition-all hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98]">Save Employee</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
