import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  FileBarChart2,
  Database,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronRightSquare,
  LogOut,
  SquareChartGantt,
  Columns3Cog,
  ChartNoAxesCombined,
  Lightbulb
} from 'lucide-react';
import { masterDataApi } from '../core/api/materData';
import { useAuth } from '../app/providers/AuthProvider';
import type { ModuleMasterInfo, SubModuleInfo } from '../types';
import { getModuleRoute, getSubModuleRoute } from '../app/routesConfig';
import { createPortal } from 'react-dom';

// Hàm ánh xạ Icon dựa trên tên hoặc ID phân hệ
const getModuleIcon = (ModuleName: string, id: string) => {
  const nameLower = String(ModuleName).toLowerCase();

  if (nameLower.includes('executive')) {
    return <Activity size={18} />;
  }
  if (nameLower.includes('manage') || nameLower.includes('vật tư') || nameLower.includes('kho')) {
    return <SquareChartGantt size={18} />;
  }
  if (nameLower.includes('operation') || nameLower.includes('sản xuất')) {
    return <Columns3Cog size={18} />;
  }
  if (nameLower.includes('report') || nameLower.includes('báo cáo')) {
    return <FileBarChart2 size={18} />;
  }
  if (nameLower.includes('analytic') || nameLower.includes('bảo trì') || nameLower.includes('thiết bị')) {
    return <ChartNoAxesCombined size={18} />;
  }
  if (nameLower.includes('insight')) {
    return <Lightbulb size={18} />;
  }
  if (nameLower.includes('data') || nameLower.includes('danh mục') || nameLower.includes('hệ thống')) {
    return <Database size={18} />;
  }
  return <Settings size={18} />;
};


