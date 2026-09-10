import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, User as UserIcon, LogOut, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../app/providers/AuthProvider';
import { masterDataApi } from '../core/api/materData';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState<string>(
    user?.fullName || user?.username || 'User'
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Sẵn sàng để chèn URL ảnh đại diện sau này
  const [avatarUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lấy họ tên hiển thị từ user auth hoặc gọi API masterData nếu cần
  useEffect(() => {
    if (user?.fullName) {
      setDisplayName(user.fullName);
    } else if (user?.username) {
      masterDataApi.getUsers().then(users => {
        const found = users.find(
          u => u.username.toLowerCase() === user.username.toLowerCase()
        );
        if (found?.fullName) {
          setDisplayName(found.fullName);
        } else {
          setDisplayName(user.username);
        }
      }).catch(err => {
        console.error('Failed to fetch user list:', err);
        setDisplayName(user.username);
      });
    }
  }, [user]);

  // Tự động đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="h-14 px-6 flex items-center justify-between shrink-0 bg-[#f5f7fb] border-b border-slate-200/50 select-none">
      {/* Bên trái: Tiêu đề hoặc để trống */}
      <div className="flex items-center gap-2">
        {title && (
          <h2 className="text-base font-bold text-slate-800 tracking-tight">
            {title}
          </h2>
        )}
      </div>

      {/* Bên phải: Chuông thông báo + Avatar + Tên User + Chevron dropdown */}
      <div className="flex items-center gap-4">
        {/* 1. Icon chuông thông báo mới (để sau) */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-all cursor-pointer focus:outline-hidden"
          title="Thông báo mới"
        >
          <Bell size={20} />
          {/* Chấm đỏ báo có thông báo mới */}
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white" />
          </span>
        </button>

        {/* 2. Khối User: Ô tròn hình ảnh + Tên user + Chevron */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 py-1 px-2 rounded-xl hover:bg-white/80 transition-all cursor-pointer focus:outline-hidden group"
          >
            {/* Ô tròn để hình ảnh avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0f2747] text-white flex items-center justify-center shrink-0 shadow-xs ring-1 ring-slate-200">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={18} className="text-white" />
              )}
            </div>

            {/* Tên user lấy từ dữ liệu qua API */}
            <span className="text-sm font-semibold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
              {displayName}
            </span>

            {/* Mũi tên thu gọn / mở rộng */}
            <ChevronDown
              size={16}
              className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu khi click vào user */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/60 p-2 z-50">
              <div className="p-3 border-b border-slate-100 mb-1">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {displayName}
                </p>
                {user?.email && (
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 truncate">
                    <Mail size={12} />
                    {user.email}
                  </p>
                )}
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">
                  <ShieldCheck size={12} />
                  {user?.isAdmin ? 'Administrator' : 'Standard User'}
                </div>
              </div>

              {/* Tùy chọn Đăng xuất */}
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut size={15} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};