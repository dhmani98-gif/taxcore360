import { supabase } from '../lib/supabase';
import type { VendorRating } from '../app/featureTypes';

class VendorRatingService {
  async createRating(
    companyId: string,
    vendorId: string,
    ratedBy: string,
    ratings: {
      qualityRating: number;
      timelinessRating: number;
      communicationRating: number;
      costRating: number;
    },
    comments?: string
  ): Promise<VendorRating | null> {
    try {
      const { data, error } = await supabase
        .from('vendor_ratings')
        .insert({
          company_id: companyId,
          vendor_id: vendorId,
          rated_by: ratedBy,
          quality_rating: ratings.qualityRating,
          timeliness_rating: ratings.timelinessRating,
          communication_rating: ratings.communicationRating,
          cost_rating: ratings.costRating,
          comments: comments || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create vendor rating:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating vendor rating:', error);
      return null;
    }
  }

  async getVendorRatings(vendorId: string, companyId: string): Promise<VendorRating[]> {
    try {
      const { data, error } = await supabase
        .from('vendor_ratings')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch vendor ratings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching vendor ratings:', error);
      return [];
    }
  }

  async getUserRatings(userId: string, companyId: string): Promise<VendorRating[]> {
    try {
      const { data, error } = await supabase
        .from('vendor_ratings')
        .select('*')
        .eq('rated_by', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch user ratings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      return [];
    }
  }

  async updateRating(ratingId: number, updates: Partial<VendorRating>): Promise<VendorRating | null> {
    try {
      const { data, error } = await supabase
        .from('vendor_ratings')
        .update(updates)
        .eq('id', ratingId)
        .select()
        .single();

      if (error) {
        console.error('Failed to update vendor rating:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating vendor rating:', error);
      return null;
    }
  }

  async deleteRating(ratingId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vendor_ratings')
        .delete()
        .eq('id', ratingId);

      if (error) {
        console.error('Failed to delete vendor rating:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting vendor rating:', error);
      return false;
    }
  }

  async getVendorAverageRating(vendorId: string): Promise<{ average: number; count: number } | null> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('average_rating, rating_count')
        .eq('vendor_id', vendorId)
        .single();

      if (error) {
        console.error('Failed to fetch vendor average rating:', error);
        return null;
      }

      return {
        average: data.average_rating || 0,
        count: data.rating_count || 0,
      };
    } catch (error) {
      console.error('Error fetching vendor average rating:', error);
      return null;
    }
  }

  async getTopRatedVendors(companyId: string, limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('vendor_id, legal_name, average_rating, rating_count')
        .eq('company_id', companyId)
        .gt('rating_count', 0)
        .order('average_rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch top rated vendors:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching top rated vendors:', error);
      return [];
    }
  }
}

export const supabaseVendorRatingService = new VendorRatingService();
