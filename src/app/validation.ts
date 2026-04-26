// Validation utilities for IRS forms

/**
 * Validates SSN format (XXX-XX-XXXX)
 */
export function validateSSN(ssn: string): boolean {
  const ssnPattern = /^\d{3}-\d{2}-\d{4}$/;
  return ssnPattern.test(ssn);
}

/**
 * Validates EIN format (XX-XXXXXXX)
 */
export function validateEIN(ein: string): boolean {
  const einPattern = /^\d{2}-\d{7}$/;
  return einPattern.test(ein);
}

/**
 * Formats SSN to XXX-XX-XXXX format
 */
export function formatSSN(ssn: string): string {
  const cleaned = ssn.replace(/\D/g, '');
  if (cleaned.length !== 9) return ssn;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
}

/**
 * Formats EIN to XX-XXXXXXX format
 */
export function formatEIN(ein: string): string {
  const cleaned = ein.replace(/\D/g, '');
  if (cleaned.length !== 9) return ein;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(3)}`;
}

/**
 * Validates state code (2 letters)
 */
export function validateStateCode(stateCode: string): boolean {
  const statePattern = /^[A-Z]{2}$/;
  return statePattern.test(stateCode);
}

/**
 * Validates amount format (positive number with 2 decimal places)
 */
export function validateAmount(amount: number): boolean {
  return amount >= 0 && Number.isFinite(amount);
}

/**
 * Formats amount to USD string with 2 decimal places
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Validates date format (YYYY-MM-DD)
 */
export function validateDate(dateString: string): boolean {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validates ZIP code (5 digits or 5+4 format)
 */
export function validateZipCode(zipCode: string): boolean {
  const zipPattern = /^\d{5}(-\d{4})?$/;
  return zipPattern.test(zipCode);
}

/**
 * Validates phone number (10 digits)
 */
export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Validates Social Security tax calculation (6.2%)
 */
export function validateSocialSecurityTax(wages: number, tax: number): boolean {
  const expectedTax = wages * 0.062;
  const tolerance = 0.01; // 1 cent tolerance
  return Math.abs(tax - expectedTax) <= tolerance;
}

/**
 * Validates Medicare tax calculation (1.45%)
 */
export function validateMedicareTax(wages: number, tax: number): boolean {
  const expectedTax = wages * 0.0145;
  const tolerance = 0.01; // 1 cent tolerance
  return Math.abs(tax - expectedTax) <= tolerance;
}

/**
 * Validates that Box 1 wages >= Box 3 wages (Social Security wages)
 */
export function validateWageConsistency(box1: number, box3: number): boolean {
  return box1 >= box3;
}

/**
 * Validates that Box 3 wages = Box 5 wages (Medicare wages)
 */
export function validateMedicareWageConsistency(box3: number, box5: number): boolean {
  return box3 === box5;
}
