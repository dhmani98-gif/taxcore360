import { supabase } from '../lib/supabase';

export interface VendorPayment {
  id: string;
  company_id: string;
  vendor_id: string;
  payment_date: string;
  invoice_number: string;
  amount: number;
  payment_state: string;
  invoice_document_url?: string;
  ocr_text?: string;
  created_at: string;
  updated_at: string;
}

export const supabasePaymentService = {
  // Get all payments for a company
  getPayments: async (companyId: string): Promise<{ data: VendorPayment[]; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('vendor_payments')
        .select('*')
        .eq('company_id', companyId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      return { data: data as VendorPayment[], error: null };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  },

  // Get payments for a specific vendor
  getPaymentsByVendor: async (vendorId: string): Promise<{ data: VendorPayment[]; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('vendor_payments')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('payment_date', { ascending: false });

      if (error) throw error;

      return { data: data as VendorPayment[], error: null };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  },

  // Get a single payment by ID
  getPaymentById: async (id: string): Promise<{ data: VendorPayment | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('vendor_payments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as VendorPayment, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Create a new payment
  createPayment: async (payment: Omit<VendorPayment, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: VendorPayment | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('vendor_payments')
        .insert(payment)
        .select()
        .single();

      if (error) throw error;

      return { data: data as VendorPayment, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Update an existing payment
  updatePayment: async (id: string, updates: Partial<VendorPayment>): Promise<{ data: VendorPayment | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('vendor_payments')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as VendorPayment, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Delete a payment
  deletePayment: async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from('vendor_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Update payment state
  updatePaymentState: async (id: string, state: string): Promise<{ data: VendorPayment | null; error: string | null }> => {
    return supabasePaymentService.updatePayment(id, { payment_state: state });
  },

  // Upload invoice document (placeholder - would need storage integration)
  uploadInvoiceDocument: async (_file: File): Promise<{ url: string | null; error: string | null }> => {
    // This would integrate with Supabase Storage
    // For now, return a placeholder
    return { url: null, error: 'Storage integration not yet implemented' };
  },
};
