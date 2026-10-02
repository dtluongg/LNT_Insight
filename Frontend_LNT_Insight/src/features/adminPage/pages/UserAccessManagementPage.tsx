import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Building2,
  Boxes,
  Save,
  RotateCcw,
  Search,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  X,
  Users,
  CheckSquare,
  Square,
} from 'lucide-react';
import { masterDataApi } from '../../../core/api/materData';
import { companiesApi } from '../../../core/api/companies';
import type {
  CompanyInfo,
  ModuleMasterInfo,
  SubModuleInfo,
  UpdateUserModuleAccessPayload,
} from '../../../types';

interface UserOptionItem {
  userID: string;
  isAdmin: boolean;
}

interface ModuleWithSubmodules extends ModuleMasterInfo {
  submodules: SubModuleInfo[];
}

export const UserAccessManagementPage: React.FC = () => {
  // Master Data
  const [users, setUsers] = useState<UserOptionItem[]>([]);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [modules, setModules] = useState<ModuleWithSubmodules[]>([]);

  // Selected state
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [selectedCompanyID, setSelectedCompanyID] = useState<string>('');
  // Set of keys: `${moduleId}__${subId}` (subId = 0 represents the module itself)
  const [selectedSubmoduleKeys, setSelectedSubmoduleKeys] = useState<Set<string>>(new Set());

  // Snapshot for dirty checking & reset (for currently active company)
  const [originalSubmoduleKeys, setOriginalSubmoduleKeys] = useState<Set<string>>(new Set());
  // Set of company IDs where user has at least one permission
  const [assignedCompanyIDs, setAssignedCompanyIDs] = useState<Set<string>>(new Set());

  // UI States
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoadingUserAccess, setIsLoadingUserAccess] = useState<boolean>(false);
  const [isLoadingCompanyModules, setIsLoadingCompanyModules] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Search filters
  const [companySearchText, setCompanySearchText] = useState<string>('');
  const [moduleSearchText, setModuleSearchText] = useState<string>('');

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const getSubKey = (moduleId: string, subId: string | number) =>
    `${moduleId.trim()}__${String(subId).trim()}`;

  // 1. Initial Load Master Data
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setIsInitialLoading(true);

        const [fetchedUsersRaw, fetchedCompanies, fetchedModules] = await Promise.all([
          masterDataApi.getUserWorking().catch((err) => {
            console.error('Failed to load user working list:', err);
            return [];
          }),
          companiesApi.getCompanies().catch((err) => {
            console.error('Failed to load companies list:', err);
            return [] as CompanyInfo[];
          }),
          masterDataApi.getModules().catch((err) => {
            console.error('Failed to load modules list:', err);
            return [] as ModuleMasterInfo[];
          }),
        ]);

        // Standardize user list
        const normalizedUsers: UserOptionItem[] = (fetchedUsersRaw || [])
          .map((u: any) => ({
            userID: (u.UserID || u.userID || '').trim(),
            isAdmin: Boolean(u.AdminUser ?? u.adminUser ?? u.isAdmin),
          }))
          .filter((u) => u.userID.length > 0);

        setUsers(normalizedUsers);
        setCompanies(fetchedCompanies || []);

        // Load submodules for all modules
        const modulesWithSubs: ModuleWithSubmodules[] = await Promise.all(
          (fetchedModules || []).map(async (mod) => {
            try {
              const subs = await masterDataApi.getSubModules(mod.ModuleMasterID);
              return { ...mod, submodules: subs || [] };
            } catch (err) {
              console.error(`Failed to load submodules for ${mod.ModuleMasterID}:`, err);
              return { ...mod, submodules: [] };
            }
          })
        );

        setModules(modulesWithSubs);
        setExpandedModules(new Set(modulesWithSubs.map((m) => m.ModuleMasterID.trim())));
      } catch (error) {
        console.error('Failed to load Master Data:', error);
        showToast('error', 'Failed to load master data from system.');
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadMasterData();
  }, []);

  // 2. Fetch company-specific module access
  const fetchCompanyModules = async (username: string, companyId: string) => {
    if (!username || !companyId) return;
    try {
      setIsLoadingCompanyModules(true);
      const data = await masterDataApi.getUserCompanyModuleAccess(username, companyId);

      const subSet = new Set<string>();
      (data.modules || []).forEach((item) => {
        if (item.moduleMasterID !== undefined && item.moduleMasterSubID !== undefined) {
          const mId = item.moduleMasterID.trim();
          const subId = Number(item.moduleMasterSubID);
          subSet.add(getSubKey(mId, subId));
          // Ensure parent module key (subId = 0) is marked when submodule is granted
          subSet.add(getSubKey(mId, 0));
        }
      });

      setSelectedSubmoduleKeys(subSet);
      setOriginalSubmoduleKeys(new Set(subSet));
    } catch (err) {
      console.error(`Failed to load modules for user ${username} at company ${companyId}:`, err);
      showToast('error', `Failed to load module permissions for company ${companyId}`);
      setSelectedSubmoduleKeys(new Set());
      setOriginalSubmoduleKeys(new Set());
    } finally {
      setIsLoadingCompanyModules(false);
    }
  };

  // 3. When Selected User changes: Load overview & default active company
  useEffect(() => {
    if (!selectedUsername) {
      setSelectedCompanyID('');
      setAssignedCompanyIDs(new Set());
      setSelectedSubmoduleKeys(new Set());
      setOriginalSubmoduleKeys(new Set());
      return;
    }

    const loadUserOverview = async () => {
      try {
        setIsLoadingUserAccess(true);
        const data = await masterDataApi.getUserModuleAccess(selectedUsername);

        const assignedSet = new Set(
          (data.companyIDs || [])
            .map((item) => item.companyID?.trim())
            .filter(Boolean)
        );
        setAssignedCompanyIDs(assignedSet);

        // Auto-select initial company: preference to first authorized company, else first master company
        let initialCompany = '';
        if (assignedSet.size > 0) {
          initialCompany = Array.from(assignedSet)[0];
        } else if (companies.length > 0) {
          initialCompany = companies[0].CompanyID.trim();
        }

        setSelectedCompanyID(initialCompany);

        if (initialCompany) {
          await fetchCompanyModules(selectedUsername, initialCompany);
        } else {
          setSelectedSubmoduleKeys(new Set());
          setOriginalSubmoduleKeys(new Set());
        }
      } catch (err) {
        console.error(`Failed to load permissions for user ${selectedUsername}:`, err);
        showToast('error', `Failed to load access permissions for user ${selectedUsername}`);
      } finally {
        setIsLoadingUserAccess(false);
      }
    };

    loadUserOverview();
  }, [selectedUsername]);

  // Active Company Object
  const activeCompany = useMemo(() => {
    return companies.find((c) => c.CompanyID.trim() === selectedCompanyID);
  }, [companies, selectedCompanyID]);

  // Click Company: Switch active company and query modules
  const handleSelectCompany = (companyId: string) => {
    const trimmed = companyId.trim();
    if (trimmed === selectedCompanyID) return;
    setSelectedCompanyID(trimmed);
    if (selectedUsername) {
      fetchCompanyModules(selectedUsername, trimmed);
    }
  };

  // Compute authorized counts & effective payload modules for active company
  const {
    authorizedModulesCount,
    authorizedSubmodulesCount,
    effectivePayloadModules,
  } = useMemo(() => {
    const result: { ModuleMasterID: string; ModuleMasterSubID: number }[] = [];
    let parentCount = 0;
    let subCount = 0;

    modules.forEach((mod) => {
      const mId = mod.ModuleMasterID.trim();
      const selectedSubs = mod.submodules.filter((s) =>
        selectedSubmoduleKeys.has(getSubKey(mId, s.ModuleMasterSubID))
      );
      const isParentSelected =
        selectedSubmoduleKeys.has(getSubKey(mId, 0)) || selectedSubs.length > 0;

      if (isParentSelected) {
        parentCount++;
      }

      if (selectedSubs.length > 0) {
        subCount += selectedSubs.length;
        selectedSubs.forEach((sub) => {
          result.push({
            ModuleMasterID: mId,
            ModuleMasterSubID: Number(sub.ModuleMasterSubID),
          });
        });
      } else if (selectedSubmoduleKeys.has(getSubKey(mId, 0))) {
        // Parent module selected independently
        result.push({
          ModuleMasterID: mId,
          ModuleMasterSubID: 0,
        });
      }
    });

    return {
      authorizedModulesCount: parentCount,
      authorizedSubmodulesCount: subCount,
      effectivePayloadModules: result,
    };
  }, [modules, selectedSubmoduleKeys]);

  // Check unsaved changes for the active company
  const hasUnsavedChanges = useMemo(() => {
    if (!selectedUsername || !selectedCompanyID) return false;
    if (selectedSubmoduleKeys.size !== originalSubmoduleKeys.size) return true;

    for (const key of selectedSubmoduleKeys) {
      if (!originalSubmoduleKeys.has(key)) return true;
    }
    return false;
  }, [selectedUsername, selectedCompanyID, selectedSubmoduleKeys, originalSubmoduleKeys]);

  // Reset changes for active company
  const handleReset = () => {
    setSelectedSubmoduleKeys(new Set(originalSubmoduleKeys));
  };

  // Toggle Parent Module
  const toggleParentModule = (module: ModuleWithSubmodules) => {
    const mId = module.ModuleMasterID.trim();
    const parentKey = getSubKey(mId, 0);
    const updated = new Set(selectedSubmoduleKeys);

    const isParentSelected =
      updated.has(parentKey) ||
      Array.from(updated).some((k) => k.startsWith(`${mId}__`));

    if (isParentSelected) {
      // Uncheck parent: removes parent access and ALL submodules
      Array.from(updated).forEach((k) => {
        if (k.startsWith(`${mId}__`)) updated.delete(k);
      });
    } else {
      // Check parent independently without requiring submodules
      updated.add(parentKey);
    }

    setSelectedSubmoduleKeys(updated);
  };

  // Toggle Submodule
  const toggleSubmodule = (moduleId: string, subId: string | number) => {
    const mId = moduleId.trim();
    const key = getSubKey(mId, subId);
    const parentKey = getSubKey(mId, 0);
    const updated = new Set(selectedSubmoduleKeys);

    if (updated.has(key)) {
      updated.delete(key);
      // Keep parent module granted independently even if this submodule is unchecked
    } else {
      updated.add(key);
      // Automatically ensure parent module is granted
      updated.add(parentKey);
    }
    setSelectedSubmoduleKeys(updated);
  };

  // Quick toggle all submodules of a specific module
  const toggleAllSubmodulesOfModule = (module: ModuleWithSubmodules) => {
    const mId = module.ModuleMasterID.trim();
    const subKeys = module.submodules.map((s) => getSubKey(mId, s.ModuleMasterSubID));
    if (subKeys.length === 0) return;

    const allSubsSelected = subKeys.every((k) => selectedSubmoduleKeys.has(k));
    const updated = new Set(selectedSubmoduleKeys);

    if (allSubsSelected) {
      subKeys.forEach((k) => updated.delete(k));
    } else {
      subKeys.forEach((k) => updated.add(k));
      updated.add(getSubKey(mId, 0));
    }

    setSelectedSubmoduleKeys(updated);
  };

  // Select / Deselect All Modules in system
  const handleToggleAllModules = () => {
    const allTargetKeys: string[] = [];
    modules.forEach((mod) => {
      const mId = mod.ModuleMasterID.trim();
      allTargetKeys.push(getSubKey(mId, 0));
      mod.submodules.forEach((sub) => {
        allTargetKeys.push(getSubKey(mId, sub.ModuleMasterSubID));
      });
    });

    const allSelected =
      allTargetKeys.length > 0 &&
      allTargetKeys.every((k) => selectedSubmoduleKeys.has(k));

    const updated = new Set(selectedSubmoduleKeys);
    if (allSelected) {
      allTargetKeys.forEach((k) => updated.delete(k));
    } else {
      allTargetKeys.forEach((k) => updated.add(k));
    }
    setSelectedSubmoduleKeys(updated);
  };

  // Toggle Expand / Collapse
  const toggleModuleExpand = (moduleId: string) => {
    const trimmed = moduleId.trim();
    const updated = new Set(expandedModules);
    if (updated.has(trimmed)) updated.delete(trimmed);
    else updated.add(trimmed);
    setExpandedModules(updated);
  };

  const handleToggleExpandAll = () => {
    if (expandedModules.size === modules.length) {
      setExpandedModules(new Set());
    } else {
      setExpandedModules(new Set(modules.map((m) => m.ModuleMasterID.trim())));
    }
  };

  // Save changes for selected user at active company
  const handleSave = async () => {
    if (!selectedUsername) {
      showToast('error', 'Please select a user account.');
      return;
    }

    if (!selectedCompanyID) {
      showToast('error', 'Please select a company.');
      return;
    }

    try {
      setIsSaving(true);

      const payload: UpdateUserModuleAccessPayload = {
        UserID: selectedUsername,
        CompanyIDs: [{ CompanyID: selectedCompanyID }],
        Modules: effectivePayloadModules,
      };

      await masterDataApi.updateUserModuleAccess(payload);

      setOriginalSubmoduleKeys(new Set(selectedSubmoduleKeys));

      // Update assigned companies state
      const updatedAssigned = new Set(assignedCompanyIDs);
      if (effectivePayloadModules.length > 0) {
        updatedAssigned.add(selectedCompanyID);
      } else {
        updatedAssigned.delete(selectedCompanyID);
      }
      setAssignedCompanyIDs(updatedAssigned);

      const compLabel = activeCompany?.CompanyCode || activeCompany?.CompanyName || selectedCompanyID;

      if (effectivePayloadModules.length === 0) {
        showToast(
          'success',
          `All permissions for company "${compLabel}" have been revoked for user "${selectedUsername}".`
        );
      } else {
        showToast(
          'success',
          `Permissions updated successfully for user "${selectedUsername}" at company "${compLabel}"!`
        );
      }
    } catch (err: any) {
      console.error('Failed to save permissions:', err);
      showToast('error', err?.message || 'An error occurred while saving permissions to the database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Companies
  const filteredCompanies = useMemo(() => {
    if (!companySearchText.trim()) return companies;
    const q = companySearchText.toLowerCase();
    return companies.filter(
      (c) =>
        c.CompanyCode?.toLowerCase().includes(q) ||
        c.CompanyName?.toLowerCase().includes(q) ||
        c.CompanyID?.toLowerCase().includes(q)
    );
  }, [companies, companySearchText]);

  // Filtered Modules
  const filteredModules = useMemo(() => {
    if (!moduleSearchText.trim()) return modules;
    const q = moduleSearchText.toLowerCase();
    return modules
      .map((mod) => {
        const matchParent =
          mod.ModuleMasterName.toLowerCase().includes(q) ||
          mod.ModuleMasterID.toLowerCase().includes(q);

        const matchedSubs = mod.submodules.filter(
          (sub) =>
            sub.ModuleMasterName.toLowerCase().includes(q) ||
            String(sub.ModuleMasterSubID).includes(q)
        );

        if (matchParent) return mod;
        if (matchedSubs.length > 0) return { ...mod, submodules: matchedSubs };
        return null;
      })
      .filter(Boolean) as ModuleWithSubmodules[];
  }, [modules, moduleSearchText]);

  const selectedUserObj = users.find((u) => u.userID === selectedUsername);

  if (isInitialLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[450px] gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading system permission data...
        </span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50/60 dark:bg-slate-950 p-4 md:p-6 lg:p-8 flex flex-col gap-5">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 transition-all animate-in fade-in slide-in-from-top-3 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-rose-600 text-white shadow-rose-500/20'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Controls Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              User Access Management
              {hasUnsavedChanges && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse">
                  Unsaved changes
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click a company to view and configure module/submodule access for each user account.
            </p>
          </div>
        </div>

        {/* User Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Select User Account
            </label>
            <div className="relative">
              <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                disabled={isLoadingUserAccess || isSaving}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">-- Select User ({users.length} accounts) --</option>
                {users.map((u) => (
                  <option key={u.userID} value={u.userID}>
                    {u.userID} {u.isAdmin ? '★ Admin' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-end gap-2 pt-5">
            {/* Reset Button */}
            <button
              type="button"
              onClick={handleReset}
              disabled={!selectedUsername || !hasUnsavedChanges || isSaving || isLoadingUserAccess}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Revert to initial state"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={!selectedUsername || !selectedCompanyID || isSaving || isLoadingUserAccess || isLoadingCompanyModules}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Save Changes for active company"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Selected User Info Bar */}
      {selectedUserObj && (
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Configuring Access:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">
              {selectedUserObj.userID}
            </span>
            {selectedUserObj.isAdmin && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold text-[10px]">
                Administrator
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
            <span>
              Active Company:{' '}
              <strong className="text-blue-600 dark:text-blue-400 font-semibold">
                {activeCompany ? `[${activeCompany.CompanyCode || selectedCompanyID}] ${activeCompany.CompanyName || ''}` : selectedCompanyID || 'None'}
              </strong>
            </span>
            <span>
              Authorized Companies:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {assignedCompanyIDs.size} / {companies.length}
              </strong>
            </span>
            <span>
              Modules for Active Company:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {authorizedModulesCount} modules ({authorizedSubmodulesCount} submodules)
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Main 2-Columns Layout */}
      {!selectedUsername ? (
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-500 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No User Selected</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
            Please select a user account from the dropdown above to view and configure company access and module permissions.
          </p>
        </div>
      ) : isLoadingUserAccess ? (
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Loading access permissions for {selectedUsername}...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ============================================================ */}
          {/* TABLE 1: COMPANIES ACCESS */}
          {/* ============================================================ */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Company Access</h2>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Click a company to view & configure authorized modules
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                  {assignedCompanyIDs.size} / {companies.length} authorized
                </span>
              </div>

              {/* Search */}
              <div className="relative pt-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pt-1" />
                <input
                  type="text"
                  value={companySearchText}
                  onChange={(e) => setCompanySearchText(e.target.value)}
                  placeholder="Search company code or name..."
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8.5 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {companySearchText && (
                  <button
                    onClick={() => setCompanySearchText('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pt-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Companies List */}
            <div className="max-h-[580px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCompanies.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No companies found matching your search
                </div>
              ) : (
                filteredCompanies.map((company) => {
                  const cId = company.CompanyID.trim();
                  const isActive = cId === selectedCompanyID;
                  const isAssigned = assignedCompanyIDs.has(cId);

                  return (
                    <div
                      key={cId}
                      onClick={() => handleSelectCompany(cId)}
                      className={`flex items-center gap-3.5 px-4 py-3 cursor-pointer transition-all select-none border-l-4 ${
                        isActive
                          ? 'bg-blue-50/90 dark:bg-blue-950/50 border-l-blue-600 dark:border-l-blue-400 shadow-xs'
                          : 'border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="shrink-0 text-slate-400">
                        {isActive ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs truncate ${isActive ? 'font-bold text-blue-900 dark:text-blue-100' : 'font-semibold text-slate-800 dark:text-slate-100'}`}>
                              {company.CompanyName || company.CompanyCode || cId}
                            </span>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                              {company.CompanyCode || cId}
                            </span>
                          </div>
                          {company.CompanyName && company.CompanyCode && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                              ID: {cId}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isAssigned ? (
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3 h-3" /> Authorized
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              No Access
                            </span>
                          )}

                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* TABLE 2: MODULES & SUBMODULES ACCESS */}
          {/* ============================================================ */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
            {/* Header & Controls */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Module & SubModule Access</h2>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {activeCompany ? (
                        <>
                          Configuring for:{' '}
                          <strong className="text-slate-700 dark:text-slate-200">
                            [{activeCompany.CompanyCode || selectedCompanyID}] {activeCompany.CompanyName || ''}
                          </strong>
                        </>
                      ) : (
                        'Please select a company on the left to configure access'
                      )}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                  {authorizedModulesCount} modules ({authorizedSubmodulesCount} submodules)
                </span>
              </div>

              {/* Search & Actions */}
              <div className="flex items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={moduleSearchText}
                    onChange={(e) => setModuleSearchText(e.target.value)}
                    placeholder="Search module or feature name..."
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8.5 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {moduleSearchText && (
                    <button
                      onClick={() => setModuleSearchText('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleToggleExpandAll}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer shrink-0"
                  title="Expand/Collapse all modules"
                >
                  {expandedModules.size === modules.length ? 'Collapse All' : 'Expand All'}
                </button>

                <button
                  type="button"
                  onClick={handleToggleAllModules}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors cursor-pointer shrink-0"
                >
                  Select All
                </button>
              </div>
            </div>

            {/* Tree View List with Loading State */}
            {isLoadingCompanyModules ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Loading module permissions for {activeCompany?.CompanyCode || selectedCompanyID}...
                </span>
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No modules found matching your search
              </div>
            ) : (
              <div className="max-h-[580px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredModules.map((mod) => {
                  const mId = mod.ModuleMasterID.trim();
                  const isExpanded = expandedModules.has(mId);
                  const hasSubmodules = mod.submodules.length > 0;
                  const parentKey = getSubKey(mId, 0);

                  const isParentChecked =
                    selectedSubmoduleKeys.has(parentKey) ||
                    Array.from(selectedSubmoduleKeys).some((k) => k.startsWith(`${mId}__`));

                  const subKeys = mod.submodules.map((s) => getSubKey(mId, s.ModuleMasterSubID));
                  const selectedSubCount = subKeys.filter((k) => selectedSubmoduleKeys.has(k)).length;
                  const allSubsSelected = subKeys.length > 0 && selectedSubCount === subKeys.length;

                  return (
                    <div key={mId} className="flex flex-col">
                      {/* Parent Module Row */}
                      <div
                        onClick={() => {
                          if (!hasSubmodules) toggleParentModule(mod);
                        }}
                        className={`flex items-center gap-2.5 px-4 py-3 transition-colors select-none ${
                          !hasSubmodules ? 'cursor-pointer' : ''
                        } ${
                          isParentChecked
                            ? 'bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40'
                            : 'bg-slate-50/60 dark:bg-slate-850/60 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        {/* Expand Chevron */}
                        {hasSubmodules ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModuleExpand(mId);
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        ) : (
                          <div className="w-6 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                          </div>
                        )}

                        {/* Parent Checkbox */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleParentModule(mod);
                          }}
                          className="cursor-pointer text-slate-400 shrink-0"
                          title={isParentChecked ? 'Remove module access' : 'Grant module access'}
                        >
                          {isParentChecked ? (
                            <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>

                        {/* Parent Info */}
                        <div
                          onClick={() => {
                            if (hasSubmodules) toggleModuleExpand(mId);
                          }}
                          className="flex-1 min-w-0 flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white">
                              {mod.ModuleMasterName}
                            </span>
                            <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
                              {mId}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {hasSubmodules && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                  {selectedSubCount} / {mod.submodules.length} submodules
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAllSubmodulesOfModule(mod);
                                  }}
                                  className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline px-1.5 py-0.5 rounded cursor-pointer"
                                >
                                  {allSubsSelected ? 'Deselect All Subs' : 'Select All Subs'}
                                </button>
                              </div>
                            )}

                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isParentChecked
                                  ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                                  : 'bg-slate-200/50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {isParentChecked ? 'Authorized' : 'Not Granted'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Submodule Children */}
                      {hasSubmodules && isExpanded && (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/40 bg-white dark:bg-slate-900">
                          {mod.submodules.map((sub) => {
                            const subKey = getSubKey(mId, sub.ModuleMasterSubID);
                            const isSubChecked = selectedSubmoduleKeys.has(subKey);

                            return (
                              <div
                                key={subKey}
                                onClick={() => toggleSubmodule(mId, sub.ModuleMasterSubID)}
                                className={`flex items-center gap-3 pl-12 pr-4 py-2.5 cursor-pointer transition-colors select-none ${
                                  isSubChecked
                                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                }`}
                              >
                                <div className="shrink-0 text-slate-400">
                                  {isSubChecked ? (
                                    <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                      #{sub.ModuleMasterSubID}
                                    </span>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                                      {sub.ModuleMasterName}
                                    </span>
                                  </div>

                                  {isSubChecked && (
                                    <span className="shrink-0 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                                      <Check className="w-3 h-3" /> Granted
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
