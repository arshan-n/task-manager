import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: number;
};

type TaskFormProps = {
  task?: Task;
  onClose: () => void;
  onSave: () => void;
};

export function TaskForm({ task, onClose, onSave }: TaskFormProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [priority, setPriority] = useState(task?.priority || 2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!title.trim()) {
      errors.push('Title is required');
    }
    
    if (!description.trim()) {
      errors.push('Description is required');
    }
    
    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const now = new Date(); // Keep hours, minutes for more precise comparison
      
      if (selectedDate < now) {
        errors.push('Due date cannot be in the past');
      }
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      if (task) {
        const { data, error } = await supabase
          .from('tasks')
          .update({
            title,
            description,
            due_date: dueDate || null,
            priority,
          })
          .eq('id', task.id)
          .select()
          .single();

        if (error) throw error;
        onSave();
      } else {
        if (!userId) throw new Error('User not authenticated');

        const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: userId,
            title,
            description,
            due_date: dueDate || null,
            priority,
          },
        ])
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        });

        if (error) throw error;
        onSave();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
              placeholder="Add any additional details..."
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="datetime-local"
              value={dueDate}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm"
            >
              <option value={1}>High</option>
              <option value={2}>Medium</option>
              <option value={3}>Low</option>
            </select>
          </div>

          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              {validationErrors.map((error, index) => (
                <div key={index} className="flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
