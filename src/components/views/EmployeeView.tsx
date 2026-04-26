import type { Dispatch, SetStateAction } from "react";
import type { EmployeeRow, EmployeeStatus } from "../../app/types";

type EmployeeViewProps = {
  employees: EmployeeRow[];
  setEmployees: Dispatch<SetStateAction<EmployeeRow[]>>;
  setIsAddFormOpen: Dispatch<SetStateAction<boolean>>;
};

export function EmployeeView({ employees, setEmployees, setIsAddFormOpen }: EmployeeViewProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <p className="text-[12px] font-semibold text-slate-400">{employees.length} records</p>
        <button
          type="button"
          onClick={() => setIsAddFormOpen(true)}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] transition-all hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98]"
        >
          + Add Employee
        </button>
      </div>

      <div className="overflow-x-auto px-5 pb-5 pt-4">
        <table className="min-w-[1500px] w-full overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800 to-slate-700">
              {["Employee ID", "First Name", "Last Name", "Full Name", "SSN", "Address", "City", "State", "ZIP Code", "Department", "Job Title", "Gross Pay", "Hire Date", "Status"].map(
                (header, i) => (
                  <th key={header} className={`border-r border-white/5 px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-300 whitespace-nowrap ${
                    header === "Gross Pay" ? "text-right" : "text-left"
                  } ${i === 13 ? "border-r-0" : ""}`}>
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {employees.map((row, index) => (
              <tr key={row.id} className={`table-row-hover text-[13px] text-slate-700 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                <td className="border-r border-b border-slate-100 px-4 py-3 tabular-nums text-slate-500">{row.id}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3">{row.firstName}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3">{row.lastName}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">{row.fullName}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3 tabular-nums text-slate-500">{row.ssn}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3 text-slate-500">{row.address}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3">{row.city}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3">{row.state}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3 tabular-nums">{row.zipCode}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3">{row.department}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3">{row.jobTitle}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3 text-right font-semibold tabular-nums text-slate-900">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(row.grossPay)}</td>
                <td className="border-r border-b border-slate-100 px-4 py-3 whitespace-nowrap tabular-nums text-slate-500">{row.hireDate}</td>
                <td className="border-b border-slate-100 px-4 py-2.5">
                  <select
                    value={row.status}
                    onChange={(event) => {
                      const nextStatus = event.target.value as EmployeeStatus;
                      setEmployees((prev) => prev.map((item) => (item.id === row.id ? { ...item, status: nextStatus } : item)));
                    }}
                    className={`w-full min-w-[110px] rounded-full border px-3 py-1.5 text-[11px] font-bold outline-none transition-all ${
                      row.status === "Active"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : "border-rose-200 bg-rose-50 text-rose-600"
                    }`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}