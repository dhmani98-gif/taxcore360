import type { EmployeeRow } from "../app/types";
import { employeeFormTemplate } from "../app/data";

export const employeeService = {
  createEmployee: (
    formData: any,
    currentEmployees: EmployeeRow[]
  ): EmployeeRow => {
    const nextId = currentEmployees.length > 0 ? Math.max(...currentEmployees.map((row) => row.id)) + 1 : 1;
    
    return {
      id: nextId,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      ssn: formData.ssn.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zipCode: formData.zipCode.trim(),
      department: formData.department.trim(),
      jobTitle: formData.jobTitle.trim(),
      hireDate: formData.hireDate,
      grossPay: Number(formData.grossPay),
      status: formData.status,
    };
  },

  validateEmployeeForm: (formData: any): string | null => {
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const grossPay = Number(formData.grossPay);

    if (!firstName || !lastName || Number.isNaN(grossPay) || grossPay <= 0) {
      return "Please complete all required fields with valid values.";
    }

    return null;
  },

  resetForm: () => employeeFormTemplate,

  handleFieldChange: (
    field: keyof typeof employeeFormTemplate,
    value: string,
    setForm: React.Dispatch<React.SetStateAction<typeof employeeFormTemplate>>
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  },

  handleCitySelectChange: (
    value: string,
    setForm: React.Dispatch<React.SetStateAction<typeof employeeFormTemplate>>
  ) => {
    if (!value) {
      setForm((prev) => ({ ...prev, city: "", state: "" }));
      return;
    }

    const [city, state] = value.split("|");
    setForm((prev) => ({ ...prev, city, state }));
  },
};
