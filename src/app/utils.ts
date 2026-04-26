import type { BillingCycle, SubscriptionPlan, TaxIdType, VendorEntityType, VendorRow } from "./types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const stateWithholdingRates: Partial<Record<string, number>> = {
  California: 0.07,
  "New York": 0.065,
  "New Jersey": 0.06,
  Illinois: 0.0495,
  Oregon: 0.06,
  Minnesota: 0.055,
  Massachusetts: 0.05,
};

const zipLeadingDigitByState: Record<string, string[]> = {
  Alabama: ["3"],
  Alaska: ["9"],
  Arizona: ["8"],
  Arkansas: ["7"],
  California: ["9"],
  Colorado: ["8"],
  Connecticut: ["0"],
  Delaware: ["1"],
  Florida: ["3"],
  Georgia: ["3"],
  Hawaii: ["9"],
  Idaho: ["8"],
  Illinois: ["6"],
  Indiana: ["4"],
  Iowa: ["5"],
  Kansas: ["6"],
  Kentucky: ["4"],
  Louisiana: ["7"],
  Maine: ["0"],
  Maryland: ["2"],
  Massachusetts: ["0"],
  Michigan: ["4"],
  Minnesota: ["5"],
  Mississippi: ["3"],
  Missouri: ["6"],
  Montana: ["5"],
  Nebraska: ["6"],
  Nevada: ["8"],
  "New Hampshire": ["0"],
  "New Jersey": ["0"],
  "New Mexico": ["8"],
  "New York": ["1"],
  "North Carolina": ["2"],
  "North Dakota": ["5"],
  Ohio: ["4"],
  Oklahoma: ["7"],
  Oregon: ["9"],
  Pennsylvania: ["1"],
  "Rhode Island": ["0"],
  "South Carolina": ["2"],
  "South Dakota": ["5"],
  Tennessee: ["3"],
  Texas: ["7"],
  Utah: ["8"],
  Vermont: ["0"],
  Virginia: ["2"],
  Washington: ["9"],
  "West Virginia": ["2"],
  Wisconsin: ["5"],
  Wyoming: ["8"],
  "District of Columbia": ["2"],
};

const mockIrsTinDirectory: Record<string, string[]> = {
  "86-4567890": ["Pioneer Creative Studio", "Pioneer Creative LLC"],
  "523-11-8899": ["Ethan Brooks Consulting", "Ethan Brooks"],
  "91-2233445": ["North Harbor Hardware Inc", "North Harbor Hardware"],
};

export const toUsd = (value: number) => currencyFormatter.format(value);
export const toW2Amount = (value: number) => value.toFixed(2);
export const normalizeToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export const getMonthRange = (monthValue: string) => {
  const [yearString, monthString] = monthValue.split("-");
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;

  if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return {
      payPeriod: "",
      payDate: "",
      label: "",
    };
  }

  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0);
  const payDate = new Date(year, monthIndex + 1, 5);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

  return {
    payPeriod: `${formatDate(startDate)} - ${formatDate(endDate)}`,
    payDate: formatDate(payDate),
    label: startDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
  };
};

export const getDefaultPaymentDate = (monthValue: string) => {
  const [yearString, monthString] = monthValue.split("-");
  const year = Number(yearString);
  const month = Number(monthString);

  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    return "";
  }

  return `${yearString}-${String(month).padStart(2, "0")}-05`;
};

export const getStateWithholdingRate = (state: string) => stateWithholdingRates[state] ?? 0;

export const isZipFormatValid = (zipCode: string) => /^\d{5}(?:-\d{4})?$/.test(zipCode.trim());

export const isZipMatchingState = (state: string, zipCode: string) => {
  if (!state || !zipCode) {
    return false;
  }

  const normalizedZip = zipCode.trim();
  if (!isZipFormatValid(normalizedZip)) {
    return false;
  }

  const allowedLeadingDigits = zipLeadingDigitByState[state];
  if (!allowedLeadingDigits || allowedLeadingDigits.length === 0) {
    return true;
  }

  return allowedLeadingDigits.includes(normalizedZip[0]);
};

export const validateTinFormat = (taxIdType: TaxIdType, taxId: string) => {
  const normalizedTaxId = taxId.trim();
  const pattern = taxIdType === "EIN" ? /^\d{2}-\d{7}$/ : /^\d{3}-\d{2}-\d{4}$/;
  return pattern.test(normalizedTaxId);
};

export const normalizeNameForTinMatch = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export const hasMockTinRegistryRecord = (taxId: string) => Boolean(mockIrsTinDirectory[taxId.trim()]);

export const isTinMatchedToVendorName = (vendor: Pick<VendorRow, "legalName" | "taxIdType" | "taxId">) => {
  const formattedTin = vendor.taxId.trim();
  if (!validateTinFormat(vendor.taxIdType, formattedTin)) {
    return false;
  }

  const registryNames = mockIrsTinDirectory[formattedTin];
  if (!registryNames || registryNames.length === 0) {
    return true;
  }

  const normalizedVendorName = normalizeNameForTinMatch(vendor.legalName);
  return registryNames.some((name) => normalizeNameForTinMatch(name) === normalizedVendorName);
};

export const daysUntil = (targetDate: Date) => Math.max(Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 0);

export const getNextForm941DueDate = (baseDate = new Date()) => {
  const year = baseDate.getFullYear();
  const dueDates = [new Date(year, 3, 30), new Date(year, 6, 31), new Date(year, 9, 31), new Date(year + 1, 0, 31)];

  return dueDates.find((dueDate) => dueDate.getTime() > baseDate.getTime()) ?? new Date(year + 1, 3, 30);
};

export const getQuarterFromDate = (dateValue: string): "Q1" | "Q2" | "Q3" | "Q4" => {
  const month = Number(dateValue.split("-")[1]);
  if (month >= 1 && month <= 3) return "Q1";
  if (month >= 4 && month <= 6) return "Q2";
  if (month >= 7 && month <= 9) return "Q3";
  return "Q4";
};

export const vendorNeeds1099 = (entityType: VendorEntityType) => entityType !== "Corporation";

export const getPlanDefaultCycle = (plan: SubscriptionPlan): BillingCycle => {
  if (plan === "Pay Per Form") return "Per Filing";
  if (plan === "Enterprise") return "Annual";
  return "Monthly";
};

export const buildSmoothSvgPath = (points: Array<{ x: number; y: number }>) => {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previousPoint = points[index - 1];
    const controlX = (previousPoint.x + point.x) / 2;
    return `${path} C ${controlX} ${previousPoint.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");
};
