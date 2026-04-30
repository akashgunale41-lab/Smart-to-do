import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, AlertCircle, Loader2, Calendar, Clock, Flag, FileText, Type } from 'lucide-react';

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    reminderTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const fetchTask = async () => {
      try {
        const res = await api.get('/tasks');
        const task = res.data.find(t => t._id === id);
        if (task) {
          // Helper to get local datetime string for datetime-local input
          const getLocalDatetime = (dateString) => {
            if (!dateString) return '';
            const d = new Date(dateString);
            const pad = (n) => n.toString().padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          };

          setFormData({
            title: task.title || '',
            description: task.description || '',
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '', // yyyy-mm-dd is fine for date only
            reminderTime: getLocalDatetime(task.reminderTime),
          });
        } else {
          setError('Task not found.');
        }
      } catch (err) {
        setError('Could not load task. Please go back and try again.');
      } finally {
        setFetching(false);
      }
    };
    fetchTask();
  }, [id, isEdit]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Get today's date in yyyy-mm-dd format (local time)
  const getTodayString = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };

  // Get current datetime in yyyy-MM-ddTHH:mm format (local time) for datetime-local min
  const getNowString = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.title.trim()) { setError('Task title is required.'); return; }

    // Validate: due date must not be in the past
    if (formData.dueDate && formData.dueDate < getTodayString()) {
      setError('Due date cannot be in the past. Please select today or a future date.');
      return;
    }

    // Validate: reminder time must not be in the past
    if (formData.reminderTime && formData.reminderTime < getNowString()) {
      setError('Reminder time cannot be in the past. Please select a current or future time.');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await api.put(`/tasks/${id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      navigate('/tasks');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PRIORITY_OPTS = [
    { value: 'low',    label: '🟢 Low',    colors: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
    { value: 'medium', label: '🟡 Medium', colors: 'border-amber-400 bg-amber-50 text-amber-700' },
    { value: 'high',   label: '🔴 High',   colors: 'border-red-400 bg-red-50 text-red-700' },
  ];

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-52">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-purple-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Back link */}
      <Link to="/tasks" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Tasks
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isEdit ? '✏️ Edit Task' : '✨ Create New Task'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isEdit ? 'Update the details of your task below.' : 'Fill in the form below to add a new task.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm animate-slide-in">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
              <Type size={14} className="text-purple-500" /> Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="title" value={formData.title} onChange={handleChange}
              placeholder="e.g., Complete the project report"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
              <FileText size={14} className="text-purple-500" /> Description
              <span className="text-xs font-normal text-slate-400 ml-1">(optional)</span>
            </label>
            <textarea
              name="description" value={formData.description} onChange={handleChange}
              placeholder="Add any additional details about this task..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Priority Selector */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2.5">
              <Flag size={14} className="text-purple-500" /> Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIORITY_OPTS.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-semibold transition-all duration-150 ${
                    formData.priority === opt.value ? opt.colors : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio" name="priority" value={opt.value}
                    checked={formData.priority === opt.value}
                    onChange={handleChange} className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                name="status" value={formData.status} onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="pending">⏳ Pending</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          )}

          {/* Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
                <Calendar size={14} className="text-purple-500" /> Due Date
              </label>
              <input
                type="date" name="dueDate" value={formData.dueDate} onChange={handleChange}
                min={getTodayString()}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-1.5">
                <Clock size={14} className="text-purple-500" /> Reminder Time
              </label>
              <input
                type="datetime-local" name="reminderTime" value={formData.reminderTime} onChange={handleChange}
                min={getNowString()}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/tasks" className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              Cancel
            </Link>
            <button
              type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm shadow-purple-200 transition-all text-sm"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (isEdit ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
