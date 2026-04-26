import type { AuthScreenType } from "../../app/types";

type AuthScreenProps = {
  authScreen: AuthScreenType;
  loginForm: any;
  registerForm: any;
  mfaCode: string;
  forgotEmail: string;
  registerMessage: string;
  socialLoginMessage: string;
  loginError: string;
  mfaError: string;
  forgotMessage: string;
  registerError: string;
  isAuthenticating?: boolean;
  onPrepareSignIn: () => void;
  onPrepareRegister: () => void;
  onScreenChange: (screen: AuthScreenType) => void;
  onLoginFormChange: (field: string, value: string) => void;
  onRegisterFormChange: (field: string, value: string) => void;
  onMfaCodeChange: (code: string) => void;
  onForgotEmailChange: (email: string) => void;
  onLoginSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onMfaSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onForgotPassword: (event: React.FormEvent<HTMLFormElement>) => void;
  onRegisterSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSocialLogin: (provider: string) => void;
};

export function AuthScreen({
  authScreen,
  loginForm,
  registerForm,
  mfaCode,
  forgotEmail,
  registerMessage,
  socialLoginMessage,
  loginError,
  mfaError,
  forgotMessage,
  registerError,
  isAuthenticating,
  onPrepareSignIn,
  onPrepareRegister,
  onScreenChange,
  onLoginFormChange,
  onRegisterFormChange,
  onMfaCodeChange,
  onForgotEmailChange,
  onLoginSubmit,
  onMfaSubmit,
  onForgotPassword,
  onRegisterSubmit,
  onSocialLogin,
}: AuthScreenProps) {
  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
  const labelCls = "text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500";
  const socialBtnCls =
    "flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98]";

  const authMessage = loginError || registerError || mfaError || forgotMessage || registerMessage || socialLoginMessage;

  return (
    <div className="auth-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="auth-frame w-full max-w-[960px] grid grid-cols-1 overflow-hidden rounded-3xl lg:grid-cols-[1fr_1.1fr]">
        {/* ── Hero Panel ── */}
        <div className="auth-hero hidden lg:flex flex-col justify-between p-10 text-white">
          <div>
            <img 
              src="/images/logo-vertical.png" 
              alt="TaxCore360" 
              className="h-16 w-auto max-w-[120px] object-contain drop-shadow-lg"
            />
            <p className="mt-4 text-[14px] leading-relaxed text-white/60">
              Enterprise-grade payroll tax compliance. W-2, 1099-NEC, Form 941, and quarterly filing — automated.
            </p>
          </div>

          <div className="space-y-3">
            {[
              ["IRS-Ready", "Auto-generated W-2 + W-3"],
              ["Quarterly", "941 deadline tracking"],
              ["Secure", "SOC 2 compliant"],
            ].map(([title, desc]) => (
              <div key={title} className="hero-stat rounded-xl px-4 py-3">
                <p className="text-[13px] font-semibold text-white/90">{title}</p>
                <p className="text-[11px] text-white/40">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form Panel ── */}
        <div className="auth-panel flex flex-col justify-center p-8 lg:p-10">
          {authScreen === "welcome" && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="text-center lg:text-left">
                <h3 className="text-[32px] font-extrabold tracking-tight text-slate-900 leading-tight">
                  Modern Payroll Tax <br />
                  <span className="text-blue-600">Compliance</span>
                </h3>
                <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
                  Automate W-2, 1099-NEC and quarterly 941 filings with enterprise-grade precision. 
                  Select an option below to get started.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <button 
                  type="button" 
                  onClick={onPrepareSignIn}
                  className="w-full rounded-2xl bg-slate-900 py-4 text-[15px] font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Sign In to Workspace
                </button>
                <button 
                  type="button" 
                  onClick={onPrepareRegister}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-white py-4 text-[15px] font-bold text-slate-600 transition-all hover:border-slate-200 hover:bg-slate-50 active:scale-[0.98]"
                >
                  Create New Account
                </button>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-[11px] uppercase font-bold tracking-[0.2em] text-slate-400 bg-white px-4">Trusted by 5,000+ Teams</div>
              </div>
            </div>
          )}

          {authScreen === "signin" && (
            <form onSubmit={onLoginSubmit} className="space-y-5 animate-fade-in-up">
              <div>
                <h3 className="text-[24px] font-extrabold tracking-tight text-slate-900">Welcome back</h3>
                <p className="mt-1 text-[13px] text-slate-500">Sign in to your TaxCore360 workspace</p>
              </div>
              {authMessage && (
                <p className={`rounded-lg border px-3 py-2 text-[12px] font-medium ${loginError ? "border-rose-200 bg-rose-50 text-rose-600" : "border-blue-200 bg-blue-50 text-blue-600"}`}>
                  {authMessage}
                </p>
              )}
              <div className="space-y-4">
                <label className="space-y-2 block">
                  <span className={labelCls}>Email Address</span>
                  <input type="email" value={loginForm.email} onChange={(e) => onLoginFormChange("email", e.target.value)} placeholder="name@company.com" className={inputCls} />
                </label>
                <label className="space-y-2 block">
                  <span className={labelCls}>Password</span>
                  <input type="password" value={loginForm.password} onChange={(e) => onLoginFormChange("password", e.target.value)} placeholder="••••••••" className={inputCls} />
                </label>
              </div>
              <button type="submit" disabled={isAuthenticating} className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0">
                {isAuthenticating ? 'Signing in...' : 'Sign In'}
              </button>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-white px-2">OR</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => onSocialLogin("Google")} className={socialBtnCls}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Google
                </button>
                <button type="button" onClick={() => onSocialLogin("Microsoft")} className={socialBtnCls}>
                   <svg viewBox="0 0 23 23" className="h-4 w-4" fill="currentColor"><path d="M11.5 0h-11.5v11.5h11.5v-11.5z" fill="#f25022"/><path d="M23 0h-11.5v11.5h11.5v-11.5z" fill="#7fbb00"/><path d="M11.5 11.5h-11.5v11.5h11.5v-11.5z" fill="#00a1f1"/><path d="M23 11.5h-11.5v11.5h11.5v-11.5z" fill="#ffb900"/></svg>
                  SSO
                </button>
              </div>

              <div className="flex items-center justify-between text-[12px] pt-2">
                <button type="button" onClick={() => onScreenChange("forgot")} className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</button>
                <button type="button" onClick={onPrepareRegister} className="font-medium text-slate-500 hover:text-slate-700 transition-colors">Create account →</button>
              </div>
            </form>
          )}

          {authScreen === "register" && (
            <form onSubmit={onRegisterSubmit} className="space-y-6 animate-fade-in-up">
              <div>
                <h3 className="text-[24px] font-extrabold tracking-tight text-slate-900">Create account</h3>
                <p className="mt-1 text-[13px] text-slate-500">Start your 14-day free trial</p>
              </div>
              {authMessage && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-600">{authMessage}</p>}
              <div className="space-y-4">
                <label className="space-y-2 block">
                  <span className={labelCls}>Full Name</span>
                  <input value={registerForm.name} onChange={(e) => onRegisterFormChange("name", e.target.value)} placeholder="John Doe" className={inputCls} />
                </label>
                <label className="space-y-2 block">
                  <span className={labelCls}>Work Email</span>
                  <input type="email" value={registerForm.email} onChange={(e) => onRegisterFormChange("email", e.target.value)} placeholder="name@company.com" className={inputCls} />
                </label>
                <label className="space-y-2 block">
                  <span className={labelCls}>Password</span>
                  <input type="password" value={registerForm.password} onChange={(e) => onRegisterFormChange("password", e.target.value)} placeholder="Create a strong password" className={inputCls} />
                </label>
              </div>
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:scale-[0.98]">
                Start Growing
              </button>
              <p className="text-center text-[12px] text-slate-500">
                Already registered?{" "}
                <button type="button" onClick={onPrepareSignIn} className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Sign in</button>
              </p>
            </form>
          )}

          {authScreen === "mfa" && (
            <form onSubmit={onMfaSubmit} className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200/50 mb-4">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M12 3a4 4 0 0 0-4 4v4h8V7a4 4 0 0 0-4-4Z" /><circle cx="12" cy="16" r="1" /></svg>
                </div>
                <h3 className="text-[22px] font-extrabold tracking-tight text-slate-900">Security Check</h3>
                <p className="mt-1 text-[13px] text-slate-500">Enter the 6-digit code sent to your device</p>
              </div>
              {authMessage && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-medium text-rose-600">{authMessage}</p>}
              <input
                value={mfaCode}
                onChange={(e) => onMfaCodeChange(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-center text-[28px] font-bold tracking-[0.6em] text-slate-800 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:scale-[0.98]">
                Verify Identity
              </button>
            </form>
          )}

          {authScreen === "forgot" && (
            <form onSubmit={onForgotPassword} className="space-y-6 animate-fade-in-up">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200/50 mb-4">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-amber-500" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M3 8l9 6 9-6" /><rect x="3" y="6" width="18" height="14" rx="2" /></svg>
                </div>
                <h3 className="text-[22px] font-extrabold tracking-tight text-slate-900">Reset password</h3>
                <p className="mt-1 text-[13px] text-slate-500">We'll email you a reset link</p>
              </div>
              {authMessage && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-700">{authMessage}</p>}
              <label className="space-y-2 block">
                <span className={labelCls}>Email Address</span>
                <input type="email" value={forgotEmail} onChange={(e) => onForgotEmailChange(e.target.value)} placeholder="name@company.com" className={inputCls} />
              </label>
              <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 active:scale-[0.98]">
                Send Recovery Link
              </button>
              <p className="text-center text-[12px] text-slate-500">
                <button type="button" onClick={() => onScreenChange("signin")} className="font-medium text-blue-600 hover:text-blue-700 transition-colors">← Back to sign in</button>
              </p>
            </form>
          )}

          <div className="auth-note mt-8 rounded-xl px-4 py-3 text-center">
            <p className="text-[11px] text-blue-400/80">
              🔒 Secured with AES-256 encryption + SOC 2 Type II
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
