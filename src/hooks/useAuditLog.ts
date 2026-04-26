import { useCallback } from 'react';
import { supabaseAuditLogService } from '../services/supabaseAuditLogService';
import type { AuditAction, AuditEntityType } from '../app/featureTypes';

export function useAuditLog() {
  const logAction = useCallback(
    async (
      companyId: string,
      userId: string,
      action: AuditAction,
      entityType: AuditEntityType,
      entityId: string | null = null,
      details: Record<string, any> = {}
    ) => {
      await supabaseAuditLogService.logAction(
        companyId,
        userId,
        action,
        entityType,
        entityId,
        details
      );
    },
    []
  );

  const logCreate = useCallback(
    async (companyId: string, userId: string, entityType: AuditEntityType, entityId: string, data: Record<string, any>) => {
      await logAction(companyId, userId, 'create', entityType, entityId, data);
    },
    [logAction]
  );

  const logUpdate = useCallback(
    async (companyId: string, userId: string, entityType: AuditEntityType, entityId: string, changes: Record<string, any>) => {
      await logAction(companyId, userId, 'update', entityType, entityId, changes);
    },
    [logAction]
  );

  const logDelete = useCallback(
    async (companyId: string, userId: string, entityType: AuditEntityType, entityId: string, deletedData: Record<string, any>) => {
      await logAction(companyId, userId, 'delete', entityType, entityId, deletedData);
    },
    [logAction]
  );

  const logExport = useCallback(
    async (companyId: string, userId: string, entityType: AuditEntityType, filters: Record<string, any>) => {
      await logAction(companyId, userId, 'export', entityType, null, filters);
    },
    [logAction]
  );

  const logImport = useCallback(
    async (companyId: string, userId: string, entityType: AuditEntityType, recordCount: number) => {
      await logAction(companyId, userId, 'import', entityType, null, { recordCount });
    },
    [logAction]
  );

  const logLogin = useCallback(
    async (companyId: string, userId: string, ipAddress?: string) => {
      await logAction(companyId, userId, 'login', 'user', userId, { ipAddress });
    },
    [logAction]
  );

  const logLogout = useCallback(
    async (companyId: string, userId: string) => {
      await logAction(companyId, userId, 'logout', 'user', userId);
    },
    [logAction]
  );

  return {
    logAction,
    logCreate,
    logUpdate,
    logDelete,
    logExport,
    logImport,
    logLogin,
    logLogout,
  };
}
