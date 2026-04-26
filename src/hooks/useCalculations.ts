import { useMemo } from "react";
import type { EmployeeRow, VendorRow, VendorPaymentRow, PayrollRow, W2SummaryRow } from "../app/types";
import { 
  toUsd, 
  daysUntil, 
  getNextForm941DueDate, 
  getMonthRange,
  vendorNeeds1099,
  buildSmoothSvgPath
} from "../app/utils";
import { executiveChartPalette } from "../app/data";

export const useCalculations = (
  employees: EmployeeRow[],
  vendors: VendorRow[],
  vendorPayments: VendorPaymentRow[],
  selectedPayrollMonth: string,
  selected1099Year: string,
  selectedW2Year: string,
  selectedW2EmployeeId: number,
  payrollMonthOptions: string[],
  activeCompanyId: string
) => {
  // Employee calculations
  const activeEmployees = useMemo(() => 
    employees.filter((employee) => employee.status === "Active"), 
    [employees]
  );

  const totalGrossPayroll = useMemo(() => 
    employees.reduce((sum, employee) => sum + employee.grossPay, 0), 
    [employees]
  );

  const executiveTotals = useMemo(() => {
    const gross = activeEmployees.reduce((sum, employee) => sum + employee.grossPay, 0);
    const taxes = gross * (0.12 + 0.062 + 0.0145 + 0.04);
    const benefits = gross * 0.03;
    const net = gross - taxes - benefits;

    return { gross, taxes, benefits, net };
  }, [activeEmployees]);

  const executiveDepartmentRows = useMemo(() => {
    const totals = new Map<string, { department: string; employees: number; gross: number; employerTaxes: number }>();

    activeEmployees.forEach((employee) => {
      const current = totals.get(employee.department) ?? { 
        department: employee.department, 
        employees: 0, 
        gross: 0, 
        employerTaxes: 0 
      };
      current.employees += 1;
      current.gross += employee.grossPay;
      current.employerTaxes += employee.grossPay * 0.0765;
      totals.set(employee.department, current);
    });

    return Array.from(totals.values()).sort((left, right) => right.gross - left.gross);
  }, [activeEmployees]);

  // Payroll calculations
  const payrollMonthMeta = useMemo(() => getMonthRange(selectedPayrollMonth), [selectedPayrollMonth]);

  const payrollTableRows = useMemo<PayrollRow[]>(() => {
    return activeEmployees.map((row) => {
      const federalWithholdingAmount = row.grossPay * 0.12;
      const socialSecurityAmount = row.grossPay * 0.062;
      const medicareAmount = row.grossPay * 0.0145;
      const stateTaxAmount = row.grossPay * 0.04;
      const pretaxDeductionsAmount = row.grossPay * 0.03;
      const netPayAmount =
        row.grossPay - federalWithholdingAmount - socialSecurityAmount - medicareAmount - stateTaxAmount - pretaxDeductionsAmount;

      return {
        id: row.id,
        employee: row.fullName,
        department: row.department,
        payPeriod: payrollMonthMeta.payPeriod,
        grossPay: toUsd(row.grossPay),
        federalWithholding: toUsd(federalWithholdingAmount),
        socialSecurity: toUsd(socialSecurityAmount),
        medicare: toUsd(medicareAmount),
        stateTax: toUsd(stateTaxAmount),
        pretaxDeductions: toUsd(pretaxDeductionsAmount),
        netPay: toUsd(netPayAmount),
      };
    });
  }, [activeEmployees, payrollMonthMeta.payPeriod]);

  const payrollTotals = useMemo(
    () =>
      payrollTableRows.reduce(
        (acc, row) => {
          const gross = Number(row.grossPay.replace(/[$,]/g, ""));
          const federal = Number(row.federalWithholding.replace(/[$,]/g, ""));
          const social = Number(row.socialSecurity.replace(/[$,]/g, ""));
          const medicare = Number(row.medicare.replace(/[$,]/g, ""));
          const state = Number(row.stateTax.replace(/[$,]/g, ""));
          const pretax = Number(row.pretaxDeductions.replace(/[$,]/g, ""));
          const net = Number(row.netPay.replace(/[$,]/g, ""));

          return {
            gross: acc.gross + gross,
            taxes: acc.taxes + federal + social + medicare + state,
            benefits: acc.benefits + pretax,
            net: acc.net + net,
          };
        },
        { gross: 0, taxes: 0, benefits: 0, net: 0 },
      ),
    [payrollTableRows],
  );

  // Vendor calculations
  const scopedVendors = useMemo(
    () => vendors.filter((vendor) => !vendor.companyId || vendor.companyId === activeCompanyId),
    [activeCompanyId, vendors],
  );

  const scopedVendorPayments = useMemo(
    () => vendorPayments.filter((payment) => !payment.companyId || payment.companyId === activeCompanyId),
    [activeCompanyId, vendorPayments],
  );

  const portalYearPayments = useMemo(
    () => scopedVendorPayments.filter((payment) => payment.year === selected1099Year),
    [scopedVendorPayments, selected1099Year],
  );

  const vendorDashboardRows = useMemo(
    () =>
      scopedVendors.map((vendor) => {
        const totalPaid = portalYearPayments
          .filter((payment) => payment.vendorId === vendor.vendorId)
          .reduce((sum, payment) => sum + payment.amount, 0);
        const is1099Eligible = vendorNeeds1099(vendor.entityType);
        const filingStatus = is1099Eligible && totalPaid >= 600 ? "MUST FILE" : "OK";
        const thresholdProgress = Math.min(totalPaid / 600, 1);
        const thresholdRemaining = Math.max(600 - totalPaid, 0);

        return {
          ...vendor,
          totalPaid,
          is1099Eligible,
          filingStatus,
          thresholdProgress,
          thresholdRemaining,
        };
      }),
    [scopedVendors, portalYearPayments],
  );

  // W2 calculations
  const w2YearOptions = useMemo(() => {
    const years = Array.from(new Set(payrollMonthOptions.map((month) => month.split("-")[0])));
    return years.sort((a, b) => Number(b) - Number(a));
  }, [payrollMonthOptions]);

  const monthsForSelectedW2Year = useMemo(
    () => payrollMonthOptions.filter((month) => month.startsWith(`${selectedW2Year}-`)),
    [selectedW2Year, payrollMonthOptions],
  );

  const w2SummaryRows = useMemo<W2SummaryRow[]>(() => {
    return employees.map((employee) => {
      const paidMonthCount = monthsForSelectedW2Year.length; // Simplified for now
      
      const wages = employee.grossPay * paidMonthCount;
      const federalIncomeTax = wages * 0.12;
      const socialSecurityTax = wages * 0.062;
      const medicareTax = wages * 0.0145;
      const stateWages = wages * 0.97;
      const stateIncomeTax = stateWages * 0.04;

      return {
        id: employee.id,
        employee: employee.fullName,
        department: employee.department,
        employeeStatus: employee.status,
        paidMonthCount,
        wages,
        federalIncomeTax,
        socialSecurityTax,
        medicareTax,
        stateWages,
        stateIncomeTax,
        filingStatus: paidMonthCount > 0 ? "Ready" : "Estimated",
      };
    });
  }, [employees, monthsForSelectedW2Year]);

  const selectedW2Employee = useMemo(
    () => employees.find((row) => row.id === selectedW2EmployeeId) ?? null,
    [employees, selectedW2EmployeeId],
  );

  // Deadline calculations
  const daysLeftToFile1099 = daysUntil(new Date(Number(selected1099Year) + 1, 0, 31));
  const form941CountdownDays = daysUntil(getNextForm941DueDate());

  // Chart calculations
  const executiveDepartmentShareRows = useMemo(() => {
    const totalGross = executiveTotals.gross || 1;

    return executiveDepartmentRows.map((row, index) => ({
      ...row,
      color: executiveChartPalette[index % executiveChartPalette.length],
      share: row.gross / totalGross,
    }));
  }, [executiveDepartmentRows, executiveTotals.gross]);

  const executiveMonthlyPaidTrend = useMemo(() => {
    return payrollMonthOptions.map((month) => {
      const paidGross = activeEmployees.reduce((sum, employee) => sum + employee.grossPay, 0);

      return {
        month,
        label: getMonthRange(month).label.slice(0, 3),
        paidGross,
        paidCount: activeEmployees.length,
      };
    });
  }, [activeEmployees, payrollMonthOptions]);

  const executiveTrendChart = useMemo(() => {
    const chartWidth = 620;
    const chartHeight = 224;
    const topPadding = 18;
    const bottomPadding = 36;
    const leftPadding = 24;
    const rightPadding = 24;
    const paidValues = executiveMonthlyPaidTrend.map((row) => row.paidGross);
    const maxPaid = Math.max(...paidValues, 1);
    const pointSpacing =
      executiveMonthlyPaidTrend.length > 1
        ? (chartWidth - leftPadding - rightPadding) / (executiveMonthlyPaidTrend.length - 1)
        : 0;

    const points = executiveMonthlyPaidTrend.map((row, index) => {
      const normalizedValue = row.paidGross / maxPaid;
      return {
        ...row,
        x: leftPadding + index * pointSpacing,
        y: topPadding + (1 - normalizedValue) * (chartHeight - topPadding - bottomPadding),
      };
    });

    const linePath = buildSmoothSvgPath(points.map((point) => ({ x: point.x, y: point.y })));
    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - bottomPadding} L ${points[0].x} ${chartHeight - bottomPadding} Z`
        : "";

    const yTicks = [1, 0.66, 0.33, 0].map((ratio) => ({
      y: topPadding + (1 - ratio) * (chartHeight - topPadding - bottomPadding),
      value: maxPaid * ratio,
    }));

    return {
      chartWidth,
      chartHeight,
      topPadding,
      bottomPadding,
      leftPadding,
      rightPadding,
      points,
      linePath,
      areaPath,
      yTicks,
      maxPaid,
    };
  }, [executiveMonthlyPaidTrend]);

  return {
    // Employee calculations
    activeEmployees,
    totalGrossPayroll,
    executiveTotals,
    executiveDepartmentRows,
    executiveDepartmentShareRows,
    executiveMonthlyPaidTrend,
    executiveTrendChart,

    // Payroll calculations
    payrollMonthMeta,
    payrollTableRows,
    payrollTotals,

    // Vendor calculations
    scopedVendors,
    scopedVendorPayments,
    portalYearPayments,
    vendorDashboardRows,

    // W2 calculations
    w2YearOptions,
    monthsForSelectedW2Year,
    w2SummaryRows,
    selectedW2Employee,

    // Deadlines
    daysLeftToFile1099,
    form941CountdownDays,
  };
};
