import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, ChevronDown, MapPin, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../app/providers/AuthProvider';
import { companiesApi } from '../../../core/api/companies';
// import { getPreviousWorkingDayClient } from '../../../utils/dateUtils';
import { getNextWorkingDay, getPreviousWorkingDay } from '../utils/dateUtils';
import type { SiteInfo, SectionInfo } from '../../../types';
import type { DashboardFilter } from '../types/TeamSewingFilters';

interface DashboardHeaderProps {
    filter: DashboardFilter;
    onApplyFilter: (filter: DashboardFilter) => void;
    isLoading?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ filter, onApplyFilter, isLoading = false }) => {

    const todayStr = new Date().toLocaleDateString('sv-SE');
    const { selectedCompanyID } = useAuth();

    // Master data
    const [sites, setSites] = useState<SiteInfo[]>([]);
    const [sections, setSections] = useState<SectionInfo[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    // =========================================================

    // Draft filter
    // Người dùng đang chọn gì trên Header
    // Chỉ Apply khi bấm Refresh
    const [draftFilter, setDraftFilter] = useState<DashboardFilter>({
        ...filter,
        CompanyID: selectedCompanyID || filter.CompanyID
    });
    // =========================================================

    const [latestUpdate, setLatestUpdate] = useState<string>(
        new Date().toLocaleString('vi-VN', { hour12: false })
    );

    // Sync draft khi Dashboard filter thay đổi từ bên ngoài
    useEffect(() => {
        setDraftFilter(prev => ({
            ...filter,
            CompanyID: selectedCompanyID || filter.CompanyID
        }));
    }, [filter, selectedCompanyID]);

    // Đồng bộ draftFilter.CompanyID khi selectedCompanyID trên Header tổng thay đổi
    useEffect(() => {
        if (selectedCompanyID && selectedCompanyID !== draftFilter.CompanyID) {
            setDraftFilter(prev => ({
                ...prev,
                CompanyID: selectedCompanyID
            }));
        }
    }, [selectedCompanyID]);
    // =========================================================

    // Fetch sites when selected company changes
    useEffect(() => {
        const companyID = draftFilter.CompanyID || selectedCompanyID;
        if (!companyID) return;
        const fetchSites = async () => {
            try {
                const data = await companiesApi.getSites(companyID);
                setSites(data);
                const currentSite = data.find(
                    site => site.SiteID === draftFilter.SiteID
                );
                if (currentSite) {
                    setDraftFilter(prev => ({
                        ...prev,
                        SiteCode: currentSite.SiteCode
                    }));
                } else {
                    const firstSite = data[0];
                    if (firstSite) {
                        setDraftFilter(prev => ({
                            ...prev,
                            SiteID: firstSite.SiteID,
                            SiteCode: firstSite.SiteCode,
                            SectionID: '0',
                            SectionName: ''
                        }));
                    } else {
                        setDraftFilter(prev => ({
                            ...prev,
                            SiteID: '',
                            SiteCode: '',
                            SectionID: '0',
                            SectionName: ''
                        }));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch sites', err);
                setSites([]);
            }
        };
        fetchSites();
    }, [draftFilter.CompanyID, selectedCompanyID]);
    // =========================================================

    // Fetch sections when selected company or site changes
    useEffect(() => {
        const companyID = draftFilter.CompanyID || selectedCompanyID;
        if (!companyID || !draftFilter.SiteID) return;
        const fetchSections = async () => {
            try {
                const data = await companiesApi.getSections(companyID, draftFilter.SiteID);
                setSections(data);

                // Nếu SectionID đang là '0', giữ nguyên trạng thái ô trắng
                if (draftFilter.SectionID === '0' || !draftFilter.SectionID) {
                    setDraftFilter(prev => ({
                        ...prev,
                        SectionID: '0',
                        SectionName: ''
                    }));
                    return;
                }

                const currentSection = data.find(
                    section => String(section.SectionID) === draftFilter.SectionID
                );

                if (currentSection) {
                    setDraftFilter(prev => ({
                        ...prev,
                        SectionName: currentSection.SectionName
                    }));
                } else {
                    // Nếu SectionID cũ không thuộc Site mới, reset về ô trắng (value = '0')
                    setDraftFilter(prev => ({
                        ...prev,
                        SectionID: '0',
                        SectionName: ''
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch sections', err);
                setSections([]);
            }
        };
        fetchSections();
    }, [draftFilter.CompanyID, draftFilter.SiteID, selectedCompanyID]);
    // =========================================================

    // Handle for Site Change:
    const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const siteID = e.target.value;
        const site = sites.find(item => item.SiteID === siteID);
        setDraftFilter(prev => ({
            ...prev,
            SiteID: siteID,
            SiteCode: site?.SiteCode || '',
            SectionID: '0',
            SectionName: ''
        }));
    };
    // =========================================================

    // Handle for Section Change:
    const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sectionID = e.target.value;
        const section = sections.find(item => String(item.SectionID) === sectionID);
        setDraftFilter(prev => ({
            ...prev,
            SectionID: sectionID,
            SectionName: sectionID === '0' ? 'All' : (section?.SectionName || '')
        }));
    };
    // =========================================================

    const prevWorkingDay = getPreviousWorkingDay(draftFilter.Date);

    const handleJumpToPreviousDay = () => {
        const prevDate = prevWorkingDay;
        if (!prevDate) return;
        const newFilter = {
            ...draftFilter,
            Date: prevDate
        };
        setDraftFilter(newFilter);
        onApplyFilter(newFilter);
        setLatestUpdate(
            new Date().toLocaleString('vi-VN', { hour12: false })
        );
    };

    // =========================================================
    const nextWorkingDay = getNextWorkingDay(draftFilter.Date);

    const handleJumpToNextWorkingDay = () => {
        const nextDate = nextWorkingDay;
        if(!nextDate) return;
        const newFilter = {
            ...draftFilter,
            Date: nextDate
        };
        setDraftFilter(newFilter);
        onApplyFilter(newFilter);
        setLatestUpdate(
            new Date().toLocaleString('vi-VN', { hour12: false })
        );
    };

    // Date change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDraftFilter(prev => ({
            ...prev,
            Date: e.target.value
        }));
    };
    // =========================================================

    // Apply filter:
    const handleSearch = () => {
        if (!draftFilter.CompanyID || !draftFilter.SiteID || draftFilter.SectionID === '' || !draftFilter.Date) {
            return;
        }
        onApplyFilter({
            ...draftFilter
        });
        setLatestUpdate(
            new Date().toLocaleString('vi-VN', { hour12: false })
        );
    };
    // =========================================================

    // siteOptionList:
    const siteOptions = sites.map(si => ({
        value: si.SiteID,
        label: si.SiteCode
    }));
    // =========================================================

    // sectionOptionList:
    const sectionOptions = [
        { value: '0', label: 'All' },
        ...sections.map(se => ({
            value: se.SectionID,
            label: se.SectionName
        }))
    ];
    // =========================================================

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs px-4 py-2 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 shrink-0">
            {/* Title info with Sewing Machine Icon */}
            <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sky-100/70 border border-sky-200/50 flex items-center justify-center shrink-0 shadow-xs">
                    <svg
                        className="w-6 h-6 text-sky-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {/* Bàn máy may */}
                        <path d="M2 19h20" />
                        <path d="M4 19v-2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2" />
                        {/* Thân & cần máy */}
                        <path d="M18 16V8a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v8" />
                        <path d="M4 11h9a2 2 0 0 1 2 2v3" />
                        {/* Ống chỉ */}
                        <circle cx="16" cy="5" r="1.2" fill="currentColor" />
                        {/* Kim may */}
                        <line x1="7" y1="11" x2="7" y2="15" />
                        <circle cx="7" cy="15.5" r="0.5" fill="currentColor" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                        Sewing Team Performance
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 font-medium">
                            Latest Update: {latestUpdate}
                        </span>
                        
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Previous Day Comparison: {prevWorkingDay}
                        </span>
                        <button
                            type="button"
                            onClick={handleJumpToPreviousDay}
                            disabled={isLoading}
                            title={`Load Previous Working Day (${prevWorkingDay})`}
                            className="h-full py-0.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 flex items-center gap-1 text-[13px] font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 shrink-0"
                        >
                            <ChevronLeft size={16} className="text-slate-600" />
                        </button>
                        <button
                            type="button"
                            onClick={handleJumpToNextWorkingDay}
                            disabled={isLoading}
                            title={`Load Next Working Day (${nextWorkingDay})`}
                            className="h-full py-0.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 flex items-center gap-1 text-[13px] font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 shrink-0"
                        >
                            <ChevronRight size={16} className="text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters & Actions Form */}
            <div className="flex flex-wrap items-end gap-3">
                {/* 1. Date Input */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar size={13} className="text-slate-600" />
                        <span className="text-[12px] font-bold tracking-wider uppercase">DAY</span>
                    </div>
                    <div className="relative flex items-center gap-1.5">
                        {/* <button
                            type="button"
                            onClick={handleJumpToPreviousDay}
                            disabled={isLoading}
                            title={`Load Previous Working Day (${prevWorkingDay})`}
                            className="h-10 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 flex items-center gap-1 text-[13px] font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 shrink-0"
                        >
                            <ChevronLeft size={16} className="text-slate-600" />
                        </button> */}
                        <input
                            type="date"
                            value={draftFilter.Date}
                            max={todayStr}
                            onChange={handleDateChange}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-700 shadow-xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                        />
                        {/* <button
                            type="button"
                            onClick={handleJumpToNextWorkingDay}
                            disabled={isLoading}
                            title={`Load Next Working Day (${nextWorkingDay})`}
                            className="h-10 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700 flex items-center gap-1 text-[13px] font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 shrink-0"
                        >
                            <ChevronRight size={16} className="text-slate-600" />
                        </button> */}
                    </div>
                </div>

                {/* 2. Site Select */}
                <div className="flex flex-col gap-1.5 min-w-[130px]">
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin size={13} className="text-slate-600" />
                        <span className="text-[12px] font-bold tracking-wider uppercase">SITE</span>
                    </div>
                    <div className="relative">
                        <select
                            value={draftFilter.SiteID}
                            onChange={handleSiteChange}
                            disabled={siteOptions.length === 0}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-[14px] font-semibold text-slate-700 shadow-xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none disabled:bg-slate-50 disabled:opacity-60"
                        >
                            {siteOptions.map(si => (
                                <option key={si.value} value={si.value}>{si.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* 3. Section Select */}
                <div className="flex flex-col gap-1.5 min-w-[110px]">
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <Layers size={13} className="text-slate-600" />
                        <span className="text-[12px] font-bold tracking-wider uppercase">SECTION</span>
                    </div>
                    <div className="relative">
                        <select
                            value={draftFilter.SectionID}
                            onChange={handleSectionChange}
                            disabled={sectionOptions.length === 0}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-[14px] font-semibold text-slate-700 shadow-xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none disabled:bg-slate-50 disabled:opacity-60"
                        >
                            {sectionOptions.map(se => (
                                <option key={se.value} value={se.value}>{se.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* 4. Action Button: Refresh */}
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={isLoading}
                    title="Refresh data"
                    className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>
    );
};
