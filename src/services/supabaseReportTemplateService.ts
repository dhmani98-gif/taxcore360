import { supabase } from '../lib/supabase';
import type { ReportTemplate, ReportTemplateCategory } from '../app/featureTypes';

class ReportTemplateService {
  async createTemplate(
    companyId: string,
    createdBy: string,
    template: Omit<ReportTemplate, 'id' | 'company_id' | 'created_by' | 'created_at' | 'updated_at'>
  ): Promise<ReportTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          company_id: companyId,
          created_by: createdBy,
          ...template,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create report template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating report template:', error);
      return null;
    }
  }

  async getTemplates(
    companyId: string,
    filters?: {
      category?: ReportTemplateCategory;
      createdBy?: string;
      isShared?: boolean;
    }
  ): Promise<ReportTemplate[]> {
    try {
      let query = supabase
        .from('report_templates')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.createdBy) {
        query = query.eq('created_by', filters.createdBy);
      }

      if (filters?.isShared !== undefined) {
        query = query.eq('is_shared', filters.isShared);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch report templates:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching report templates:', error);
      return [];
    }
  }

  async getTemplate(templateId: number): Promise<ReportTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error('Failed to fetch report template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching report template:', error);
      return null;
    }
  }

  async updateTemplate(templateId: number, updates: Partial<ReportTemplate>): Promise<ReportTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('report_templates')
        .update(updates)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        console.error('Failed to update report template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating report template:', error);
      return null;
    }
  }

  async deleteTemplate(templateId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('report_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Failed to delete report template:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting report template:', error);
      return false;
    }
  }

  async duplicateTemplate(templateId: number, newName: string, createdBy: string): Promise<ReportTemplate | null> {
    try {
      const original = await this.getTemplate(templateId);
      if (!original) return null;

      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          company_id: original.company_id,
          created_by: createdBy,
          name: newName,
          description: original.description,
          fields: original.fields,
          filters: original.filters,
          sorting: original.sorting,
          category: original.category,
          is_shared: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to duplicate report template:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error duplicating report template:', error);
      return null;
    }
  }
}

export const supabaseReportTemplateService = new ReportTemplateService();
