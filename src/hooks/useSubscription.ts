import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { CompanySubscription, SubscriptionTier } from "../services/subscriptionService";
import { subscriptionService } from "../services/subscriptionService";

export type UseSubscriptionReturn = {
  subscription: CompanySubscription | null;
  loading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  canAddEmployee: boolean;
  canAddVendor: boolean;
  canExport: boolean;
  canUseAdvancedReports: boolean;
  employeesRemaining: number;
  vendorsRemaining: number;
  upgradeMessage: string | null;
};

export function useSubscription(companyId: string | null): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<CompanySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch subscription from Supabase
      const { data, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("company_id", companyId)
        .eq("status", "active")
        .single();

      if (subError && subError.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw subError;
      }

      if (data) {
        // Map database record to TypeScript type
        const mapped: CompanySubscription = {
          id: data.id,
          companyId: data.company_id,
          tier: data.tier as SubscriptionTier,
          status: data.status,
          currentPeriodStart: data.current_period_start,
          currentPeriodEnd: data.current_period_end,
          employeesUsed: data.employees_used || 0,
          vendorsUsed: data.vendors_used || 0,
        };
        setSubscription(mapped);
      } else {
        // No active subscription - default to Pay Per Form
        setSubscription({
          id: "default",
          companyId: companyId,
          tier: "Pay Per Form",
          status: "active",
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          employeesUsed: 0,
          vendorsUsed: 0,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscription");
      console.error("Subscription error:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Derived values
  const canAddEmployee = subscriptionService.canAddEmployee(subscription);
  const canAddVendor = subscriptionService.canAddVendor(subscription);
  const canExport = subscriptionService.canExport(subscription);
  const canUseAdvancedReports = subscriptionService.canUseAdvancedReports(subscription);

  const limits = subscription ? subscriptionService.getLimits(subscription.tier) : null;
  const employeesRemaining = limits && subscription
    ? Math.max(0, limits.maxEmployees - subscription.employeesUsed)
    : 0;
  const vendorsRemaining = limits && subscription
    ? Math.max(0, limits.maxVendors - subscription.vendorsUsed)
    : 0;

  const upgradeMessage =
    subscription && subscription.tier !== "Enterprise"
      ? subscriptionService.getUpgradeMessage(subscription, employeesRemaining === 0 ? "employees" : "vendors")
      : null;

  return {
    subscription,
    loading,
    error,
    refreshSubscription: fetchSubscription,
    canAddEmployee,
    canAddVendor,
    canExport,
    canUseAdvancedReports,
    employeesRemaining,
    vendorsRemaining,
    upgradeMessage,
  };
}

export default useSubscription;
