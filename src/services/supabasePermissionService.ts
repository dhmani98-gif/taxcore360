import { supabase } from '../lib/supabase';
import type { UserRoleAssignment, UserRole } from '../app/featureTypes';

class PermissionService {
  async assignRole(
    userId: string,
    companyId: string,
    role: UserRole,
    assignedBy: string
  ): Promise<UserRoleAssignment | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          company_id: companyId,
          role,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to assign role:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error assigning role:', error);
      return null;
    }
  }

  async getUserRoles(userId: string, companyId: string): Promise<UserRoleAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (error) {
        console.error('Failed to fetch user roles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  async getCompanyUsers(companyId: string): Promise<UserRoleAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('company_id', companyId);

      if (error) {
        console.error('Failed to fetch company users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching company users:', error);
      return [];
    }
  }

  async removeRole(userId: string, companyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('company_id', companyId);

      if (error) {
        console.error('Failed to remove role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  async hasPermission(
    userId: string,
    companyId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      // Get user's role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .single();

      if (!roles) {
        return false;
      }

      // Check permissions table
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .eq('role', roles.role)
        .eq('resource', resource)
        .single();

      if (error || !data) {
        return false;
      }

      // Check specific action permission
      switch (action) {
        case 'create':
          return data.can_create;
        case 'read':
          return data.can_read;
        case 'update':
          return data.can_update;
        case 'delete':
          return data.can_delete;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  async getAllPermissions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*');

      if (error) {
        console.error('Failed to fetch permissions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching permissions:', error);
      return [];
    }
  }
}

export const supabasePermissionService = new PermissionService();
