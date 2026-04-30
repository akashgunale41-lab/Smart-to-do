import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, ListTodo, CheckCircle2, Clock, AlertCircle, ShieldCheck } from 'lucide-react';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-3xl font-extrabold text-slate-900">{value ?? '—'}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats]               = useState(null);
  const [users, setUsers]               = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try { const res = await api.get('/admin/stats'); setStats(res.data); }
      catch { setError('Failed to load stats.'); }
      finally { setLoadingStats(false); }
    };
    const fetchUsers = async () => {
      try { const res = await api.get('/admin/users'); setUsers(res.data); }
      catch {}
      finally { setLoadingUsers(false); }
    };

    fetchStats();
    fetchUsers();
  }, []);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-purple-600 text-white p-2.5 rounded-xl">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Application-wide statistics and user management</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-24 animate-pulse bg-slate-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Users size={22} className="text-blue-600" />}           label="Total Users"   value={stats?.totalUsers}    color="bg-blue-50" />
          <StatCard icon={<ListTodo size={22} className="text-purple-600" />}      label="Total Tasks"   value={stats?.totalTasks}    color="bg-purple-50" />
          <StatCard icon={<CheckCircle2 size={22} className="text-emerald-600" />} label="Completed"     value={stats?.completedTasks} color="bg-emerald-50" />
          <StatCard icon={<Clock size={22} className="text-amber-600" />}          label="Pending"       value={stats?.pendingTasks}  color="bg-amber-50" />
        </div>
      )}

      {/* Users Table with task progress */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-4">All Registered Users</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          {loadingUsers ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-purple-600 border-t-transparent" />
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-purple-600">
                  <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider">Completed</th>
                  <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider">Pending</th>
                  <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-xs font-bold text-white uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u, i) => (
                  <tr key={u._id} className={`hover:bg-slate-50 transition-colors ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 text-slate-800 font-semibold">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role === 'admin' ? '🛡 Admin' : '👤 User'}
                      </span>
                    </td>
                    {/* Completed Tasks */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                        ✅ {u.completedTasks ?? 0}
                      </span>
                    </td>
                    {/* Pending Tasks */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                        ⏳ {u.pendingTasks ?? 0}
                      </span>
                    </td>
                    {/* Total Tasks */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                        📋 {u.totalTasks ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
