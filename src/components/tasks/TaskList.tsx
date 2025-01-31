import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Check, Clock, Flag, Trash2, Edit2, Target, GripVertical } from 'lucide-react';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskForm } from './TaskForm';
import { TaskDetails } from './TaskDetails';

type TaskSubscription = ReturnType<typeof supabase.channel>;

type Task = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: number;
  completed: boolean;
  order: number;
};

type Filter = 'all' | 'active' | 'completed';

type TaskListProps = {
  onStatsUpdate?: (total: number, completed: number) => void;
};

export function TaskList({ onStatsUpdate }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<TaskSubscription | null>(null);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  );

  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found for subscription');
        return;
      }

      const channel = supabase
        .channel('tasks_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${user.id}`
          } as any,
          (payload) => {
            console.log('Real-time update:', payload);
            fetchTasks();
          }
        )
        .subscribe();

      console.log('Subscription set up successfully');
      setSubscription(channel);
    };

    setupSubscription();
    fetchTasks();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [onStatsUpdate]);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
      if (onStatsUpdate) {
        onStatsUpdate(
          data.length,
          data.filter(task => task.completed).length
        );
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id);

      if (error) throw error;
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);
    
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(oldIndex, 1);
    newTasks.splice(newIndex, 0, movedTask);
    
    // Update the order of tasks
    const updates = newTasks.map((task, index) => ({
      id: task.id,
      order: index,
    }));
    
    try {
      for (const update of updates) {
        await supabase
          .from('tasks')
          .update({ order: update.order })
          .eq('id', update.id);
      }
      
      setTasks(newTasks);
    } catch (error) {
      console.error('Error updating task order:', error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'text-red-500';
      case 2:
        return 'text-yellow-500';
      case 3:
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6 -mt-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-md ${
            filter === 'active'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-md ${
            filter === 'completed'
              ? 'bg-green-600 text-white shadow-sm'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No tasks found</div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTasks} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  onComplete={toggleComplete}
                  onSelect={setSelectedTask}
                  onEdit={setEditingTask}
                  onDelete={deleteTask}
                  onFocus={(task) => navigate(`/focus/${task.id}`)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {editingTask && (
        <TaskForm
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={fetchTasks}
        />
      )}
      
      {selectedTask && (
        <TaskDetails
          taskId={selectedTask.id}
          title={selectedTask.title}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

type SortableTaskItemProps = {
  task: Task;
  onComplete: (task: Task) => void;
  onSelect: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onFocus: (task: Task) => void;
};

function SortableTaskItem({ task, onComplete, onSelect, onEdit, onDelete, onFocus }: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'text-red-500';
      case 2:
        return 'text-yellow-500';
      case 3:
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`p-4 bg-white rounded-lg shadow-sm border ${
        task.completed ? 'border-green-200' : 'border-gray-200'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start">
        <div {...listeners} className="cursor-grab mr-2 text-gray-400">
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start space-x-3 min-w-0">
              <button
                onClick={() => onComplete(task)}
                className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  task.completed
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-300'
                }`}
              >
                {task.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <div className="min-w-0 flex-1">
                <h3
                  className={`font-medium ${
                    task.completed ? 'line-through text-gray-500' : ''
                  } truncate cursor-pointer hover:text-green-600`}
                  onClick={() => onSelect(task)}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {task.due_date && (
                    <div className="flex items-center text-sm text-gray-500 shrink-0">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  )}
                  <div
                    className={`flex items-center text-sm shrink-0 ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    {task.priority === 1
                      ? 'High'
                      : task.priority === 2
                      ? 'Medium'
                      : 'Low'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 sm:flex-shrink-0">
              <button
                onClick={() => onFocus(task)}
                className="p-1 text-gray-400 hover:text-green-600"
                title="Focus on this task"
              >
                <Target className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
