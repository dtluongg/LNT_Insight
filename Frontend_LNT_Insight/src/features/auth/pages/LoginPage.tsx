import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Lock, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
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

      if (rememberMe) {
        localStorage.setItem('remembered_username', username);
      } else {
        localStorage.removeItem('remembered_username');
      }

      // Delay nhẹ 600ms để người dùng kịp quan sát thông báo thành công từ server
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login. Please check your credentials.');
      setIsLoading(false);
    }
  };
  useEffect(() => {
    const rememberedUsername = localStorage.getItem('remembered_username');

    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#071638] font-sans text-slate-100 select-none">
      {/* BACKGROUND */}

      {/* Base blue radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(14,165,255,0.32),rgba(37,99,235,0.10)_35%,transparent_65%)]" />

      {/* Animated ambient blue glow - left */}
      <div className="pointer-events-none absolute -left-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 animate-pulse rounded-full bg-blue-500/35 blur-[140px]" />

      {/* Animated ambient cyan glow - right */}
      <div
        className="pointer-events-none absolute -right-40 top-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-400/30 blur-[150px]"
        style={{ animationDelay: '1s' }}
      />

      {/* Top blue glow */}
      <div className="pointer-events-none absolute -top-72 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-[160px]" />

      {/* Radial grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Subtle horizontal light */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />

      {/* LOGIN CARD WRAPPER */}

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-8">
        <div className="relative w-full max-w-md">
          {/* LARGE MOVING BACKGROUND GLOW. This is what makes the area around the card move.*/}

          <div className="absolute -inset-10 rounded-[40px] bg-[conic-gradient(from_0deg,#2563eb,#06b6d4,#0ea5e9,#1d4ed8,#06b6d4,#2563eb)] opacity-40 blur-[45px] animate-[spin_50s_linear_infinite] pointer-events-none" />

          <div className="group relative overflow-hidden rounded-[28px] p-[1.5px]">
            {/* Rotating border beam */}
            <span className="pointer-events-none absolute inset-[-1000%] animate-[spin_5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1d4ed8_0%,#06b6d4_22%,#38bdf8_35%,#2563eb_50%,#06b6d4_72%,#1d4ed8_100%)] opacity-90" />

            {/* == CARD == */}

            <div className="relative overflow-hidden rounded-[26px] bg-[#0b1b3a]/88 px-7 py-8 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl sm:px-9 sm:py-9">
              {/* Moving background INSIDE card */}
              <div className="pointer-events-none absolute -inset-[60%] bg-[conic-gradient(from_0deg,rgba(37,99,235,0.16),rgba(6,182,212,0.22),rgba(14,165,233,0.05),rgba(37,99,235,0.12))]" />

              {/* Inner blue atmospheric glow */}
              <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-80 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[80px]" />

              {/* Top cyan light */}
              <div className="absolute left-[15%] right-[15%] top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80 shadow-[0_0_18px_rgba(34,211,238,0.8)]" />

              {/* Actual content */}
              <div className="relative z-10">
                {/* LOGO */}

                <div className="mb-7 flex flex-col items-center text-center">
                  <div className="relative mb-4 h-16 w-16 rounded-[20px] bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-600 p-[2px] shadow-[0_0_40px_rgba(6,182,212,0.55)]">
                    {/* Logo glow */}
                    <div className="absolute -inset-3 rounded-[24px] bg-cyan-400/20 blur-xl" />

                    <div className="relative flex h-full w-full items-center justify-center rounded-[18px] bg-[#071127]">
                      <img src="/logo_lnt_insight.png" alt="LNT Insight" className="h-9 w-9 object-contain" />
                    </div>
                  </div>

                  {/* Brand */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black tracking-wider text-white">LNTBOOST</span>

                    <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-2xl font-black tracking-wider text-transparent">
                      INSIGHT
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200/50">Production Reporting & Monitoring System</p>
                </div>

                {/* ERROR */}

                {error && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-950/50 p-3.5 text-xs font-medium text-rose-300">
                    <AlertCircle size={16} className="pointer-events-none mt-0.5 shrink-0 text-rose-400" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* SUCCESS */}

                {successMessage && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/50 p-3.5 text-xs font-medium text-emerald-300">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                    <span className="leading-relaxed">{successMessage}</span>
                  </div>
                )}

                {/* FORM */}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* USERNAME */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Username</label>

                    <div className="group/input relative">
                      <UserIcon
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within/input:text-cyan-400"
                      />

                      <input
                        type="text"
                        placeholder="Type your username..."
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`h-12 w-full rounded-xl border bg-[#030a19]/80 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition-all duration-200 ${
                          fieldErrors.username
                            ? 'border-rose-500/70 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-700/70 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10'
                        }`}
                        name="username"
                        autoComplete="username"
                      />
                    </div>

                    {fieldErrors.username && <span className="text-xs font-medium text-rose-400">{fieldErrors.username}</span>}
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Password</label>

                    <div className="group/input relative">
                      <Lock
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within/input:text-cyan-400"
                      />

                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Type your password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`h-12 w-full rounded-xl border bg-[#030a19]/80 pl-11 pr-11 text-sm text-white outline-none placeholder:text-slate-600 transition-all duration-200 ${
                          fieldErrors.password
                            ? 'border-rose-500/70 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-700/70 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/10'
                        }`}
                        name="password"
                        autoComplete="current-password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition-colors hover:text-cyan-300"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {fieldErrors.password && <span className="text-xs font-medium text-rose-400">{fieldErrors.password}</span>}
                  </div>

                  {/* REMEMBER */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="flex cursor-pointer select-none items-center gap-2 text-slate-400 transition-colors hover:text-slate-200">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 cursor-pointer rounded-md border-slate-700 bg-slate-950 text-cyan-500 accent-cyan-500 focus:ring-cyan-500/30"
                      />
                      Remember me
                    </label>

                    <a href="#" className="font-semibold text-cyan-400 transition-colors hover:text-cyan-300">
                      Forgot password?
                    </a>
                  </div>

                  {/* LOGIN BUTTON */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group/button relative mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-[length:200%_100%] text-sm font-bold text-white shadow-[0_8px_30px_rgba(6,182,212,0.25)] transition-all duration-300 hover:-translate-y-[1px] hover:bg-[position:100%_0] hover:shadow-[0_8px_40px_rgba(6,182,212,0.4)] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {/* Button shine */}
                    <span className="absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover/button:left-[130%]" />

                    <span className="relative z-10">{isLoading ? 'Signing in...' : 'Sign In'}</span>

                    {isLoading ? (
                      <div className="relative z-10 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <ArrowRight size={17} className="relative z-10 transition-transform duration-300 group-hover/button:translate-x-1" />
                    )}
                  </button>
                </form>

                {/*                 FOOTER               */}

                <div className="mt-8 flex items-center justify-between border-t border-cyan-400/10 pt-5 text-[10px]">
                  <span className="text-slate-600">© 2026 LNTSOFT BUSINESS SOLUTION</span>

                  <span className="flex items-center gap-1.5 font-medium text-slate-500">
                    <ShieldCheck size={13} className="text-cyan-400" />
                    256-bit Encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
