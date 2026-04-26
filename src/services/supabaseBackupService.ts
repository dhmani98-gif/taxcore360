import { supabase } from '../lib/supabase';
import type { Backup, BackupType } from '../app/featureTypes';

class BackupService {
  async createBackup(
    companyId: string,
    backupName: string,
    backupType: BackupType,
    createdBy: string,
    entityTypes: string[],
    dateRangeStart?: string,
    dateRangeEnd?: string
  ): Promise<Backup | null> {
    try {
      const { data, error } = await supabase
        .from('backups')
        .insert({
          company_id: companyId,
          backup_name: backupName,
          backup_type: backupType,
          entity_types: entityTypes,
          date_range_start: dateRangeStart || null,
          date_range_end: dateRangeEnd || null,
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create backup record:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating backup record:', error);
      return null;
    }
  }

  async getBackups(companyId: string): Promise<Backup[]> {
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch backups:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching backups:', error);
      return [];
    }
  }

  async updateBackupFileUrl(backupId: number, fileUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('backups')
        .update({ file_url: fileUrl })
        .eq('id', backupId);

      if (error) {
        console.error('Failed to update backup file URL:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating backup file URL:', error);
      return false;
    }
  }

  async deleteBackup(backupId: number): Promise<boolean> {
    try {
      // Get backup info first
      const { data: backup } = await supabase
        .from('backups')
        .select('file_url')
        .eq('id', backupId)
        .single();

      if (!backup) {
        return false;
      }

      // Delete from Storage if file exists
      if (backup.file_url) {
        const filePath = backup.file_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('backups')
            .remove([filePath]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('backups')
        .delete()
        .eq('id', backupId);

      if (error) {
        console.error('Failed to delete backup:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting backup:', error);
      return false;
    }
  }

  async exportDataToJson(
    companyId: string,
    entityTypes: string[],
    dateRangeStart?: string,
    dateRangeEnd?: string
  ): Promise<Record<string, any>> {
    const exportData: Record<string, any> = {};

    for (const entityType of entityTypes) {
      try {
        let query = supabase
          .from(entityType)
          .select('*')
          .eq('company_id', companyId);

        if (dateRangeStart) {
          query = query.gte('created_at', dateRangeStart);
        }

        if (dateRangeEnd) {
          query = query.lte('created_at', dateRangeEnd);
        }

        const { data, error } = await query;

        if (!error && data) {
          exportData[entityType] = data;
        }
      } catch (error) {
        console.error(`Error exporting ${entityType}:`, error);
      }
    }

    return exportData;
  }
}

export const supabaseBackupService = new BackupService();
