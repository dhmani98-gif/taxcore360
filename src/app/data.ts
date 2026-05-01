import type {
  AppUserRecord,
  BillingCycle,
  CardVariant,
  EmployeeRow,
  EmployeeStatus,
  EmployerProfile,
  FilingLifecycleStatus,
  ReportFocus,
  SubscriptionPlan,
  SubscriptionSettings,
  SubscriptionStatus,
  TaxIdType,
  VendorCategory,
  VendorEntityType,
  VendorPaymentRow,
  VendorRow,
} from "./types";

export const reportTypeOptions: Array<{ key: ReportFocus; title: string; text: string }> = [
  { key: "employee_count", title: "Employee Count Report", text: "Headcount by department and status" },
  { key: "paid_months", title: "Paid Months Report", text: "Monthly paid employees and disbursement amounts" },
  { key: "employee_statement", title: "Employee Statement", text: "Detailed account statement for one employee" },
  { key: "w2_transmittal", title: "W-2 / W-3 Summary", text: "Annual wage and tax totals for W-2 and W-3 reconciliation" },
  { key: "form_1099_compliance", title: "1099-NEC Compliance", text: "Vendor threshold and filing-status summary for Form 1099-NEC" },
  { key: "tax_reconciliation", title: "Tax Reconciliation", text: "Disbursement vs 1099 totals with unallocated payment checks" },
];

export const companyOptions = [
  { id: "DEFAULT", name: "", ein: "" },
] as const;

export const filingLifecycleOptions: FilingLifecycleStatus[] = ["Not Started", "Draft", "Submitted", "Accepted", "Rejected"];
export const payrollMonthOptions = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
export const executiveChartPalette = ["#4f74b9", "#5b61ff", "#2f65de", "#8da5cc", "#26446f", "#f39b3a"];

export const employeeCards = [
  { title: "TOTAL EMPLOYEES", value: "0", variant: "default" as CardVariant },
  { title: "ACTIVE PAYROLL", value: "$0.00", variant: "accent" as CardVariant },
  { title: "AVG MONTHLY WAGE", value: "$0.00", variant: "default" as CardVariant },
  { title: "FLAGGED VARIANCES", value: "0", variant: "dark" as CardVariant },
];

export const initialEmployeeRows: EmployeeRow[] = [];

export const employeeFormTemplate = {
  firstName: "",
  lastName: "",
  ssn: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  department: "",
  jobTitle: "",
  hireDate: "",
  grossPay: "",
  status: "Active" as EmployeeStatus,
};

export const departmentOptions = ["Sales", "Marketing", "IT", "Finance", "HR", "Operations", "Customer Service", "Legal", "R&D", "Administration"];
export const vendorCategoryOptions: VendorCategory[] = ["Consulting", "Design", "Development", "Legal", "Marketing", "Operations"];

