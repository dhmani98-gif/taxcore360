import { supabase } from '../lib/supabase';

export interface Employee {
  id: number;
  company_id: string;
  first_name: string;
  last_name: string;
  ssn: string;
  department: string;
  job_title: string;
  hire_date: string;
  gross_pay: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const supabaseEmployeeService = {
  // Get all employees for a company
  getEmployees: async (companyId: string): Promise<{ data: Employee[]; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data as Employee[], error: null };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  },

  // Get a single employee by ID
  getEmployeeById: async (id: string): Promise<{ data: Employee | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as Employee, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Create a new employee
  createEmployee: async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Employee | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Employee, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Update an existing employee
  updateEmployee: async (id: string, updates: Partial<Employee>): Promise<{ data: Employee | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Employee, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Delete an employee
  deleteEmployee: async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Update employee status
  updateEmployeeStatus: async (id: string, status: Employee['status']): Promise<{ data: Employee | null; error: string | null }> => {
    return supabaseEmployeeService.updateEmployee(id, { status });
  },
};
