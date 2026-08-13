import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SewingTeamPerformance } from '../features/dashboard/components/SewingTeamPerformance';
import { MainLayout } from '../layouts/MainLayout';

// Component bảo vệ Route yêu cầu Đăng nhập
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-medium">
        Đang tải ứng dụng...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Component chặn truy cập lại trang Login khi đã đăng nhập
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-medium">
        Đang tải...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Các route yêu cầu đăng nhập sẽ nằm dưới MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard/sewing-team-performance" replace />} />
        <Route path="dashboard/sewing-team-performance" element={<SewingTeamPerformance />} />
        <Route path="dashboard/pending/:subId" element={
          <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-xl border border-slate-100 shadow-xs">
            Tính năng này đang được phát triển...
          </div>
        } />
      </Route>

      {/* Route Đăng nhập */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Catch-all route chuyển về trang gốc */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

