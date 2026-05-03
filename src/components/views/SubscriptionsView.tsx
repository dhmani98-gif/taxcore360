import type { Dispatch, SetStateAction } from "react";
import type {
  InvoiceHistoryRecord,
  PaymentMethodSettings,
  SubscriptionPlan,
  SubscriptionPlanRecord,
  SubscriptionSettings,
  UserAdminForm,
  UserDirectoryRecord,
} from "../../app/types";

type SubscriptionsViewProps = {
  subscriptionPlanCatalog: SubscriptionPlanRecord[];
  subscriptionSettings: SubscriptionSettings;
  setSubscriptionSettings: Dispatch<SetStateAction<SubscriptionSettings>>;
  handlePlanSwitch: (plan: SubscriptionPlan) => void;
  setSettingsMessage: Dispatch<SetStateAction<string>>;
  paymentMethodSettings: PaymentMethodSettings;
  setPaymentMethodSettings: Dispatch<SetStateAction<PaymentMethodSettings>>;
  invoiceHistory: InvoiceHistoryRecord[];
  toUsd: (value: number) => string;
  userDirectory: UserDirectoryRecord[];
  userAdminForm: UserAdminForm;
  setUserAdminForm: Dispatch<SetStateAction<UserAdminForm>>;
  handleCreateWorkspaceUser: () => void;
  userAdminMessage: string;
  settingsMessage: string;
};

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const labelCls = "text-[10px] font-bold uppercase tracking-wider text-slate-400";

