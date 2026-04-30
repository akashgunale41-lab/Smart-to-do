import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, AlertCircle, KeyRound, Loader2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [loadingForm, setLoadingForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetToken(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoadingForm(true);
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSuccess(res.data.message);
      // For development/assignment purposes without email delivery, we provide the token link directly:
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <KeyRound size={30} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter your email and we'll send a reset link</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm animate-slide-in">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 bg-green-50 border border-green-100 rounded-xl text-green-800 text-sm text-center animate-slide-in space-y-3">
              <div className="font-semibold">{success}</div>
              {resetToken && (
                <div className="p-3 bg-white rounded-lg border border-green-200 text-left">
                  <span className="block text-xs font-bold text-green-600 mb-1 uppercase tracking-wider">Development Link:</span>
                  <Link 
                    to={`/reset-password/${resetToken}`} 
                    className="text-blue-600 hover:text-blue-700 break-all underline text-sm"
                  >
                    Click here to reset your password
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                  placeholder="you@example.com"
                  disabled={loadingForm || !!success}
                />
              </div>
            </div>

            {!success && (
              <button
                type="submit"
                disabled={loadingForm}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm shadow-blue-200 transition-all duration-150 text-sm"
              >
                {loadingForm
                  ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
                  : 'Send Reset Link'
                }
              </button>
            )}
            
            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
