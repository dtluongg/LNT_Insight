import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, User as UserIcon, LogOut, ShieldCheck, Mail, Building2, Check, Sun, Moon, Monitor } from 'lucide-react';
import { useAuth } from '../app/providers/AuthProvider';
import { useTheme } from '../app/providers/ThemeProvider';
import { masterDataApi } from '../core/api/materData';
import { createPortal } from 'react-dom';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout, authorizedCompanies, selectedCompanyID, setSelectedCompanyID } = useAuth();
  const { theme, setTheme, isDark } = useTheme();

  const [displayName, setDisplayName] = useState<string>(
    user?.fullName || user?.username || 'User'
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  
  const [avatarUrl] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const companyDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  const [openPopupLogout, setOpenPopupLogout] = useState(false);

  // Fetch full name from user auth or masterData API
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

  // Click outside listener for all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isCompanyDropdownOpen || isThemeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isCompanyDropdownOpen, isThemeDropdownOpen]);

  return (
    <header className="h-14 px-6 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 select-none">
      {/* Left side: Title + Company selector */}
      <div className="flex items-center gap-4">
        {title && (
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
        )}

        {/* Company Combobox */}
        {authorizedCompanies && authorizedCompanies.length > 0 && (
          <div className="relative" ref={companyDropdownRef}>
            <button
              type="button"
              onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-sm transition-all cursor-pointer group focus:outline-hidden"
            >
              <Building2 size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase hidden sm:inline">
                Company:
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {selectedCompanyID || 'Select Company'}
              </span>
              <ChevronDown
                size={14}
                className={`text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 ${
                  isCompanyDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                }`}
              />
            </button>

            {/* Custom Company Dropdown */}
            {isCompanyDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/70 p-1.5 z-50">
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Select Company
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    {authorizedCompanies.length}
                  </span>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-0.5">
                  {authorizedCompanies.map((comp) => {
                    const isSelected = comp === selectedCompanyID;
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => {
                          setSelectedCompanyID(comp);
                          setIsCompanyDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className={isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'} />
                          <span>{comp}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side: Theme Switcher + Notification Bell + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme Switcher Button */}
        <div className="relative" ref={themeDropdownRef}>
          <button
            type="button"
            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-hidden group relative flex items-center justify-center"
            title={`Theme: ${theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}`}
          >
            {isDark ? (
              <Moon size={19} className="text-amber-400 transform transition-transform duration-300 group-hover:-rotate-12" />
            ) : (
              <Sun size={19} className="text-amber-500 transform transition-transform duration-300 group-hover:rotate-45" />
            )}
          </button>

          {/* Theme selection menu */}
          {isThemeDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/70 p-1.5 z-50">
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  setIsThemeDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun size={15} className="text-amber-500" />
                  <span>Light</span>
                </div>
                {theme === 'light' && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  setIsThemeDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon size={15} className="text-indigo-400" />
                  <span>Dark</span>
                </div>
                {theme === 'dark' && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme('system');
                  setIsThemeDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Monitor size={15} className="text-slate-400" />
                  <span>System</span>
                </div>
                {theme === 'system' && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-hidden"
          title="Thông báo mới"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </span>
        </button>

        {/* User Block */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 py-1 px-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer focus:outline-hidden group"
          >
            {/* Avatar Circle */}
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#0f2747] text-white flex items-center justify-center shrink-0 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700">
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

            {/* Display Name */}
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {displayName}
            </span>

            {/* Chevron icon */}
            <ChevronDown
              size={16}
              className={`text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
              }`}
            />
          </button>

          {/* User Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-black/70 p-2 z-50">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {displayName}
                </p>
                {user?.email && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1 truncate">
                    <Mail size={12} />
                    {user.email}
                  </p>
                )}
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <ShieldCheck size={12} />
                  {user?.isAdmin ? 'Administrator' : 'Standard User'}
                </div>
              </div>

              {/* Logout Option */}
              <button
                type="button"
                onClick={() => setOpenPopupLogout(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {openPopupLogout &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            onClick={() => setOpenPopupLogout(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl shadow-black/80 flex flex-col gap-4 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 dark:text-rose-400 shrink-0">
                  <LogOut size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Logout Confirm</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Are you sure you want to logout at this time?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setOpenPopupLogout(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenPopupLogout(false);
                    logout();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-md shadow-rose-950/40 cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};