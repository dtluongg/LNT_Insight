import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Lock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { authService } from '../services/authService';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = 'Username cannot be empty';
    }
    if (!password) {
      errors.password = 'Password cannot be empty';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(username, password);

      // Kiểm tra nếu Backend phản hồi thất bại (isSuccess = false) hoặc không có Token
      if (response.isSuccess === false || !response.token) {
        setError(response.message || 'Login failed. Invalid username or password.');
        setIsLoading(false);
        return;
      }

      // Xử lý thông báo thành công từ LoginResponse (nếu có)
      if (response.message) {
        setSuccessMessage(response.message);
      } else {
        setSuccessMessage('Login successful! Redirecting...');
      }

      login(response);

      // Delay nhẹ 600ms để người dùng kịp quan sát thông báo thành công từ server
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a1128] font-sans text-slate-100 select-none p-4">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none" />

      {/* Subtle Radial Grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #38bdf8 1.5px, transparent 1.5px)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* Centered Minimalist Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative rounded-3xl bg-slate-900/85 border border-slate-800/90 p-7 sm:p-9 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden">
          
          {/* Top Cyan Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80" />

          {/* Logo & Brand Header */}
          <div className="flex flex-col items-center mb-7 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/25 mb-3">
              <div className="w-full h-full bg-[#0a1128] rounded-[14px] flex items-center justify-center">
                <img
                  src="/logo_lnt_insight.png"
                  alt="LNT Insight"
                  className="w-7 h-7 object-contain"
                />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-white tracking-wider">LNT</span>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent tracking-wider">
                INSIGHT
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Production Reporting & Monitoring System
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success / Response Message Alert */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Username
              </label>
              <div className="relative flex items-center">
                <UserIcon size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Type your username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full h-11 pl-11 pr-4 rounded-xl bg-slate-950/70 border text-sm text-white placeholder:text-slate-500 focus:outline-hidden transition-all duration-200 ${
                    fieldErrors.username
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                />
              </div>
              {fieldErrors.username && (
                <span className="text-xs font-medium text-rose-400">{fieldErrors.username}</span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Type your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full h-11 pl-11 pr-11 rounded-xl bg-slate-950/70 border text-sm text-white placeholder:text-slate-500 focus:outline-hidden transition-all duration-200 ${
                    fieldErrors.password
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="text-xs font-medium text-rose-400">{fieldErrors.password}</span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500/30 cursor-pointer"
                />
                Remember me
              </label>
              <a href="#" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-[1px] active:translate-y-[1px]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Clean Footer */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>&copy; 2026 LNTSOFT BUSINESS SOLUTION</span>
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck size={12} className="text-cyan-400" />
              256-bit Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
