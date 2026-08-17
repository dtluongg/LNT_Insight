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


// Hàm ánh xạ Icon dựa trên tên hoặc ID phân hệ
const getModuleIcon = (moduleName: string, id: string) => {
  const nameLower = moduleName.toLowerCase();
  const idLower = id.toLowerCase();

  if (nameLower.includes('executive') || idLower.includes('dash')) {
    return <Activity size={20} />;
  }
  if (nameLower.includes('manage') || nameLower.includes('vật tư') || nameLower.includes('kho')) {
    return <SquareChartGantt size={20} />;
  }
  if (nameLower.includes('operation') || nameLower.includes('sản xuất')) {
    return <Columns3Cog size={20} />;
  }
  if (nameLower.includes('report') || nameLower.includes('báo cáo')) {
    return <FileBarChart2 size={20} />;
  }
  if (nameLower.includes('analytic') || nameLower.includes('bảo trì') || nameLower.includes('thiết bị')) {
    return <ChartNoAxesCombined size={20} />;
  }
  if (nameLower.includes('insight') || nameLower.includes('bảo trì') || nameLower.includes('thiết bị')) {
    return <Lightbulb size={20} />;
  }
  if (nameLower.includes('data') || nameLower.includes('danh mục') || nameLower.includes('hệ thống')) {
    return <Database size={20} />;
  }
  return <Settings size={20} />; // Mặc định
};

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modules, setModules] = useState<ModuleMasterInfo[]>([]);
  const [submodules, setSubmodules] = useState<{ [moduleId: string]: SubModuleInfo[] }>({});
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsCollapsed(false); // Tự động mở rộng sidebar nếu đang thu gọn
    }

    if (expandedModuleId === moduleId) {
      setExpandedModuleId(null);
      return;
    }

    setExpandedModuleId(moduleId);

    // Chỉ gọi API nếu chưa tải dữ liệu submodule này
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
    <div
      className={`h-screen bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      {/* Top Section - Brand/Logo */}
      <div>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-slate-900/60 border border-slate-800/60 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
            <div className="logo-symbol">
              <img src="/logo_lnt_insight.png" alt="LNT Insight" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 transition-opacity duration-200">
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-100 tracking-wider text-sm">FXPRO</span>
                <span className="font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent tracking-wider text-sm">INSIGHT</span>
              </div>
              <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Intelligent Business</span>
            </div>
          )}
        </div>

        {/* Modules List */}
        <div className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {isLoading ? (
            <div className="text-xs text-slate-500 text-center py-4">Đang tải phân hệ...</div>
          ) : (
            modules.map((module) => {
              const isExpanded =
                expandedModuleId === module.moduleMasterID;

              const hasSubmodules =
                submodules[module.moduleMasterID]?.length > 0 || true;

              const moduleRoute =
                getModuleRoute(module.moduleMasterID);

              const modulePath =
                moduleRoute?.path ??
                `/coming-soon`;

              return (
                <div key={module.moduleMasterID} className="flex flex-col">
                  {/* Module Master Item */}
                  <div className="flex items-center w-full">
                    {/* Module navigation */}
                    <NavLink
                      to={modulePath}
                      className={({ isActive }) =>
                        `flex-1 flex items-center gap-3 py-2.5 rounded-l-lg text-sm font-medium transition-all group ${isActive
                          ? 'bg-slate-900/90 text-slate-100 pl-2.5 border-l-2 border-cyan-400 active'
                          : 'hover:bg-slate-900/50 hover:text-white pl-3 text-slate-400'
                        }`
                      }
                    >
                      <div className="text-slate-400 group-hover:text-cyan-400 group-[.active]:text-cyan-400 transition-colors">
                        {getModuleIcon(
                          module.moduleMasterName,
                          module.moduleMasterID
                        )}
                      </div>

                      {!isCollapsed && (
                        <span className="truncate text-left">
                          {module.moduleMasterName}
                        </span>
                      )}
                    </NavLink>

                    {/* Expand / Collapse */}
                    {!isCollapsed && hasSubmodules && (
                      <button
                        onClick={() =>
                          handleModuleClick(module.moduleMasterID)
                        }
                        className="px-2.5 py-2.5 rounded-r-lg text-slate-500 hover:text-white hover:bg-slate-900/60 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* SubModules Accordion List */}
                  {!isCollapsed && isExpanded && submodules[module.moduleMasterID] && (
                    <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1.5 transition-all">


                      {submodules[module.moduleMasterID].map((sub) => {
                        const route = getSubModuleRoute(sub.moduleMasterID, sub.moduleMasterSubID);
                        const path =
                          route?.path ??
                          `/coming-soon`;

                        return (
                          <NavLink
                            key={`${sub.moduleMasterID}-${sub.moduleMasterSubID}`}
                            to={path}
                            className={({ isActive }) =>
                              `block px-3 py-2 text-xs font-medium rounded-md transition-colors ${isActive
                                ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                              }`
                            }
                          >
                            {sub.moduleMasterName}
                          </NavLink>
                        )
                      })}

                      {submodules[module.moduleMasterID].length === 0 && (
                        <span className="block px-3 py-1 text-[11px] text-slate-600">Không có phân hệ con</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom Section - Collapse Toggle & Logout */}
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRightSquare size={20} /> : <ChevronLeft size={20} />}
          {!isCollapsed && <span>Collapse</span>}
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};
