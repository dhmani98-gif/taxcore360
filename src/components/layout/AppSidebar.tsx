import type { Dispatch, SetStateAction } from "react";
import type { AuthUser, PortalSection, ViewMode, W2Section } from "../../app/types";
import type { SubscriptionTier } from "../../services/subscriptionService";

type AppSidebarProps = {
  brandLogoUrl: string;
  platformName: string;
  authUser: AuthUser | null;
  viewMode: ViewMode;
  portalSection: PortalSection;
  w2Section: W2Section;
  isWorkforceOpen: boolean;
  isW2Open: boolean;
  isPortalOpen: boolean;
  isTasksOpen: boolean;
  isDocumentsOpen: boolean;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  setPortalSection: Dispatch<SetStateAction<PortalSection>>;
  setW2Section: Dispatch<SetStateAction<W2Section>>;
  setIsWorkforceOpen: Dispatch<SetStateAction<boolean>>;
  setIsW2Open: Dispatch<SetStateAction<boolean>>;
  setIsPortalOpen: Dispatch<SetStateAction<boolean>>;
  setIsTasksOpen: Dispatch<SetStateAction<boolean>>;
  setIsDocumentsOpen: Dispatch<SetStateAction<boolean>>;
  onOpenReports: () => void;
  onLogout: () => void;
  // Subscription info
  subscriptionTier?: SubscriptionTier;
  employeesUsed?: number;
  employeesLimit?: number;
  vendorsUsed?: number;
  vendorsLimit?: number;
};

function IconChevron() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-slate-300" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="m6 8 4 4 4-4" />
    </svg>
  );
}

/* ── Style Helpers ── */
const navBase =
  "group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/[0.06]";
const navActive =
  "sidebar-nav-active group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-semibold text-blue-300";
const subBase =
  "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] font-medium transition-all duration-200 text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]";
const subActive =
  "sidebar-nav-active group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] font-semibold text-blue-300";
const toggleBase =
  "group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-[13px] font-medium text-slate-400 transition-all duration-200 hover:text-white hover:bg-white/[0.06]";
const sectionLabel =
  "px-3.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600";

