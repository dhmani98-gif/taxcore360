import { Routes, Route, Navigate } from "react-router-dom";
import type { AuthUser } from "./services/authService";

// Lazy loaded App component for better performance
import { LazyApp } from "./components/LazyApp";

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
      <Route path="/" element={<LazyApp />} />
      <Route path="/dashboard" element={<LazyApp />} />
      <Route path="/employees" element={<LazyApp />} />
      <Route path="/payroll" element={<LazyApp />} />
      <Route path="/vendors" element={<LazyApp />} />
      <Route path="/w2" element={<LazyApp />} />
      <Route path="/w2/forms" element={<LazyApp />} />
      <Route path="/w2/summary" element={<LazyApp />} />
      <Route path="/portal" element={<LazyApp />} />
      <Route path="/portal/*" element={<LazyApp />} />
      <Route path="/reports" element={<LazyApp />} />
      <Route path="/settings" element={<LazyApp />} />
      <Route path="/subscriptions" element={<LazyApp />} />
      <Route path="/tasks" element={<LazyApp />} />
      <Route path="/documents" element={<LazyApp />} />
      <Route path="/login" element={<LazyApp />} />
      <Route path="/auth/*" element={<LazyApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
