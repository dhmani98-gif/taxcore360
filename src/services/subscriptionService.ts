
export type SubscriptionTier = "free" | "pro" | "enterprise";

export type SubscriptionLimits = {
  maxEmployees: number;
  maxVendors: number;
  allowExports: boolean;
  allowAdvancedReports: boolean;
  allowApi: boolean;
  prioritySupport: boolean;
};

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxEmployees: 5,
    maxVendors: 3,
    allowExports: false,
    allowAdvancedReports: false,
    allowApi: false,
    prioritySupport: false,
  },
  pro: {
    maxEmployees: 50,
    maxVendors: 25,
    allowExports: true,
    allowAdvancedReports: true,
    allowApi: true,
    prioritySupport: true,
  },
  enterprise: {
    maxEmployees: Infinity,
    maxVendors: Infinity,
    allowExports: true,
    allowAdvancedReports: true,
    allowApi: true,
    prioritySupport: true,
  },
};

export type CompanySubscription = {
  id: string;
  companyId: string;
  tier: SubscriptionTier;
  status: "active" | "cancelled" | "past_due";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  employeesUsed: number;
  vendorsUsed: number;
};

export const subscriptionService = {
  // Get subscription limits for a tier
  getLimits: (tier: SubscriptionTier): SubscriptionLimits => {
    return SUBSCRIPTION_TIERS[tier];
  },

  // Check if user can add more employees
  canAddEmployee: (subscription: CompanySubscription | null): boolean => {
    if (!subscription) return false;
    const limits = SUBSCRIPTION_TIERS[subscription.tier];
    return subscription.employeesUsed < limits.maxEmployees;
  },

  // Check if user can add more vendors
  canAddVendor: (subscription: CompanySubscription | null): boolean => {
    if (!subscription) return false;
    const limits = SUBSCRIPTION_TIERS[subscription.tier];
    return subscription.vendorsUsed < limits.maxVendors;
  },

  // Check feature availability
  canExport: (subscription: CompanySubscription | null): boolean => {
    if (!subscription) return false;
    return SUBSCRIPTION_TIERS[subscription.tier].allowExports;
  },

  canUseAdvancedReports: (subscription: CompanySubscription | null): boolean => {
    if (!subscription) return false;
    return SUBSCRIPTION_TIERS[subscription.tier].allowAdvancedReports;
  },

  // Format tier name for display
  formatTierName: (tier: SubscriptionTier): string => {
    const names: Record<SubscriptionTier, string> = {
      free: "Free",
      pro: "Pro",
      enterprise: "Enterprise",
    };
    return names[tier];
  },

  // Get upgrade message when limit reached
  getUpgradeMessage: (
    subscription: CompanySubscription | null,
    resource: "employees" | "vendors"
  ): string => {
    if (!subscription) return "Please subscribe to continue.";
    
    const currentTier = subscription.tier;
    const limit = resource === "employees" 
      ? SUBSCRIPTION_TIERS[currentTier].maxEmployees 
      : SUBSCRIPTION_TIERS[currentTier].maxVendors;

    if (currentTier === "free") {
      return `You've reached the ${limit} ${resource} limit on the Free plan. Upgrade to Pro for ${resource === "employees" ? "50" : "25"} ${resource}.`;
    } else if (currentTier === "pro") {
      return `You've reached the ${limit} ${resource} limit on the Pro plan. Upgrade to Enterprise for unlimited ${resource}.`;
    }
    return `You have reached the maximum limit.`;
  },
};

export default subscriptionService;