export const usCityOptions = [
  { city: "Birmingham", state: "Alabama" },
  { city: "Montgomery", state: "Alabama" },
  { city: "Anchorage", state: "Alaska" },
  { city: "Juneau", state: "Alaska" },
  { city: "Phoenix", state: "Arizona" },
  { city: "Tucson", state: "Arizona" },
  { city: "Little Rock", state: "Arkansas" },
  { city: "Fayetteville", state: "Arkansas" },
  { city: "Los Angeles", state: "California" },
  { city: "San Diego", state: "California" },
  { city: "San Francisco", state: "California" },
  { city: "Sacramento", state: "California" },
  { city: "Denver", state: "Colorado" },
  { city: "Colorado Springs", state: "Colorado" },
  { city: "Bridgeport", state: "Connecticut" },
  { city: "Hartford", state: "Connecticut" },
  { city: "Wilmington", state: "Delaware" },
  { city: "Dover", state: "Delaware" },
  { city: "Jacksonville", state: "Florida" },
  { city: "Miami", state: "Florida" },
  { city: "Orlando", state: "Florida" },
  { city: "Tallahassee", state: "Florida" },
  { city: "Atlanta", state: "Georgia" },
  { city: "Savannah", state: "Georgia" },
  { city: "Honolulu", state: "Hawaii" },
  { city: "Hilo", state: "Hawaii" },
  { city: "Boise", state: "Idaho" },
  { city: "Idaho Falls", state: "Idaho" },
  { city: "Chicago", state: "Illinois" },
  { city: "Springfield", state: "Illinois" },
  { city: "Indianapolis", state: "Indiana" },
  { city: "Fort Wayne", state: "Indiana" },
  { city: "Des Moines", state: "Iowa" },
  { city: "Cedar Rapids", state: "Iowa" },
  { city: "Wichita", state: "Kansas" },
  { city: "Topeka", state: "Kansas" },
  { city: "Louisville", state: "Kentucky" },
  { city: "Lexington", state: "Kentucky" },
  { city: "New Orleans", state: "Louisiana" },
  { city: "Baton Rouge", state: "Louisiana" },
  { city: "Portland", state: "Maine" },
  { city: "Augusta", state: "Maine" },
  { city: "Baltimore", state: "Maryland" },
  { city: "Annapolis", state: "Maryland" },
  { city: "Boston", state: "Massachusetts" },
  { city: "Worcester", state: "Massachusetts" },
  { city: "Detroit", state: "Michigan" },
  { city: "Lansing", state: "Michigan" },
  { city: "Minneapolis", state: "Minnesota" },
  { city: "Saint Paul", state: "Minnesota" },
  { city: "Jackson", state: "Mississippi" },
  { city: "Gulfport", state: "Mississippi" },
  { city: "Kansas City", state: "Missouri" },
  { city: "Saint Louis", state: "Missouri" },
  { city: "Jefferson City", state: "Missouri" },
  { city: "Billings", state: "Montana" },
  { city: "Helena", state: "Montana" },
  { city: "Omaha", state: "Nebraska" },
  { city: "Lincoln", state: "Nebraska" },
  { city: "Las Vegas", state: "Nevada" },
  { city: "Reno", state: "Nevada" },
  { city: "Manchester", state: "New Hampshire" },
  { city: "Concord", state: "New Hampshire" },
  { city: "Newark", state: "New Jersey" },
  { city: "Jersey City", state: "New Jersey" },
  { city: "Trenton", state: "New Jersey" },
  { city: "Albuquerque", state: "New Mexico" },
  { city: "Santa Fe", state: "New Mexico" },
  { city: "New York", state: "New York" },
  { city: "Buffalo", state: "New York" },
  { city: "Albany", state: "New York" },
  { city: "Charlotte", state: "North Carolina" },
  { city: "Raleigh", state: "North Carolina" },
  { city: "Fargo", state: "North Dakota" },
  { city: "Bismarck", state: "North Dakota" },
  { city: "Columbus", state: "Ohio" },
  { city: "Cleveland", state: "Ohio" },
  { city: "Oklahoma City", state: "Oklahoma" },
  { city: "Tulsa", state: "Oklahoma" },
  { city: "Portland", state: "Oregon" },
  { city: "Salem", state: "Oregon" },
  { city: "Philadelphia", state: "Pennsylvania" },
  { city: "Pittsburgh", state: "Pennsylvania" },
  { city: "Providence", state: "Rhode Island" },
  { city: "Warwick", state: "Rhode Island" },
  { city: "Charleston", state: "South Carolina" },
  { city: "Columbia", state: "South Carolina" },
  { city: "Sioux Falls", state: "South Dakota" },
  { city: "Pierre", state: "South Dakota" },
  { city: "Nashville", state: "Tennessee" },
  { city: "Memphis", state: "Tennessee" },
  { city: "Houston", state: "Texas" },
  { city: "Dallas", state: "Texas" },
  { city: "Austin", state: "Texas" },
  { city: "San Antonio", state: "Texas" },
  { city: "Salt Lake City", state: "Utah" },
  { city: "Provo", state: "Utah" },
  { city: "Burlington", state: "Vermont" },
  { city: "Montpelier", state: "Vermont" },
  { city: "Virginia Beach", state: "Virginia" },
  { city: "Richmond", state: "Virginia" },
  { city: "Seattle", state: "Washington" },
  { city: "Spokane", state: "Washington" },
  { city: "Charleston", state: "West Virginia" },
  { city: "Morgantown", state: "West Virginia" },
  { city: "Milwaukee", state: "Wisconsin" },
  { city: "Madison", state: "Wisconsin" },
  { city: "Cheyenne", state: "Wyoming" },
  { city: "Casper", state: "Wyoming" },
];

