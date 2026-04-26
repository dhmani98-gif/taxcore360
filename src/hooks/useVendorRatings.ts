import { useState, useCallback } from 'react';
import { supabaseVendorRatingService } from '../services/supabaseVendorRatingService';
import type { VendorRating } from '../app/featureTypes';

export function useVendorRatings(companyId: string) {
  const [ratings, setRatings] = useState<VendorRating[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVendorRatings = useCallback(async (vendorId: string) => {
    setLoading(true);
    try {
      const data = await supabaseVendorRatingService.getVendorRatings(vendorId, companyId);
      setRatings(data);
    } catch (error) {
      console.error('Error fetching vendor ratings:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createRating = useCallback(async (
    vendorId: string,
    ratedBy: string,
    ratings: {
      qualityRating: number;
      timelinessRating: number;
      communicationRating: number;
      costRating: number;
    },
    comments?: string
  ) => {
    const newRating = await supabaseVendorRatingService.createRating(
      companyId,
      vendorId,
      ratedBy,
      ratings,
      comments
    );
    if (newRating) {
      setRatings(prev => [newRating, ...prev]);
    }
    return newRating;
  }, [companyId]);

  const updateRating = useCallback(async (ratingId: number, updates: Partial<VendorRating>) => {
    const updatedRating = await supabaseVendorRatingService.updateRating(ratingId, updates);
    if (updatedRating) {
      setRatings(prev => prev.map(r => r.id === ratingId ? updatedRating : r));
    }
    return updatedRating;
  }, []);

  const deleteRating = useCallback(async (ratingId: number) => {
    const success = await supabaseVendorRatingService.deleteRating(ratingId);
    if (success) {
      setRatings(prev => prev.filter(r => r.id !== ratingId));
    }
    return success;
  }, []);

  const getVendorAverage = useCallback(async (vendorId: string) => {
    return await supabaseVendorRatingService.getVendorAverageRating(vendorId);
  }, []);

  const getTopRated = useCallback(async (limit: number = 10) => {
    return await supabaseVendorRatingService.getTopRatedVendors(companyId, limit);
  }, [companyId]);

  return {
    ratings,
    loading,
    fetchVendorRatings,
    createRating,
    updateRating,
    deleteRating,
    getVendorAverage,
    getTopRated,
  };
}
