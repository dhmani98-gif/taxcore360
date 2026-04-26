import { supabase } from '../lib/supabase';

export interface PayrollPayment {
  id: string;
  company_id: string;
  employee_id: string;
  payroll_month: string;
  gross_pay: number;
  federal_tax: number;
  state_tax: number;
  social_security: number;
  medicare: number;
  net_pay: number;
  payment_method: 'Direct Deposit' | 'Check' | 'Wire';
  status: 'Pending' | 'Processed' | 'Paid';
  pay_date?: string;
  created_at: string;
  updated_at: string;
}

export const supabasePayrollService = {
  // Get all payroll payments for a company
  getPayrollPayments: async (companyId: string, payrollMonth?: string): Promise<{ data: PayrollPayment[]; error: string | null }> => {
    try {
      let query = supabase
        .from('payroll_payments')
        .select('*')
        .eq('company_id', companyId);

      if (payrollMonth) {
        query = query.eq('payroll_month', payrollMonth);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data as PayrollPayment[], error: null };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  },

  // Get payroll payments for a specific employee
  getPayrollByEmployee: async (employeeId: string): Promise<{ data: PayrollPayment[]; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('payroll_payments')
        .select('*')
        .eq('employee_id', employeeId)
        .order('payroll_month', { ascending: false });

      if (error) throw error;

      return { data: data as PayrollPayment[], error: null };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  },

  // Get a single payroll payment by ID
  getPayrollById: async (id: string): Promise<{ data: PayrollPayment | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('payroll_payments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as PayrollPayment, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Create a new payroll payment
  createPayrollPayment: async (payment: Omit<PayrollPayment, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: PayrollPayment | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('payroll_payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;

      return { data: data as PayrollPayment, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Update an existing payroll payment
  updatePayrollPayment: async (id: string, updates: Partial<PayrollPayment>): Promise<{ data: PayrollPayment | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('payroll_payments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as PayrollPayment, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Delete a payroll payment
  deletePayrollPayment: async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from('payroll_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Bulk update payroll status for a month
  updatePayrollMonthStatus: async (companyId: string, payrollMonth: string, status: PayrollPayment['status']): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from('payroll_payments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('company_id', companyId)
        .eq('payroll_month', payrollMonth);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Calculate payroll summary for a month
  getPayrollSummary: async (companyId: string, payrollMonth: string): Promise<{ summary: { totalGross: number; totalNet: number; totalEmployees: number }; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('payroll_payments')
        .select('gross_pay, net_pay')
        .eq('company_id', companyId)
        .eq('payroll_month', payrollMonth);

      if (error) throw error;

      const payments = data as PayrollPayment[];
      const totalGross = payments.reduce((sum, p) => sum + p.gross_pay, 0);
      const totalNet = payments.reduce((sum, p) => sum + p.net_pay, 0);

      return {
        summary: {
          totalGross,
          totalNet,
          totalEmployees: payments.length,
        },
        error: null,
      };
    } catch (error) {
      return { summary: { totalGross: 0, totalNet: 0, totalEmployees: 0 }, error: (error as Error).message };
    }
  },
};