export const initialVendors: VendorRow[] = [];

export const initialVendorPayments: VendorPaymentRow[] = [];

export const generateVendorId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `V-${timestamp}${random}`.toUpperCase();
};

export const vendorFormTemplate = {
  vendorId: generateVendorId(),
  legalName: "",
  address: "",
  zipCode: "",
  email: "",
  phone: "",
  state: "",
  category: "Consulting" as VendorCategory,
  taxIdType: "EIN" as TaxIdType,
  taxId: "",
  entityType: "LLC" as VendorEntityType,
};

export const paymentFormTemplate = {
  vendorId: "",
  paymentDate: "",
  invoiceNumber: "",
  amount: "",
  paymentState: "",
};

export const w9FormTemplate = {
  legalName: "",
  email: "",
  address: "",
  state: "",
  taxIdType: "EIN" as TaxIdType,
  taxId: "",
  entityType: "Individual" as VendorEntityType,
};

export const usStateOptions = Array.from(new Set(usCityOptions.map((item) => item.state))).sort();

export const initialEmployerProfile: EmployerProfile = {
  legalName: "",
  ein: "",
  addressLine1: "",
  addressLine2: "",
  controlNumber: "",
};

export const initialSubscriptionSettings: SubscriptionSettings = {
  plan: "Professional" as SubscriptionPlan,
  status: "Active" as SubscriptionStatus,
  billingCycle: "Annual" as BillingCycle,
  seats: 0,
  renewalDate: "",
};

export const subscriptionPlanCatalog: Array<{
  plan: SubscriptionPlan;
  monthlyPrice: number;
  subtitle: string;
  features: string[];
}> = [
  {
    plan: "Pay Per Form",
    monthlyPrice: 4,
    subtitle: "Built for occasional filers",
    features: ["Pay only for filed forms", "No monthly commitment", "Great for seasonal filing"],
  },
  {
    plan: "Professional",
    monthlyPrice: 79,
    subtitle: "Built for growing operations",
    features: ["Unlimited vendors", "QuickBooks integration workflow", "Electronic signature for W-9 and 1099"],
  },
  {
    plan: "Enterprise",
    monthlyPrice: 199,
    subtitle: "For accounting firms",
    features: ["Multi-Entity workspace", "Unlimited client companies", "Priority compliance automation support"],
  },
];

export const initialAppUserDirectory: AppUserRecord[] = [];

export const w2FieldAliases = {
  employeeSsn: ["employeesocialsecuritynumber", "ssn", "socialsecurity"],
  employerEin: ["employeridentificationnumber", "ein", "federalein"],
  employerNameAddress: ["employername", "employeraddress", "nameaddresszip"],
  employeeName: ["employeename", "name"],
  controlNumber: ["controlnumber"],
  employeeAddress: ["employeeaddress", "addressandzipcode", "address"],
  box1: ["box1", "wagestipsothercompensation", "wages"],
  box2: ["box2", "federalincometaxwithheld", "federalwithholding"],
  box3: ["box3", "socialsecuritywages"],
  box4: ["box4", "socialsecuritytaxwithheld"],
  box5: ["box5", "medicarewagesandtips", "medicarewages"],
  box6: ["box6", "medicaretaxwithheld"],
  box7: ["box7", "socialsecuritytips"],
  box8: ["box8", "allocatedtips"],
  box9: ["box9", "verificationcode"],
  box10: ["box10", "dependentcarebenefits"],
  box11: ["box11", "nonqualifiedplans"],
  box12aCode: ["box12a", "12acode", "codea"],
  box12aAmount: ["box12aamount", "12aamount", "amounta"],
  box12bCode: ["box12b", "12bcode", "codeb"],
  box12bAmount: ["box12bamount", "12bamount", "amountb"],
  box12cCode: ["box12c", "12ccode", "codec"],
  box12cAmount: ["box12camount", "12camount", "amountc"],
  box12dCode: ["box12d", "12dcode", "coded"],
  box12dAmount: ["box12damount", "12damount", "amountd"],
  box13: ["box13", "statutoryemployee", "retirementplan", "thirdpartysickpay"],
  box14: ["box14", "other"],
  box15: ["box15", "state"],
  box16: ["box16", "statewages"],
  box17: ["box17", "stateincometax"],
  box18: ["box18", "localwages"],
  box19: ["box19", "localincometax"],
  box20: ["box20", "localname"],
} as const;

