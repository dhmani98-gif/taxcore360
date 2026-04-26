import { useState, useEffect, useCallback } from 'react';
import { supabaseTaskService } from '../services/supabaseTaskService';
import type { Task, TaskComment, TaskPriority, TaskStatus, TaskCategory } from '../app/featureTypes';

export function useTasks(companyId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async (filters?: {
    assignedTo?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
  }) => {
    setLoading(true);
    try {
      const data = await supabaseTaskService.getTasks(companyId, filters);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createTask = useCallback(async (task: Omit<Task, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => {
    const newTask = await supabaseTaskService.createTask(companyId, task);
    if (newTask) {
      setTasks(prev => [newTask, ...prev]);
    }
    return newTask;
  }, [companyId]);

  const updateTask = useCallback(async (taskId: number, updates: Partial<Task>) => {
    const updatedTask = await supabaseTaskService.updateTask(taskId, updates);
    if (updatedTask) {
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
    }
    return updatedTask;
  }, []);

  const deleteTask = useCallback(async (taskId: number) => {
    const success = await supabaseTaskService.deleteTask(taskId);
    if (success) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
    return success;
  }, []);

  useEffect(() => {
    fetchTasks();

    // Subscribe to real-time task updates
    const subscription = supabaseTaskService.subscribeToTasks(companyId, (updatedTask) => {
      setTasks(prev => {
        const index = prev.findIndex(t => t.id === updatedTask.id);
        if (index >= 0) {
          const newTasks = [...prev];
          newTasks[index] = updatedTask;
          return newTasks;
        }
        return [updatedTask, ...prev];
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [companyId, fetchTasks]);

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

export function useTaskComments(taskId: number) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await supabaseTaskService.getTaskComments(taskId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching task comments:', error);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  const addComment = useCallback(async (userId: string, comment: string) => {
    const newComment = await supabaseTaskService.addComment(taskId, userId, comment);
    if (newComment) {
      setComments(prev => [...prev, newComment]);
    }
    return newComment;
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [taskId, fetchComments]);

  return {
    comments,
    loading,
    fetchComments,
    addComment,
  };
}
