import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Edit2, Trash2, CheckCircle2, Circle, AlertTriangle, Calendar, Clock, Plus, SlidersHorizontal, Inbox } from 'lucide-react';
import TaskReport from '../components/TaskReport';
import { AuthContext } from '../context/AuthContext';

const PRIORITY_STYLES = {
  high:   { badge: 'bg-red-50 text-red-600 border-red-200',    dot: 'bg-red-500' },
  medium: { badge: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-500' },
  low:    { badge: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
};

const TaskList = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Filter tasks by date range on the frontend
  const filteredTasks = tasks.filter(task => {
    if (!fromDate && !toDate) return true;
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (due < from) return false;
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (due > to) return false;
    }
    return true;
  });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/tasks?sort=${sortOption}`;
      if (statusFilter)  url += `&status=${statusFilter}`;
      if (priorityFilter) url += `&priority=${priorityFilter}`;
      const res = await api.get(url);
      setTasks(res.data);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, sortOption]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    // Optimistic update
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
    } catch {
      fetchTasks(); // Revert on failure
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task permanently?')) return;
    setTasks(prev => prev.filter(t => t._id !== id));
    try {
      await api.delete(`/tasks/${id}`);
    } catch {
      fetchTasks();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const today = new Date();
    const isOverdue = d < today && d.toDateString() !== today.toDateString();
    return { text: d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }), overdue: isOverdue };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link
          to="/add-task"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-sm shadow-purple-200 transition-all text-sm"
        >
          <Plus size={16} /> Add Task
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <SlidersHorizontal size={16} className="text-slate-400 hidden sm:block" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 min-w-[130px] px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="pending">⏳ Pending</option>
          <option value="completed">✅ Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="high">🔴 High Priority</option>
          <option value="medium">🟡 Medium Priority</option>
          <option value="low">🟢 Low Priority</option>
        </select>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
        >
          <option value="createdAt">↕ Latest First</option>
          <option value="dueDate">📅 Due Date</option>
        </select>
        {/* Date Range Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-semibold text-slate-500">From:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setToDate(''); }}
            max={new Date().toISOString().split('T')[0]}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
          />
          <label className="text-xs font-semibold text-slate-500">To:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            min={fromDate}
            max={new Date().toISOString().split('T')[0]}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
          />
        </div>
        {(statusFilter || priorityFilter || sortOption !== 'createdAt' || fromDate || toDate) && (
          <button
            onClick={() => { setStatusFilter(''); setPriorityFilter(''); setSortOption('createdAt'); setFromDate(''); setToDate(''); }}
            className="text-xs text-slate-500 hover:text-red-500 underline transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-purple-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="p-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-center text-sm">{error}</div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center shadow-sm animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-2xl mb-5 text-slate-400">
            <Inbox size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            {(fromDate || toDate) ? 'No tasks in this date range!' : 'No tasks here!'}
          </h3>
          <p className="text-slate-500 text-sm mt-2 mb-6">
            {(fromDate || toDate) ? 'Try adjusting your date range filter.' : 'Add your first task and start being productive.'}
          </p>
          {!(fromDate || toDate) && (
            <Link to="/add-task" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-xl text-sm hover:bg-purple-700 transition-all">
              <Plus size={16} /> Create Task
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task, i) => {
            const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;
            const due = formatDate(task.dueDate);
            const done = task.status === 'completed';
            return (
              <div
                key={task._id}
                className={`bg-white rounded-2xl border transition-all duration-200 animate-fade-in ${
                  done ? 'border-slate-200 opacity-60' : 'border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="p-5 flex gap-4 items-start">
                  {/* Toggle Button */}
                  <button
                    onClick={() => toggleStatus(task._id, task.status)}
                    className={`flex-shrink-0 mt-0.5 rounded-full transition-colors duration-150 ${
                      done ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 hover:text-purple-500'
                    }`}
                    title={done ? 'Mark as pending' : 'Mark as complete'}
                  >
                    {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className={`font-semibold text-base ${done ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {task.title}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${p.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                      {due && (
                        <span className={`flex items-center gap-1.5 ${due.overdue && !done ? 'text-red-500' : ''}`}>
                          <Calendar size={12} />
                          {due.overdue && !done ? 'Overdue · ' : 'Due · '}{due.text}
                        </span>
                      )}
                      {task.reminderTime && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(task.reminderTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${done ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {done ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      to={`/edit-task/${task._id}`}
                      className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      title="Edit task"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Report Table — shown only when there are tasks */}
      {!loading && !error && filteredTasks.length > 0 && (
        <TaskReport tasks={filteredTasks} user={user} />
      )}
    </div>
  );
};

export default TaskList;
