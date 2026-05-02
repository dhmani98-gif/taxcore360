import { Suspense, lazy } from "react";

// Lazy load the main App component
const App = lazy(() => import("../App"));

// Loading fallback component
function AppLoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Loading TaxCore360...</p>
      </div>
    </div>
  );
}

// Lazy-loaded App wrapper
export function LazyApp() {
  return (
    <Suspense fallback={<AppLoadingFallback />}>
      <App />
    </Suspense>
  );
}
