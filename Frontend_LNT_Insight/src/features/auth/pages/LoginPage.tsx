import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Lock, Activity } from 'lucide-react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { authService } from '../services/authService';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(username, password);
      login(response);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />

      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Login Card */}
      <div className="w-full max-w-md px-6 py-8 md:px-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl relative z-10 mx-4">
        {/* Brand / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3 animate-pulse">
            <Activity className="text-white w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white text-center">
            LNT INSIGHT
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            Production Reporting & Monitoring System
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-red-200 text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="username"
            label="Username"
            placeholder="Enter your username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<UserIcon size={16} className="text-slate-400" />}
            error={fieldErrors.username}
            className="text-slate-200"
            style={{ color: 'white', backgroundColor: '#0f172a', borderColor: '#1e293b' }}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={16} className="text-slate-400" />}
            error={fieldErrors.password}
            className="text-slate-200"
            style={{ color: 'white', backgroundColor: '#0f172a', borderColor: '#1e293b' }}
          />

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded-sm border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              Remember me
            </label>
            <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all transform hover:-translate-y-[1px] active:translate-y-[1px] mt-2 cursor-pointer"
          >
            Đăng nhập
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider">
            &copy; 2026 LNTSoft Team. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
