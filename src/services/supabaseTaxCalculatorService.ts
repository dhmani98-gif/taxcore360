import { supabase } from '../lib/supabase';
import type { TaxCalculation, TaxCalculationType, StateTaxRate } from '../app/featureTypes';

class TaxCalculatorService {
  async saveCalculation(
    companyId: string,
    userId: string,
    calculationType: TaxCalculationType,
    inputData: Record<string, any>,
    resultData: Record<string, any>,
    year?: string,
    state?: string
  ): Promise<TaxCalculation | null> {
    try {
      const { data, error } = await supabase
        .from('tax_calculations')
        .insert({
          company_id: companyId,
          user_id: userId,
          calculation_type: calculationType,
          year: year || null,
          state: state || null,
          input_data: inputData,
          result_data: resultData,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to save tax calculation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving tax calculation:', error);
      return null;
    }
  }

  async getCalculations(
    companyId: string,
    userId: string,
    filters?: {
      calculationType?: TaxCalculationType;
      year?: string;
      state?: string;
    }
  ): Promise<TaxCalculation[]> {
    try {
      let query = supabase
        .from('tax_calculations')
        .select('*')
        .eq('company_id', companyId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.calculationType) {
        query = query.eq('calculation_type', filters.calculationType);
      }

      if (filters?.year) {
        query = query.eq('year', filters.year);
      }

      if (filters?.state) {
        query = query.eq('state', filters.state);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch tax calculations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching tax calculations:', error);
      return [];
    }
  }

  async calculateFUTA(wages: number): Promise<number> {
    // FUTA rate is 6.0% on first $7,000 of wages
    const wageBase = 7000;
    const taxableWages = Math.min(wages, wageBase);
    const rate = 0.06;
    return taxableWages * rate;
  }

  async calculateSUTA(wages: number, state: string): Promise<{ tax: number; wageBase: number; rate: number }> {
    try {
      const { data, error } = await supabase
        .from('state_tax_rates')
        .select('*')
        .eq('state', state)
        .eq('tax_type', 'unemployment')
        .single();

      if (error || !data) {
        // Default values if not found
        return {
          tax: wages * 0.054, // Default 5.4%
          wageBase: 10000,
          rate: 0.054,
        };
      }

      const taxableWages = data.wage_base ? Math.min(wages, data.wage_base) : wages;
      const tax = taxableWages * data.rate;

      return {
        tax,
        wageBase: data.wage_base || 0,
        rate: data.rate,
      };
    } catch (error) {
      console.error('Error calculating SUTA:', error);
      return {
        tax: wages * 0.054,
        wageBase: 10000,
        rate: 0.054,
      };
    }
  }

  async calculateWithholding(
    wages: number,
    filingStatus: 'single' | 'married',
    allowances: number = 0
  ): Promise<number> {
    // Simplified federal withholding calculation
    // In production, use IRS withholding tables or API
    const standardDeduction = filingStatus === 'single' ? 12950 : 25900;
    const taxableIncome = Math.max(0, wages - standardDeduction - (allowances * 4400));

    // 2024 tax brackets (simplified)
    if (taxableIncome <= 11000) {
      return taxableIncome * 0.10;
    } else if (taxableIncome <= 44725) {
      return 1100 + (taxableIncome - 11000) * 0.12;
    } else if (taxableIncome <= 95375) {
      return 5147 + (taxableIncome - 44725) * 0.22;
    } else if (taxableIncome <= 182050) {
      return 16290 + (taxableIncome - 95375) * 0.24;
    } else if (taxableIncome <= 231250) {
      return 37104 + (taxableIncome - 182050) * 0.32;
    } else if (taxableIncome <= 578125) {
      return 52852 + (taxableIncome - 231250) * 0.35;
    } else {
      return 174238.25 + (taxableIncome - 578125) * 0.37;
    }
  }

  async getStateTaxRate(state: string, taxType: 'income' | 'unemployment' | 'disability'): Promise<StateTaxRate | null> {
    try {
      const { data, error } = await supabase
        .from('state_tax_rates')
        .select('*')
        .eq('state', state)
        .eq('tax_type', taxType)
        .single();

      if (error) {
        console.error('Failed to fetch state tax rate:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching state tax rate:', error);
      return null;
    }
  }

  async getAllStateTaxRates(): Promise<StateTaxRate[]> {
    try {
      const { data, error } = await supabase
        .from('state_tax_rates')
        .select('*')
        .order('state');

      if (error) {
        console.error('Failed to fetch state tax rates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching state tax rates:', error);
      return [];
    }
  }

  async projectTaxLiability(
    companyId: string,
    year: string,
    projectedWages: number
  ): Promise<Record<string, number>> {
    const futaTax = await this.calculateFUTA(projectedWages);
    const sutarResult = await this.calculateSUTA(projectedWages, 'CA'); // Default to CA
    const federalWithholding = await this.calculateWithholding(projectedWages, 'single', 0);

    return {
      futa: futaTax,
      suta: sutarResult.tax,
      federalWithholding,
      total: futaTax + sutarResult.tax + federalWithholding,
    };
  }
}

export const supabaseTaxCalculatorService = new TaxCalculatorService();
