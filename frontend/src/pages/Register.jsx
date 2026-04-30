import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, CheckSquare, Loader2, Eye, EyeOff } from 'lucide-react';

// ✅ IMPORTANT: Defined OUTSIDE the component to prevent re-creation on every render
const InputField = ({ label, icon, name, type, placeholder, value, onChange }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPwd ? 'text' : 'password') : type;

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </span>
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={isPassword ? 'new-password' : 'off'}
          className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white"
          placeholder={placeholder}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  // --- Real-time Email Validation ---
  useEffect(() => {
    const checkEmail = async () => {
      // Basic validate format
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        return;
      }
      try {
        const res = await api.post('/auth/check-email', { email: formData.email.trim() });
        if (res.data.exists) {
          setError('User already exists');
        } else {
          if (error === 'User already exists') setError('');
        }
      } catch (err) {
        // Ignore silent err
      }
    };

    // Debounce the check by 600ms to avoid spamming while typing
    const timeoutId = setTimeout(() => {
      checkEmail();
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);
  // ----------------------------------

  if (!loading && user) return <Navigate to="/dashboard" />;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const { name, email, password, confirmPassword } = formData;

    // Validation
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoadingForm(true);
      await api.post('/auth/register', { name: name.trim(), email: email.trim().toLowerCase(), password });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      console.log(err.response);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in py-8">
      <div className="w-full max-w-md">
        {/* Icon & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-2xl mb-4 shadow-lg shadow-purple-200">
            <CheckSquare size={30} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h1>
          <p className="text-slate-500 mt-2 text-sm">Start organizing your life with SmartDo</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 p-3.5 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm text-center">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <InputField
              label="Full Name"
              icon={<User size={16} />}
              name="name"
              type="text"
              placeholder="Bhasker"
              value={formData.name}
              onChange={handleChange}
            />
            <InputField
              label="Email Address"
              icon={<Mail size={16} />}
              name="email"
              type="email"
              placeholder="kit@gmail.com"
              value={formData.email}
              onChange={handleChange}
            />
            <InputField
              label="Password"
              icon={<Lock size={16} />}
              name="password"
              type="password"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={handleChange}
            />
            <InputField
              label="Confirm Password"
              icon={<Lock size={16} />}
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={loadingForm || !!success}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm shadow-purple-200 transition-all duration-150 text-sm mt-2"
            >
              {loadingForm
                ? <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                : 'Create Account'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
