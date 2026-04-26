import { supabase } from '../lib/supabase';
import type { DashboardConfig, DashboardWidget } from '../app/featureTypes';

class DashboardService {
  async createConfig(
    companyId: string,
    userId: string,
    configName: string,
    widgets: DashboardWidget[],
    isDefault: boolean = false
  ): Promise<DashboardConfig | null> {
    try {
      const { data, error } = await supabase
        .from('dashboard_configs')
        .insert({
          company_id: companyId,
          user_id: userId,
          config_name: configName,
          widgets,
          is_default: isDefault,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create dashboard config:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating dashboard config:', error);
      return null;
    }
  }

  async getConfigs(userId: string, companyId: string): Promise<DashboardConfig[]> {
    try {
      const { data, error } = await supabase
        .from('dashboard_configs')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch dashboard configs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching dashboard configs:', error);
      return [];
    }
  }

  async getDefaultConfig(userId: string, companyId: string): Promise<DashboardConfig | null> {
    try {
      const { data, error } = await supabase
        .from('dashboard_configs')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .eq('is_default', true)
        .single();

      if (error) {
        console.error('Failed to fetch default dashboard config:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching default dashboard config:', error);
      return null;
    }
  }

  async updateConfig(configId: number, updates: Partial<DashboardConfig>): Promise<DashboardConfig | null> {
    try {
      const { data, error } = await supabase
        .from('dashboard_configs')
        .update(updates)
        .eq('id', configId)
        .select()
        .single();

      if (error) {
        console.error('Failed to update dashboard config:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating dashboard config:', error);
      return null;
    }
  }

  async deleteConfig(configId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('dashboard_configs')
        .delete()
        .eq('id', configId);

      if (error) {
        console.error('Failed to delete dashboard config:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting dashboard config:', error);
      return false;
    }
  }

  async setAsDefault(configId: number, userId: string, companyId: string): Promise<boolean> {
    try {
      // First, remove default from all configs for this user
      await supabase
        .from('dashboard_configs')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('company_id', companyId);

      // Then set the new default
      const { error } = await supabase
        .from('dashboard_configs')
        .update({ is_default: true })
        .eq('id', configId);

      if (error) {
        console.error('Failed to set dashboard config as default:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error setting dashboard config as default:', error);
      return false;
    }
  }
}

export const supabaseDashboardService = new DashboardService();
