import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, CheckSquare, LayoutDashboard, ListTodo, Plus, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (to, icon, label) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${active
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 max-w-5xl flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-extrabold text-xl text-slate-800 tracking-tight">
          <div className="bg-purple-600 text-white p-1.5 rounded-lg">
            <CheckSquare size={20} />
          </div>
          Smart<span className="text-purple-600">To-Do</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Nav Links */}
            {navLink('/dashboard', <LayoutDashboard size={16} />, 'Dashboard')}
            {navLink('/tasks', <ListTodo size={16} />, 'Tasks')}
            {navLink('/add-task', <Plus size={16} />, 'Add Task')}
            {user.role === 'admin' && navLink('/admin', <ShieldCheck size={16} />, 'Admin')}

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />

            {/* User greeting */}
            <span className="hidden md:inline text-sm text-slate-500 font-medium">
              Hi, <span className="text-slate-800">{user.name}</span>
            </span>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 ml-1 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-150"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