export function SubscriptionsView({
  subscriptionPlanCatalog,
  subscriptionSettings,
  handlePlanSwitch,
  paymentMethodSettings,
  setPaymentMethodSettings,
  invoiceHistory,
  toUsd,
  userDirectory,
  userAdminForm,
  setUserAdminForm,
  handleCreateWorkspaceUser,
  userAdminMessage,
}: SubscriptionsViewProps) {
  return (
    <div className="px-6 py-6 animate-fade-in space-y-8">
      {/* ── Plan Selection ── */}
      <section className="surface-panel rounded-2xl p-6">
        <p className="mb-6 text-[12px] font-bold uppercase tracking-wider text-slate-400">Available Plans</p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {subscriptionPlanCatalog.map((plan) => {
            const isCurrent = subscriptionSettings.plan === plan.plan;
            return (
              <div
                key={plan.plan}
                className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 ${
                  isCurrent
                    ? "border-blue-500 bg-blue-50/10 shadow-lg shadow-blue-500/10"
                    : plan.badge === "Most Popular"
                      ? "border-emerald-400 bg-emerald-50/10 shadow-lg shadow-emerald-500/10"
                      : plan.badge === "Best Value"
                        ? "border-purple-400 bg-purple-50/10 shadow-lg shadow-purple-500/10"
                        : "border-slate-100 bg-slate-50/40 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -right-10 top-2 rotate-45 bg-blue-500 px-10 py-1 text-[9px] font-bold uppercase text-white shadow-sm">
                    Active
                  </div>
                )}
                {plan.badge && !isCurrent && (
                  <div className={`absolute -right-10 top-2 rotate-45 px-10 py-1 text-[9px] font-bold uppercase text-white shadow-sm ${
                    plan.badge === "Most Popular" ? "bg-emerald-500" : "bg-purple-500"
                  }`}>
                    {plan.badge}
                  </div>
                )}
                <h4 className="text-[18px] font-extrabold text-slate-900">{plan.plan}</h4>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-[28px] font-black text-slate-900">{toUsd(plan.monthlyPrice)}</span>
                  <span className="text-[12px] font-bold text-slate-400">/mo</span>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{plan.subtitle}</p>
                
                {/* Features List */}
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                      <svg className="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => handlePlanSwitch(plan.plan)}
                  className={`mt-6 w-full rounded-xl py-3 text-[12px] font-bold transition-all ${
                    isCurrent
                      ? "bg-white border border-slate-200 text-slate-400 shadow-none cursor-default"
                      : plan.badge === "Most Popular"
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_6px_20px_-6px_rgba(16,185,129,0.45)] hover:shadow-[0_10px_28px_-6px_rgba(16,185,129,0.55)] hover:-translate-y-0.5 active:scale-[0.98]"
                        : plan.badge === "Best Value"
                          ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-[0_6px_20px_-6px_rgba(147,51,234,0.45)] hover:shadow-[0_10px_28px_-6px_rgba(147,51,234,0.55)] hover:-translate-y-0.5 active:scale-[0.98]"
                          : "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98]"
                  }`}
                >
                  {isCurrent ? "Current Plan" : `Upgrade to ${plan.plan}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Billing & Payment ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="surface-panel rounded-2xl p-6">
          <p className="mb-5 text-[12px] font-bold uppercase tracking-wider text-slate-400">Payment Method</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M7 15h.01" /><path d="M11 15h2" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-slate-800">Card ending in {paymentMethodSettings.cardLast4}</p>
                <p className="text-[11px] text-slate-400 font-medium">Expires {paymentMethodSettings.expiry}</p>
              </div>
              <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700">Edit Details</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-2 block">
                <span className={labelCls}>Cardholder Name</span>
                <input 
                  value={paymentMethodSettings.holderName} 
                  onChange={(e) => setPaymentMethodSettings((p: PaymentMethodSettings) => ({ ...p, holderName: e.target.value }))} 
                  className={inputCls} 
                />
              </label>
              <label className="space-y-2 block">
                <span className={labelCls}>Last 4 Digits</span>
                <input 
                  value={paymentMethodSettings.cardLast4} 
                  onChange={(e) => setPaymentMethodSettings((p: PaymentMethodSettings) => ({ ...p, cardLast4: e.target.value }))} 
                  maxLength={4} 
                  className={inputCls} 
                />
              </label>
            </div>
          </div>
        </section>

        <section className="surface-panel rounded-2xl p-6">
          <p className="mb-5 text-[12px] font-bold uppercase tracking-wider text-slate-400">Billing History</p>
          <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
            {invoiceHistory.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3 transition-colors hover:bg-white hover:border-slate-200">
                <div>
                  <p className="text-[12px] font-bold text-slate-800">{inv.id}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{inv.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-extrabold text-slate-900">{toUsd(inv.amount)}</p>
                  <span className={`badge-${inv.status === "Paid" ? "success" : "warning"} mt-1 text-[9px]`}>{inv.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── User Directory ── */}
      <section className="surface-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Workspace User Registry</p>
          <span className="badge-info">{userDirectory.length} active users</span>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white shadow-sm">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="bg-slate-800 text-white">
                {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3.5 font-black uppercase tracking-widest text-[10px] text-slate-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {userDirectory.map(user => (
                <tr key={user.email} className="table-row-hover">
                  <td className="px-4 py-3.5 font-extrabold text-slate-900">{user.name}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{user.email}</td>
                  <td className="px-4 py-3.5"><span className="badge-info">{user.role}</span></td>
                  <td className="px-4 py-3.5"><span className="badge-success">Active</span></td>
                  <td className="px-4 py-3.5">
                    <button className="text-blue-600 font-bold text-[11px] hover:text-blue-700 hover:underline">Manage Access</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 border-t border-slate-100 pt-8">
          <p className="mb-5 text-[13px] font-extrabold text-slate-900">Add Workspace User</p>
          {userAdminMessage && (
            <div className="mb-6 animate-fade-in rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-[12px] font-semibold text-emerald-700">
              {userAdminMessage}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <label className="space-y-2 block">
              <span className={labelCls}>Full Name</span>
              <input 
                value={userAdminForm.name} 
                onChange={(e) => setUserAdminForm((p: UserAdminForm) => ({ ...p, name: e.target.value }))} 
                className={inputCls} 
                placeholder="Ex. Jane Smith"
              />
            </label>
            <label className="space-y-2 block">
              <span className={labelCls}>Email Address</span>
              <input 
                value={userAdminForm.email} 
                onChange={(e) => setUserAdminForm((p: UserAdminForm) => ({ ...p, email: e.target.value }))} 
                className={inputCls} 
                placeholder="jane@company.com"
              />
            </label>
            <label className="space-y-2 block">
              <span className={labelCls}>Role Access</span>
              <select 
                value={userAdminForm.role} 
                onChange={(e) => setUserAdminForm((p: UserAdminForm) => ({ ...p, role: e.target.value }))} 
                className={inputCls}
              >
                <option>Owner</option>
                <option>Admin</option>
                <option>Accountant</option>
                <option>Read-Only</option>
              </select>
            </label>
            <div className="flex items-end">
              <button 
                onClick={handleCreateWorkspaceUser} 
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-[12px] font-bold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.45)] hover:shadow-[0_10px_28px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Create User Access
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}