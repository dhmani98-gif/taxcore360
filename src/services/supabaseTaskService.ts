import { supabase } from '../lib/supabase';
import type { Task, TaskComment, TaskPriority, TaskStatus, TaskCategory } from '../app/featureTypes';

class TaskService {
  async createTask(
    companyId: string,
    task: Omit<Task, 'id' | 'company_id' | 'created_at' | 'updated_at'>
  ): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          company_id: companyId,
          ...task,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create task:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  async getTasks(
    companyId: string,
    filters?: {
      assignedTo?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      category?: TaskCategory;
    }
  ): Promise<Task[]> {
    try {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch tasks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<Task | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Failed to update task:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      return null;
    }
  }

  async deleteTask(taskId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Failed to delete task:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  async addComment(taskId: number, userId: string, comment: string): Promise<TaskComment | null> {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .insert({
          task_id: taskId,
          user_id: userId,
          comment,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to add comment:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  }

  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    try {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch task comments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching task comments:', error);
      return [];
    }
  }

  subscribeToTasks(companyId: string, callback: (task: Task) => void) {
    return supabase
      .channel(`tasks:${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          callback(payload.new as Task);
        }
      )
      .subscribe();
  }
}

export const supabaseTaskService = new TaskService();
