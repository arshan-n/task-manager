import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Plus, Check, Trash2 } from 'lucide-react';

type TaskDetailsProps = {
  taskId: string;
  title: string;
  onClose: () => void;
};

type ChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
  order: number;
};

export function TaskDetails({ taskId, title, onClose }: TaskDetailsProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChecklistItems();
  }, [taskId]);

  const fetchChecklistItems = async () => {
    try {
      const { data, error } = await supabase
        .from('task_checklists')
        .select('*')
        .eq('task_id', taskId)
        .order('order');
      
      if (error) throw error;
      setChecklistItems(data || []);
    } catch (error) {
      console.error('Error fetching checklist items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    try {
      const { error } = await supabase.from('task_checklists').insert([
        {
          task_id: taskId,
          title: newItemText,
          order: checklistItems.length,
        },
      ]);

      if (error) throw error;
      setNewItemText('');
      await fetchChecklistItems();
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const toggleChecklistItem = async (item: ChecklistItem) => {
    try {
      const { error } = await supabase
        .from('task_checklists')
        .update({ completed: !item.completed })
        .eq('id', item.id);

      if (error) throw error;
      await fetchChecklistItems();
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  const deleteChecklistItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('task_checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchChecklistItems();
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <form onSubmit={addChecklistItem} className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add a new checklist item..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-2">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleChecklistItem(item)}
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        item.completed
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {item.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span
                      className={`flex-1 ${
                        item.completed ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteChecklistItem(item.id)}
                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {!loading && checklistItems.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No checklist items yet. Add one above!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
