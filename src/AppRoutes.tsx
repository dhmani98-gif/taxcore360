import { Routes, Route, Navigate } from "react-router-dom";
import type { AuthUser } from "./services/authService";

// View components placeholders - we'll import actual components
import App from "./App";

interface AppRoutesProps {
  user: AuthUser | null;
  loading: boolean;
}

export function AppRoutes({ user: _user, loading }: AppRoutesProps) {
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // For now, render the main App component which handles all views internally
  // In a full refactor, each route would render a specific view component
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<App />} />
      <Route path="/employees" element={<App />} />
      <Route path="/payroll" element={<App />} />
      <Route path="/vendors" element={<App />} />
      <Route path="/w2" element={<App />} />
      <Route path="/w2/forms" element={<App />} />
      <Route path="/w2/summary" element={<App />} />
      <Route path="/portal" element={<App />} />
      <Route path="/portal/*" element={<App />} />
      <Route path="/reports" element={<App />} />
      <Route path="/settings" element={<App />} />
      <Route path="/subscriptions" element={<App />} />
      <Route path="/tasks" element={<App />} />
      <Route path="/documents" element={<App />} />
      <Route path="/login" element={<App />} />
      <Route path="/auth/*" element={<App />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
