import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle2, Clock, ListTodo, Plus, TrendingUp, AlertCircle } from 'lucide-react';

const StatCard = ({ icon, label, value, colorClass, bgClass }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in`}>
    <div className={`p-4 rounded-xl ${bgClass} ${colorClass} flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-4xl font-extrabold text-slate-900 mt-0.5">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        const tasks = res.data;
        setStats({
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          pending: tasks.filter(t => t.status === 'pending').length,
        });
      } catch (err) {
        setError('Failed to load dashboard data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-purple-600">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's your task overview for today.</p>
        </div>
        <Link
          to="/add-task"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-sm shadow-purple-200 transition-all text-sm"
        >
          <Plus size={18} />
          New Task
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          icon={<ListTodo size={26} />}
          label="Total Tasks"
          value={stats.total}
          colorClass="text-purple-600"
          bgClass="bg-purple-50"
        />
        <StatCard
          icon={<CheckCircle2 size={26} />}
          label="Completed"
          value={stats.completed}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <StatCard
          icon={<Clock size={26} />}
          label="Pending"
          value={stats.pending}
          colorClass="text-amber-600"
          bgClass="bg-amber-50"
        />
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <TrendingUp size={18} className="text-purple-600" />
              Overall Progress
            </div>
            <span className="text-sm font-bold text-purple-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{stats.completed} of {stats.total} tasks completed</p>
        </div>
      )}

      {/* CTA Card */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg shadow-purple-200 animate-fade-in">
        <h3 className="text-xl font-bold mb-1">Ready to get productive?</h3>
        <p className="text-purple-100 text-sm mb-5">Add tasks, set priorities, and crush your goals today.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/add-task" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 font-semibold rounded-xl text-sm hover:bg-purple-50 transition-colors shadow-sm">
            <Plus size={16} /> Create Task
          </Link>
          <Link to="/tasks" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500/40 text-white font-semibold rounded-xl text-sm hover:bg-purple-500/60 transition-colors">
            <ListTodo size={16} /> View All Tasks
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
