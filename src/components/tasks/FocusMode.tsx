import React, { useState, useEffect } from 'react';
import { Timer, X, Play, Pause, RotateCcw, Target } from 'lucide-react';

type FocusModeProps = {
  task: {
    title: string;
    description: string | null;
  };
  onClose: () => void;
};

export function FocusMode({ task, onClose }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(25);
  const [showNotification, setShowNotification] = useState(false);

  const adjustTime = (type: 'hours' | 'minutes', amount: number) => {
    if (type === 'hours') {
      const newHours = hours + amount;
      if (newHours >= 0 && newHours <= 12) {
        setHours(newHours);
      }
    } else {
      const newMinutes = minutes + amount;
      if (newMinutes >= 0 && newMinutes <= 59) {
        setMinutes(newMinutes);
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsRunning(false);
            setShowNotification(true);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Focus Session Complete!', {
                body: `Focus session for "${task.title}" is complete!`,
              });
            }
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, task.title]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setTimeLeft((hours * 60 + minutes) * 60);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft((hours * 60 + minutes) * 60);
    setShowNotification(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-900 to-green-950 flex items-center justify-center z-50 overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-3xl relative z-10 px-4">
        <div className="text-center space-y-8">
          <div>
            <Target className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Focus Mode</h2>
            <h3 className="text-xl font-medium text-white/90 mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-lg text-white/70">{task.description}</p>
            )}
          </div>

          {!isRunning && (
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center">
                <div className="text-white/90 mb-2">Hours</div>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => adjustTime('hours', -1)}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={hours <= 0}
                  >
                    −
                  </button>
                  <div className="w-20 text-4xl font-bold text-white tabular-nums">
                    {hours.toString().padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => adjustTime('hours', 1)}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={hours >= 12}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-5xl font-bold text-white/50">:</div>

              <div className="text-center">
                <div className="text-white/90 mb-2">Minutes</div>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => adjustTime('minutes', -5)}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={minutes <= 0}
                  >
                    −
                  </button>
                  <div className="w-20 text-4xl font-bold text-white tabular-nums">
                    {minutes.toString().padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => adjustTime('minutes', 5)}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={minutes >= 55}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center items-center">
            <div className="text-center">
              {isRunning ? (
                <div className="text-8xl font-bold text-white font-mono mb-4 tabular-nums">
                  {formatTime(timeLeft)}
                </div>
              ) : (
                <div className="text-2xl text-white/70 mb-4">
                  {hours > 0 && `${hours} hour${hours > 1 ? 's' : ''} `}
                  {minutes > 0 && `${minutes} minute${minutes > 1 ? 's' : ''}`}
                </div>
              )}
              <div className="text-white/70 flex items-center justify-center text-lg">
                <Timer className="w-5 h-5 mr-2" />
                Focus Time
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={isRunning ? () => setIsRunning(false) : handleStart}
              className="inline-flex items-center px-8 py-4 border-2 border-green-500 rounded-full text-lg font-medium text-white bg-green-500/20 hover:bg-green-500/30 focus:outline-none transition-colors"
            >
              {isRunning ? (
                <>
                  <Pause className="w-6 h-6 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 mr-2" />
                  Start
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-8 py-4 border-2 border-white/20 rounded-full text-lg font-medium text-white/90 hover:bg-white/10 focus:outline-none transition-colors"
            >
              <RotateCcw className="w-6 h-6 mr-2" />
              Reset
            </button>
          </div>

          {showNotification && (
            <div className="bg-green-500/20 border-2 border-green-500/50 p-6 rounded-2xl">
              <p className="text-white text-xl text-center">
                Focus session complete! Great job!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