export function AppSidebar({
  brandLogoUrl,
  platformName,
  authUser,
  viewMode,
  portalSection,
  w2Section,
  isWorkforceOpen,
  isW2Open,
  isPortalOpen,
  isTasksOpen,
  isDocumentsOpen,
  setViewMode,
  setPortalSection,
  setW2Section,
  setIsWorkforceOpen,
  setIsW2Open,
  setIsPortalOpen,
  setIsTasksOpen,
  setIsDocumentsOpen,
  onOpenReports,
  onLogout,
  subscriptionTier = "Pay Per Form",
  employeesUsed = 0,
  employeesLimit = 5,
  vendorsUsed = 0,
  vendorsLimit = 3,
}: AppSidebarProps) {
  return (
    <aside className="app-sidebar sticky top-0 flex flex-col h-screen w-full xl:w-[280px] xl:border-r-0">
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-6">
        {brandLogoUrl ? (
          <img src={brandLogoUrl} alt="TaxCore360 logo" className="h-11 w-auto max-w-[160px] object-contain" />
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M8 3h7l4 4v12a2 2 0 0 1-2 2H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" />
                <path d="M15 3v5h5" /><path d="M9 11h6M9 14h4" /><path d="M12 17v2" />
              </svg>
            </div>
            <div>
              <h1 className="text-[18px] font-bold leading-tight text-white">{platformName}</h1>
              <p className="text-[10px] font-medium tracking-wider text-slate-500">TAX COMPLIANCE</p>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {/* ── MAIN NAV ── */}
        <p className={sectionLabel}>Main</p>
        <nav className="space-y-0.5">
          <button onClick={() => setViewMode("executive")} className={viewMode === "executive" ? navActive : navBase}>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="8" /><path d="M12 7v5" /><path d="M9 10h6" /><path d="M9 15h6" /></svg>
            Executive
          </button>

          {/* Workforce */}
          <div>
            <button onClick={() => setIsWorkforceOpen((p) => !p)} className={toggleBase}>
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx="6" cy="7" r="2" /><circle cx="12" cy="5" r="2" /><circle cx="18" cy="7" r="2" /><path d="M3.5 17a3.5 3.5 0 0 1 7 0" /><path d="M8.5 19a3.5 3.5 0 0 1 7 0" /><path d="M13.5 17a3.5 3.5 0 0 1 7 0" /></svg>
                Workforce
              </span>
              <span className={`transition-transform duration-300 ${isWorkforceOpen ? "rotate-180" : ""}`}><IconChevron /></span>
            </button>
            {isWorkforceOpen && (
              <div className="mt-0.5 space-y-0.5 pl-8 animate-slide-down">
                <button onClick={() => setViewMode("employee")} className={viewMode === "employee" ? subActive : subBase}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M9 10h2M9 14h6" /></svg>
                  Employees
                </button>
                <button onClick={() => setViewMode("payroll")} className={viewMode === "payroll" ? subActive : subBase}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="3" y="8" width="18" height="8" rx="2" /><path d="M8 12h8" /><path d="M7 8V6h3" /></svg>
                  Payroll
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* ── TAX FILING ── */}
        <p className={`mt-6 ${sectionLabel}`}>Tax Filing</p>
        <nav className="space-y-0.5">
          {/* W-2 */}
          <div>
            <button onClick={() => setIsW2Open((p) => !p)} className={toggleBase}>
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-rose-400" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M6 2h12v20l-6-3-6 3V2Z" /><path d="M9 8h6" /><path d="M9 12h4" /></svg>
                W-2 Generator
              </span>
              <span className={`transition-transform duration-300 ${isW2Open ? "rotate-180" : ""}`}><IconChevron /></span>
            </button>
            {isW2Open && (
              <div className="mt-0.5 space-y-0.5 pl-8 animate-slide-down">
                <button onClick={() => { setViewMode("w2"); setW2Section("form"); }} className={viewMode === "w2" && w2Section === "form" ? subActive : subBase}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M7 3h8l4 4v14H7V3Z" /><path d="M15 3v5h4" /></svg>
                  W-2 Forms
                </button>
                <button onClick={() => { setViewMode("w2"); setW2Section("summary"); }} className={viewMode === "w2" && w2Section === "summary" ? subActive : subBase}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M5 6h14" /><path d="M5 12h14" /><path d="M5 18h9" /></svg>
                  W-3 Summary
                </button>
              </div>
            )}
          </div>

          {/* 1099 */}
          <div>
            <button onClick={() => setIsPortalOpen((p) => !p)} className={toggleBase}>
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 19.5h16" /><path d="M7 16V4h4l2 3h4v9" /><path d="m9 15 2-2 2 1 3-4" /></svg>
                1099 Portal
              </span>
              <span className={`transition-transform duration-300 ${isPortalOpen ? "rotate-180" : ""}`}><IconChevron /></span>
            </button>
            {isPortalOpen && (
              <div className="mt-0.5 space-y-0.5 pl-8 animate-slide-down">
                {([
                  ["dashboard", "Board", "M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z"],
                  ["vendors", "Vendors", "M5 7h14v12H5z M9 7V5h6v2"],
                  ["payments", "Payments", "M3 6h18v12H3z M7 12h10"],
                  ["w9", "W-9 Intake", "M7 3h8l4 4v14H7V3Z M15 3v5h4 M9 12h6 M9 16h6"],
                  ["communications", "Communication", "M4 6h16v10H7l-3 3V6Z M8 10h8 M8 13h5"],
                  ["form", "Form", "M7 3h8l4 4v14H7V3Z M15 3v5h4"],
                  ["vault", "Vault", "M4 7h16v13H4z M9 7V4h6v3 M9 12h6"],
                ] as [PortalSection, string, string][]).map(([section, label, pathD]) => (
                  <button
                    key={section}
                    onClick={() => { setViewMode("portal"); setPortalSection(section); }}
                    className={viewMode === "portal" && portalSection === section ? subActive : subBase}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      {pathD.split(" M").map((seg, i) => (
                        <path key={i} d={i === 0 ? seg : `M${seg}`} />
                      ))}
                    </svg>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* ── TOOLS ── */}
        <p className={`mt-6 ${sectionLabel}`}>Tools</p>
        <nav className="space-y-0.5">
          {/* Tasks */}
          <div>
            <button onClick={() => setIsTasksOpen((p) => !p)} className={toggleBase}>
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                Tasks
              </span>
              <span className={`transition-transform duration-300 ${isTasksOpen ? "rotate-180" : ""}`}><IconChevron /></span>
            </button>
            {isTasksOpen && (
              <div className="mt-0.5 space-y-0.5 pl-8 animate-slide-down">
                <button onClick={() => setViewMode("tasks")} className={viewMode === "tasks" ? subActive : subBase}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M9 10h2M9 14h6" /></svg>
                  All Tasks
                </button>
              </div>
            )}
          </div>

          {/* Documents */}
          <div>
            <button onClick={() => setIsDocumentsOpen((p) => !p)} className={toggleBase}>
              <span className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                Documents
              </span>
              <span className={`transition-transform duration-300 ${isDocumentsOpen ? "rotate-180" : ""}`}><IconChevron /></span>
            </button>
            {isDocumentsOpen && (
              <div className="mt-0.5 space-y-0.5 pl-8 animate-slide-down">
                <button onClick={() => setViewMode("documents")} className={viewMode === "documents" ? subActive : subBase}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 19.5h16" /><path d="M7 16V4h4l2 3h4v9" /></svg>
                  All Documents
                </button>
              </div>
            )}
          </div>

          <button onClick={onOpenReports} className={viewMode === "reports" ? navActive : navBase}>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
            Reports
          </button>
          <button onClick={() => setViewMode("subscriptions")} className={viewMode === "subscriptions" ? navActive : navBase}>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 7h16" /><path d="M6 7V5.5A1.5 1.5 0 0 1 7.5 4h9A1.5 1.5 0 0 1 18 5.5V7" /><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 12h6" /></svg>
            Subscriptions
          </button>
          <button onClick={() => setViewMode("settings")} className={viewMode === "settings" ? navActive : navBase}>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="m19.4 15 1.3 2.3-2.4 2.4-2.3-1.3a8.7 8.7 0 0 1-2 .8l-.7 2.6h-3.4l-.7-2.6a8.7 8.7 0 0 1-2-.8l-2.3 1.3-2.4-2.4L4.6 15a8.7 8.7 0 0 1 0-2l-2.3-1.3 2.4-2.4 2.3 1.3a8.7 8.7 0 0 1 2-.8l.7-2.6h3.4l.7 2.6a8.7 8.7 0 0 1 2 .8l2.3-1.3 2.4 2.4-1.3 2.3c.1.7.1 1.3 0 2Z" /></svg>
            Settings
          </button>
        </nav>
      </div>

      {/* ── User ── */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        {/* Subscription Tier Badge */}
        <div className="mb-3 flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan</span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
            subscriptionTier === "Enterprise" 
              ? "bg-purple-500/20 text-purple-300" 
              : subscriptionTier === "Professional" 
                ? "bg-emerald-500/20 text-emerald-300" 
                : "bg-blue-500/20 text-blue-300"
          }`}>
            {subscriptionTier}
          </span>
        </div>
        
        {/* Usage Meter */}
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Employees</span>
            <span className="text-slate-300">{employeesUsed}/{employeesLimit}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-700">
            <div 
              className="h-1.5 rounded-full bg-blue-500 transition-all" 
              style={{ width: `${Math.min((employeesUsed / employeesLimit) * 100, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Vendors</span>
            <span className="text-slate-300">{vendorsUsed}/{vendorsLimit}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-700">
            <div 
              className="h-1.5 rounded-full bg-emerald-500 transition-all" 
              style={{ width: `${Math.min((vendorsUsed / vendorsLimit) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-[13px] font-bold text-white">
            {authUser?.name.slice(0, 1) ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-200">{authUser?.name ?? "Admin"}</p>
            <p className="truncate text-[10px] text-slate-500">{authUser?.role ?? "Global Admin"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-2.5 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-slate-500 transition-all duration-200 hover:bg-white/[0.08] hover:text-slate-300 hover:border-white/[0.12]"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}
