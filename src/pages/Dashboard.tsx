import React, { useState } from 'react';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';
import { LogOut, Plus, LayoutDashboard, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

  const updateStats = (total: number, completed: number) => {
    setStats({
      total,
      completed,
      pending: total - completed
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-green-700">
              Task Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewTaskForm(true)}
              className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-4 py-2.5 border border-green-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <LayoutDashboard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <TaskList onStatsUpdate={updateStats} />
        </div>

        {showNewTaskForm && (
          <TaskForm
            onClose={() => setShowNewTaskForm(false)}
            onSave={() => setShowNewTaskForm(false)}
          />
        )}
      </div>
    </div>
  );
}