export const w3FieldAliases = {
  employerEin: ["ein", "employeridentificationnumber", "federalein"],
  employerName: ["employername", "name"],
  employerAddress: ["address", "citystatezip", "addressandzipcode"],
  kindOfPayer: ["kindofpayer", "941", "military", "944", "ct1", "hshold", "medicare", "noneapply"],
  kindOfEmployer: ["kindofemployer", "noneapply", "501c", "statelocal", "household", "medicaregovt", "thirdparty"],
  box1: ["box1", "wages", "tips", "othercompensation"],
  box2: ["box2", "federalincometaxwithheld"],
  box3: ["box3", "socialsecuritywages"],
  box4: ["box4", "socialsecuritytaxwithheld"],
  box5: ["box5", "medicarewagesandtips"],
  box6: ["box6", "medicaretaxwithheld"],
  box7: ["box7", "socialsecuritytips"],
  box8: ["box8", "allocatedtips"],
  box9: ["box9", "verificationcode"],
  box10: ["box10", "dependentcarebenefits"],
  box11: ["box11", "nonqualifiedplans"],
  box12a: ["box12a", "box12codea"],
  box12b: ["box12b", "box12codeb"],
  box12c: ["box12c", "box12codec"],
  box12d: ["box12d", "box12coded"],
  box13: ["box13", "statutoryemployee"],
  box14: ["box14", "other"],
  box15: ["box15", "state"],
  box16: ["box16", "statewages", "statewagestips"],
  box17: ["box17", "stateincometax"],
  box18: ["box18", "localwages"],
  box19: ["box19", "localincometax"],
  box20: ["box20", "localname"],
  totalForms: ["totalnumberofformsw2", "formsw2", "numberofforms", "totalw2"],
  contactName: ["contactperson", "contactname"],
  contactPhone: ["contacttelephonenumber", "contactphone", "phone"],
  email: ["emailaddress", "email"],
  establishmentNumber: ["establishmentnumber", "estno"],
  otherEIN: ["otherein", "othereinused"],
  boxj: ["boxj", "socialsecuritytips"],
  boxk: ["boxk", "allocatedtips"],
  boxl: ["boxl", "dependentcarebenefits"],
  boxm: ["boxm", "nonqualifiedplans"],
  boxn: ["boxn", "nontaxableelectcontributions"],
  boxo: ["boxo", "grouptermlifeinsurance"],
  boxp: ["boxp", "401kdeferrals"],
  boxq: ["boxq", "403bdeferrals"],
  boxr: ["boxr", "salaryreductioncontributions"],
  boxs: ["boxs", "408p1deferrals"],
  boxt: ["boxt", "401a11deferrals"],
  boxu: ["boxu", "408k6deferrals"],
  boxv: ["boxv", "402gdeferrals"],
  boxw: ["boxw", "414h2deferrals"],
  boxx: ["boxx", "stockoptions"],
  boxy: ["boxy", "stockoptionincome"],
  boxz: ["boxz", "deminimisbenefits"],
  boxaa: ["boxaa", "409adeferrals"],
  boxab: ["boxab", "409avdeferrals"],
  boxac: ["boxac", "grouptermlifeinsuranceover50k"],
  boxad: ["boxad", "socialsecuritytaxwages"],
  boxae: ["boxae", "medicaretaxwages"],
  boxaf: ["boxaf", "additionalmedicaretaxwages"],
  boxag: ["boxag", "additionalmedicaretaxwithheld"],
} as const;
