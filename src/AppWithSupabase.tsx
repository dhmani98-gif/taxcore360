import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { AuthScreen } from "./components/auth/AuthScreen";
import type { AuthScreenType } from "./app/types";

/**
 * Simple Supabase Authentication Test Component
 * This component tests Supabase authentication without the full app features.
 * Once authentication is verified, we can integrate it with the full App.tsx
 */
function AppWithSupabase() {
  const { user: authUser, loading: authLoading, signIn, signUp, signOut, resetPassword } = useAuth();
  
  const [authScreen, setAuthScreen] = useState<AuthScreenType>("welcome");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState<"error" | "success" | "info">("info");

  // Handle sign in with Supabase
  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage("");
    
    const result = await signIn(loginForm.email, loginForm.password);
    
    if (!result.success) {
      setAuthMessage(result.error || "Failed to sign in");
      setAuthMessageType("error");
    } else {
      setAuthMessage("Sign in successful!");
      setAuthMessageType("success");
    }
  };

  // Handle sign up with Supabase
  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage("");
    
    if (registerForm.name.length < 2 || registerForm.password.length < 8) {
      setAuthMessage("Name must be at least 2 characters and password at least 8 characters");
      setAuthMessageType("error");
      return;
    }
    
    const result = await signUp(registerForm.email, registerForm.password, registerForm.name);
    
    if (!result.success) {
      setAuthMessage(result.error || "Failed to create account");
      setAuthMessageType("error");
    } else {
      setAuthMessage("Account created successfully! Please check your email to confirm.");
      setAuthMessageType("success");
      setAuthScreen("signin");
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthMessage("");
    
    const result = await resetPassword(forgotEmail);
    
    if (!result.success) {
      setAuthMessage(result.error || "Failed to send reset email");
      setAuthMessageType("error");
    } else {
      setAuthMessage("Password reset email sent! Check your inbox.");
      setAuthMessageType("success");
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    setAuthScreen("welcome");
  };

  // Handle social login (placeholder)
  const handleSocialLogin = (provider: string) => {
    setAuthMessage(`${provider} login not yet implemented`);
    setAuthMessageType("info");
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!authUser) {
    return (
      <AuthScreen
        authScreen={authScreen}
        loginForm={loginForm}
        registerForm={registerForm}
        mfaCode=""
        forgotEmail={forgotEmail}
        registerMessage={authMessageType === "success" ? authMessage : ""}
        socialLoginMessage={authMessageType === "info" ? authMessage : ""}
        loginError={authMessageType === "error" ? authMessage : ""}
        mfaError=""
        forgotMessage={authMessageType === "success" ? authMessage : ""}
        registerError={authMessageType === "error" ? authMessage : ""}
        onPrepareSignIn={() => {
          setAuthScreen("signin");
          setAuthMessage("");
        }}
        onPrepareRegister={() => {
          setAuthScreen("register");
          setAuthMessage("");
        }}
        onScreenChange={setAuthScreen}
        onLoginFormChange={(field: string, value: string) => setLoginForm((prev) => ({ ...prev, [field]: value }))}
        onRegisterFormChange={(field: string, value: string) => setRegisterForm((prev) => ({ ...prev, [field]: value }))}
        onMfaCodeChange={() => {}}
        onForgotEmailChange={(email: string) => setForgotEmail(email)}
        onLoginSubmit={handleLoginSubmit}
        onMfaSubmit={() => {}}
        onForgotPassword={handleForgotPassword}
        onRegisterSubmit={handleRegisterSubmit}
        onSocialLogin={handleSocialLogin}
      />
    );
  }

  // Show authenticated state
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Supabase Auth Test</h1>
          <p className="text-slate-600 mt-2">Authentication successful!</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700">User ID:</p>
            <p className="text-sm text-slate-600 break-all">{authUser.id}</p>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700">Email:</p>
            <p className="text-sm text-slate-600">{authUser.email}</p>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700">Name:</p>
            <p className="text-sm text-slate-600">{authUser.full_name || "Not set"}</p>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm font-medium text-slate-700">Role:</p>
            <p className="text-sm text-slate-600">{authUser.role}</p>
          </div>
          
          {authUser.company_id && (
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-medium text-slate-700">Company ID:</p>
              <p className="text-sm text-slate-600">{authUser.company_id}</p>
            </div>
          )}
          
          <button
            onClick={handleSignOut}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Sign Out
          </button>
          
          <p className="text-center text-sm text-slate-500 mt-4">
            This is a test component. The full app integration will be implemented next.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppWithSupabase;
