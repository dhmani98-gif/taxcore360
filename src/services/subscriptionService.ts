
// Subscription tier using the same naming as app types
export type SubscriptionTier = "Pay Per Form" | "Professional" | "Enterprise";

export type SubscriptionPlanInfo = {
  name: string;
  price: number;
  priceLabel: string;
  subtitle: string;
  features: string[];
  badge?: string;
};

export type SubscriptionLimits = {
  maxEmployees: number;
  maxVendors: number;
  maxFormsPerMonth: number;
  allowExports: boolean;
  allowESignW9: boolean;
  allowAutomatedFiling: boolean;
  allowMultiWorkspace: boolean;
  prioritySupport: boolean;
  dedicatedSupport: boolean;
  internationalCompliance: boolean;
  advancedPermissions: boolean;
  quarterly941Tracking: boolean;
  aes256Encryption: boolean;
};

// Plan display information
export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlanInfo> = {
  "Pay Per Form": {
    name: "Pay Per Form",
    price: 4.00,
    priceLabel: "$4.00",
    subtitle: "Perfect for occasional filers and small projects",
    features: [
      "W-2 & 1099-NEC form generation",
      "IRS-compliant electronic copies",
      "Quarterly 941 filing tracking",
      "Deadline alerts & reminders",
      "AES-256 SOC 2 encryption",
      "Up to 5 forms per month",
    ],
  },
  Professional: {
    name: "Professional",
    price: 79.00,
    priceLabel: "$79.00",
    subtitle: "Ideal for growing businesses",
    features: [
      "Unlimited employees & contractors",
      "Unlimited form generation",
      "E-signature for W-9 forms",
      "Automated filing (Excel/CSV import)",
      "Quarterly 941 filing tracking",
      "Priority email support",
      "All Pay Per Form features",
    ],
    badge: "Most Popular",
  },
  Enterprise: {
    name: "Enterprise",
    price: 199.00,
    priceLabel: "$199.00",
    subtitle: "For accounting firms & large companies",
    features: [
      "Multi-workspace support",
      "Dedicated technical support team",
      "International compliance (CRA Canada)",
      "Advanced user roles & permissions",
      "White-label options",
      "API access",
      "Custom integrations",
      "All Professional features",
    ],
    badge: "Best Value",
  },
};

// Technical limits for each tier
export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionLimits> = {
  "Pay Per Form": {
    maxEmployees: 5,
    maxVendors: 3,
    maxFormsPerMonth: 5,
    allowExports: true,
    allowESignW9: false,
    allowAutomatedFiling: false,
    allowMultiWorkspace: false,
    prioritySupport: false,
    dedicatedSupport: false,
    internationalCompliance: false,
    advancedPermissions: false,
    quarterly941Tracking: true,
    aes256Encryption: true,
  },
  Professional: {
    maxEmployees: Infinity,
    maxVendors: Infinity,
    maxFormsPerMonth: Infinity,
    allowExports: true,
    allowESignW9: true,
    allowAutomatedFiling: true,
    allowMultiWorkspace: false,
    prioritySupport: true,
    dedicatedSupport: false,
    internationalCompliance: false,
    advancedPermissions: false,
    quarterly941Tracking: true,
    aes256Encryption: true,
  },
  Enterprise: {
    maxEmployees: Infinity,
    maxVendors: Infinity,
    maxFormsPerMonth: Infinity,
    allowExports: true,
    allowESignW9: true,
    allowAutomatedFiling: true,
    allowMultiWorkspace: true,
    prioritySupport: true,
    dedicatedSupport: true,
    internationalCompliance: true,
    advancedPermissions: true,
    quarterly941Tracking: true,
    aes256Encryption: true,
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
    // Advanced reports available on Professional and Enterprise
    return subscription.tier !== "Pay Per Form";
  },

  // Format tier name for display
  formatTierName: (tier: SubscriptionTier): string => {
    return SUBSCRIPTION_PLANS[tier].name;
  },

  // Get plan info
  getPlanInfo: (tier: SubscriptionTier): SubscriptionPlanInfo => {
    return SUBSCRIPTION_PLANS[tier];
  },

  // Check specific feature availability
  canUseESignW9: (subscription: CompanySubscription | null): boolean => {
    if (!subscription) return false;
    return SUBSCRIPTION_TIERS[subscription.tier].allowESignW9;
  },

  canUseAutomatedFiling: (subscription: CompanySubscription | null): boolean => {
    if (!subscription) return false;
    return SUBSCRIPTION_TIERS[subscription.tier].allowAutomatedFiling;
  },

  canUseMultiWorkspace: (subscription: CompanySubscription | null): boolean => {
    if (!subscription) return false;
    return SUBSCRIPTION_TIERS[subscription.tier].allowMultiWorkspace;
  },

  // Get upgrade message when limit reached
  getUpgradeMessage: (
    subscription: CompanySubscription | null,
    resource: "employees" | "vendors"
  ): string => {
    if (!subscription) return "Please subscribe to continue.";
    
    const currentTier = subscription.tier;
    const limits = SUBSCRIPTION_TIERS[currentTier];
    const used = resource === "employees" ? subscription.employeesUsed : subscription.vendorsUsed;
    const limit = resource === "employees" ? limits.maxEmployees : limits.maxVendors;

    if (currentTier === "Pay Per Form") {
      return `You've used ${used}/${limit} ${resource} on the Pay Per Form plan. Upgrade to Professional for unlimited ${resource} and advanced features.`;
    } else if (currentTier === "Professional") {
      return `You're on the Professional plan with unlimited ${resource}. Need multi-workspace support? Upgrade to Enterprise.`;
    }
    return `You have unlimited ${resource} on your Enterprise plan.`;
  },
};

export default subscriptionService;
