import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { FocusMode } from '../components/tasks/FocusMode';
import { supabase } from '../lib/supabase';

type Task = {
  id: string;
  title: string;
  description: string | null;
};

export function FocusPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) {
        navigate('/');
        return;
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description')
        .eq('id', taskId)
        .single();

      if (error || !data) {
        console.error('Error fetching task:', error);
        navigate('/');
        return;
      }

      setTask(data);
    };

    fetchTask();
  }, [taskId, navigate]);

  if (!task) {
    return null;
  }

  return (
    <FocusMode 
      task={task} 
      onClose={() => navigate('/')} 
    />
  );
}
