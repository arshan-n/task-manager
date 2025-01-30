import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, X, Play, Pause, RotateCcw, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

type Task = {
  id: string;
  title: string;
  description: string | null;
};

export function FocusPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  const TIMER_DURATIONS = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  };
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;
      
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description')
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error fetching task:', error);
        navigate('/');
        return;
      }

      setTask(data);
    };

    fetchTask();
  }, [taskId, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            setShowNotification(true);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Timer Complete!', {
                body: mode === 'focus' 
                  ? `Great job focusing on "${task?.title}"!`
                  : 'Break time is over!',
              });
            }
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, task?.title, mode]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(true);
  };

  const switchMode = (newMode: TimerMode) => {
    setTimeLeft(TIMER_DURATIONS[newMode]);
    setIsRunning(false);
    setShowNotification(false);
    setMode(newMode);
  };

  const handleReset = () => {
    switchMode(mode);
  };

  if (!task) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-950">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 right-6 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-3xl mx-auto pt-20 px-4">
        <div className="text-center space-y-8">
          <div>
            <Target className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Focus Mode</h2>
            <h3 className="text-xl font-medium text-white/90 mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-lg text-white/70">{task.description}</p>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => switchMode('focus')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === 'focus'
                  ? 'bg-green-500 text-white'
                  : 'text-white/70 hover:text-white bg-white/10 hover:bg-white/20'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === 'shortBreak'
                  ? 'bg-green-500 text-white'
                  : 'text-white/70 hover:text-white bg-white/10 hover:bg-white/20'
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => switchMode('longBreak')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === 'longBreak'
                  ? 'bg-blue-500 text-white'
                  : 'text-white/70 hover:text-white bg-white/10 hover:bg-white/20'
              }`}
            >
              Long Break
            </button>
          </div>

          <div className="flex justify-center items-center">
            <div className="text-center">
              <div className="text-8xl font-bold text-white font-mono mb-4">
                {formatTime(timeLeft)}
              </div>
              <div className="text-white/70 flex items-center justify-center text-lg">
                <Timer className="w-5 h-5 mr-2" />
                {mode === 'focus' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={isRunning ? () => setIsRunning(false) : handleStart}
              className="inline-flex items-center px-6 py-3 border-2 border-green-500 rounded-full text-lg font-medium text-white bg-green-500/20 hover:bg-green-500/30 focus:outline-none transition-colors"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-6 py-3 border-2 border-white/20 rounded-full text-lg font-medium text-white/90 hover:bg-white/10 focus:outline-none transition-colors"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </button>
          </div>

          {showNotification && (
            <div className="bg-green-500/20 border-2 border-green-500/50 p-6 rounded-2xl">
              <p className="text-white text-xl text-center">
                {mode === 'focus' 
                  ? 'Focus session complete! Take a break.'
                  : 'Break time is over! Ready to focus?'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}