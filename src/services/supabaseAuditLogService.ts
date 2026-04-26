import { supabase } from '../lib/supabase';
import type { AuditLog, AuditAction, AuditEntityType } from '../app/featureTypes';

class AuditLogService {
  async logAction(
    companyId: string,
    userId: string,
    action: AuditAction,
    entityType: AuditEntityType,
    entityId: string | null = null,
    details: Record<string, any> = {},
    ipAddress: string | null = null
  ): Promise<void> {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        company_id: companyId,
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        ip_address: ipAddress,
      });

      if (error) {
        console.error('Failed to log audit action:', error);
      }
    } catch (error) {
      console.error('Error logging audit action:', error);
    }
  }

  async getAuditLogs(
    companyId: string,
    filters?: {
      userId?: string;
      action?: AuditAction;
      entityType?: AuditEntityType;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  async exportAuditLogsToCSV(companyId: string, filters?: any): Promise<string> {
    const logs = await this.getAuditLogs(companyId, filters);
    
    const headers = ['ID', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'Details', 'IP Address', 'Created At'];
    const rows = logs.map(log => [
      log.id,
      log.user_id,
      log.action,
      log.entity_type,
      log.entity_id || '',
      JSON.stringify(log.details),
      log.ip_address || '',
      log.created_at,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}

export const supabaseAuditLogService = new AuditLogService();
