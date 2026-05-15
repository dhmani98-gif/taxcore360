import { supabase } from '../lib/supabase';

export interface Vendor {
  company_id: string;
  vendor_id: string;
  legal_name: string;
  address: string;
  zip_code: string;
  email: string;
  phone: string;
  tax_id_type: 'SSN' | 'EIN';
  tax_id: string;
  entity_type: 'Individual' | 'Partnership' | 'Corporation' | 'LLC';
  state: string;
  category: 'Consulting' | 'Design' | 'Development' | 'Legal' | 'Marketing' | 'Operations';
  tin_verification: 'Unverified' | 'Verified' | 'Invalid';
  onboarding_source: string;
  w9_request_status: 'Not Requested' | 'Pending' | 'Completed' | 'Expired';
  created_at: string;
  updated_at: string;
}

export const supabaseVendorService = {
  // Get all vendors for a company
  getVendors: async (companyId: string): Promise<{ data: Vendor[]; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data as Vendor[], error: null };
    } catch (error) {
      return { data: [], error: (error as Error).message };
    }
  },

  // Get a single vendor by ID
  getVendorById: async (id: string): Promise<{ data: Vendor | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data: data as Vendor, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Create a new vendor
  createVendor: async (vendor: Omit<Vendor, 'created_at' | 'updated_at'>): Promise<{ data: Vendor | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert(vendor)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Vendor, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Update an existing vendor
  updateVendor: async (id: string, updates: Partial<Vendor>): Promise<{ data: Vendor | null; error: string | null }> => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data: data as Vendor, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  // Delete a vendor
  deleteVendor: async (id: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  },

  // Update TIN verification status
  updateTinVerification: async (id: string, status: Vendor['tin_verification_status']): Promise<{ data: Vendor | null; error: string | null }> => {
    return supabaseVendorService.updateVendor(id, { tin_verification_status: status });
  },

  // Update W-9 status
  updateW9Status: async (id: string, status: Vendor['w9_status']): Promise<{ data: Vendor | null; error: string | null }> => {
    return supabaseVendorService.updateVendor(id, { w9_status: status });
  },
};