export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modules, setModules] = useState<ModuleMasterInfo[]>([]);
  const [submodules, setSubmodules] = useState<{ [moduleId: string]: SubModuleInfo[] }>({});
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openPopupLogout, setOpenPopupLogout] = useState(false);

  // Tải danh sách Modules chính từ API khi mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await masterDataApi.getModules();
        setModules(data);
      } catch (err) {
        console.error('Lỗi tải modules chính:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModules();
  }, []);

  // Gọi API tải submodules khi click vào Module chính
  const handleModuleClick = async (moduleId: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }

    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
      return;
    }

    setExpandedModuleId(moduleId);

    if (!submodules[moduleId]) {
      try {
        const subData = await masterDataApi.getSubModules(moduleId);
        setSubmodules((prev) => ({ ...prev, [moduleId]: subData }));
      } catch (err) {
        console.error(`Lỗi tải submodules cho module ${moduleId}:`, err);
      }
    }
  };

  return (
    <aside
      style={{ backgroundColor: 'var(--color-sidebar)' }}
      className={`h-screen text-slate-200 flex flex-col justify-between border-r border-white/10 shadow-xl transition-all duration-300 ease-in-out select-none ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Top Section - Brand/Logo */}
      <div>
        <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shadow-inner shrink-0 backdrop-blur-sm">
            <img
              src="/logo_lnt_insight.png"
              alt="LNT Insight"
              className="w-6 h-6 object-contain"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1.5 tracking-wide leading-tight">
                <span className="font-extrabold text-white text-sm tracking-wider">FXPRO</span>
                <span className="font-black bg-gradient-to-r from-[var(--color-brand-cyan)] to-blue-300 bg-clip-text text-transparent text-sm">
                  INSIGHT
                </span>
              </div>
              <span className="text-[10px] text-blue-200/60 font-semibold tracking-wider uppercase mt-0.5">
                Intelligent Business
              </span>
            </div>
          )}
        </div>

        {/* Modules List */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-145px)] custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col gap-2 py-3 px-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            modules.map((module) => {
              const isExpanded = expandedModuleId === module.ModuleMasterID;
              const moduleRoute = getModuleRoute(module.ModuleMasterID);
              const modulePath = moduleRoute?.path ?? `/coming-soon`;

              return (
                <div key={module.ModuleMasterID} className="flex flex-col">
                  {/* Module Master Item */}
                  <div className="group relative flex items-center w-full rounded-xl transition-colors duration-150">
                    <NavLink
                      to={modulePath}
                      className={({ isActive }) =>
                        `flex-1 flex items-center gap-3 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${isActive
                          ? 'bg-[var(--color-brand-cyan)]/20 text-cyan-200 ring-1 ring-[var(--color-brand-cyan)]/40 shadow-sm shadow-cyan-950/20'
                          : 'text-blue-100/75 hover:text-white hover:bg-[var(--color-sidebar-hover)]'
                        } ${isCollapsed ? 'justify-center px-0' : ''}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div
                            className={`shrink-0 transition-colors ${isActive ? 'text-[var(--color-brand-cyan)]' : 'text-blue-200/70 group-hover:text-white'
                              }`}
                          >
                            {getModuleIcon(module.ModuleMasterName, module.ModuleMasterID)}
                          </div>

                          {!isCollapsed && (
                            <span className="truncate text-left leading-none flex-1">
                              {module.ModuleMasterName}
                            </span>
                          )}

                          {/* Tooltip khi sidebar đóng */}
                          {isCollapsed && (
                            <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[var(--color-sidebar-hover)] text-white text-xs font-medium shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                              {module.ModuleMasterName}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>

                    {/* Expand/Collapse Button */}
                    {!isCollapsed && (
                      <button
                        type="button"
                        onClick={() => handleModuleClick(module.ModuleMasterID)}
                        aria-label="Toggle submodules"
                        className={`p-2 mr-1 rounded-lg text-blue-200/60 hover:text-white hover:bg-white/10 transition-all ${isExpanded ? 'text-[var(--color-brand-cyan)]' : ''
                          }`}
                      >
                        {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </button>
                    )}
                  </div>

                  {/* SubModules Accordion */}
                  {!isCollapsed && isExpanded && submodules[module.ModuleMasterID] && (
                    <div className="mt-1 ml-5 pl-3 border-l border-white/15 space-y-0.5">
                      {submodules[module.ModuleMasterID].map((sub) => {
                        const route = getSubModuleRoute(sub.ModuleMasterID, sub.ModuleMasterSubID);
                        const path = route?.path ?? `/coming-soon`;

                        return (
                          <NavLink
                            key={`${sub.ModuleMasterID}-${sub.ModuleMasterSubID}`}
                            to={path}
                            className={({ isActive }) =>
                              `block px-3 py-2 text-[11px] font-medium rounded-lg transition-all ${isActive
                                ? 'text-[var(--color-brand-cyan)] bg-white/10 font-semibold'
                                : 'text-blue-100/65 hover:text-white hover:bg-white/5'
                              }`
                            }
                          >
                            {sub.ModuleMasterName}
                          </NavLink>
                        );
                      })}

                      {submodules[module.ModuleMasterID].length === 0 && (
                        <span className="block px-3 py-1.5 text-[11px] text-blue-200/40 italic">
                          Không có phân hệ con
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>
      </div>

      {/* Bottom Section - Collapse Toggle & Logout */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 transition-colors cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''
            }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRightSquare size={18} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>

        <button
          type="button"
          onClick={() => setOpenPopupLogout(true)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer ${isCollapsed ? 'justify-center px-0' : ''
            }`}
          title="Logout"
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
      {/* Modal Xác nhận Đăng xuất */}
      {/* Modal Xác nhận Đăng xuất (Portal ra toàn màn hình) */}
      {openPopupLogout &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
            onClick={() => setOpenPopupLogout(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl shadow-black/80 flex flex-col gap-4 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                  <LogOut size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Logout Confirm</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Are you want logout in this time?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setOpenPopupLogout(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
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
    </aside>
  );
};