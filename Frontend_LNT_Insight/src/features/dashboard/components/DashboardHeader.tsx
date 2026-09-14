import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, ChevronDown, Building2, MapPin, Layers } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { companiesApi } from '../../../core/api/companies';
import type { CompanyInfo, SiteInfo, SectionInfo } from '../../../types';
import type { DashboardFilter } from '../types/TeamSewingFilters';

interface DashboardHeaderProps {
    filter: DashboardFilter;
    onApplyFilter: (filter: DashboardFilter) => void;
    isLoading?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ filter, onApplyFilter, isLoading = false }) => {

    const todayStr = new Date().toLocaleDateString('sv-SE');

    // Master data
    const [companies, setCompanies] = useState<CompanyInfo[]>([]);
    const [sites, setSites] = useState<SiteInfo[]>([]);
    const [sections, setSections] = useState<SectionInfo[]>([]);
    const [searchParams, setSearchParams] = useSearchParams();
    // =========================================================

    // Draft filter
    // Người dùng đang chọn gì trên Header
    // Chỉ Apply khi bấm Refresh
    const [draftFilter, setDraftFilter] =
        useState<DashboardFilter>(filter);
    // =========================================================

    // const [date, setDate] = useState(searchParams.get('date') || todayStr); // set lại không cho chọn quá ngày hôm nay.
    const [latestUpdate, setLatestUpdate] = useState<string>(
        new Date().toLocaleString('vi-VN', { hour12: false })
    );

    // Sync draft khi Dashboard filter thay đổi từ bên ngoài
    useEffect(() => {
        setDraftFilter(filter);
    }, [filter]);
    // =========================================================

    // Load Companies
    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const data = await companiesApi.getCompanies();
                setCompanies(data);
                // Tìm company name tương ứng với ID hiện tại
                const currentCompany = data.find(c => c.CompanyID === draftFilter.CompanyID);
                if (currentCompany) {
                    setDraftFilter(prev => ({
                        ...prev,
                        CompanyName: currentCompany.CompanyName
                    }));
                    // // Đồng bộ lên filter cha ở DashboardPage nếu chưa có tên
                    // if (!filter.companyName) {
                    //     onApplyFilter({
                    //         ...filter,
                    //         companyName: currentCompany.companyName
                    //     });
                    // }
                }
            } catch (err) {
                console.error('Failed to fetch companies', err);
            }
        };
        fetchCompanies();
    }, []);


    // Fetch sites when selected company changes
    useEffect(() => {
        if (!draftFilter.CompanyID) return;
        const fetchSites = async () => {
            try {
                const data = await companiesApi.getSites(draftFilter.CompanyID);
                setSites(data);
                const currentSite = data.find(
                    site =>
                        site.SiteID === draftFilter.SiteID
                );
                if (currentSite) {
                    setDraftFilter(prev => ({
                        ...prev,
                        SiteCode: currentSite.SiteCode
                    }));
                    // Đồng bộ lên filter cha ở DashboardPage nếu chưa có siteCode
                    // if (!filter.siteCode) {
                    //     onApplyFilter({
                    //         ...filter,
                    //         siteCode: currentSite.siteCode
                    //     });
                    // }
                } else {
                    const firstSite = data[0];
                    if (firstSite) {
                        setDraftFilter(prev => ({
                            ...prev,
                            SiteID: firstSite.SiteID,
                            SiteCode: firstSite.SiteCode,
                            SectionID: '',
                            SectionName: ''
                        }));
                    } else {
                        setDraftFilter(prev => ({
                            ...prev,
                            SiteID: '',
                            SiteCode: '',
                            SectionID: '',
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
    }, [draftFilter.CompanyID]);
    // =========================================================

    // Fetch sections when selected company or site changes
    useEffect(() => {
        if (!draftFilter.CompanyID || !draftFilter.SiteID) return;
        const fetchSections = async () => {
            try {
                const data = await companiesApi.getSections(draftFilter.CompanyID, draftFilter.SiteID);
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
    }, [draftFilter.CompanyID, draftFilter.SiteID]);
    // =========================================================
    // Đồng bộ đầy đủ companyName, siteCode, sectionName lên filter cha khi tất cả master data đã sẵn sàng
    useEffect(() => {
        if (companies.length > 0 && sites.length > 0 && sections.length > 0) {
            const currentCompany = companies.find(c => c.CompanyID === filter.CompanyID);
            const currentSite = sites.find(s => s.SiteID === filter.SiteID);
            const currentSection = sections.find(s => String(s.SectionID) === filter.SectionID);
            if (currentCompany && currentSite && currentSection) {
                // Chỉ đồng bộ khi filter cha còn thiếu ít nhất một trường tên
                if (!filter.CompanyName || !filter.SiteCode || !filter.SectionName) {
                    onApplyFilter({
                        ...filter,
                        CompanyName: currentCompany.CompanyName,
                        SiteCode: currentSite.SiteCode,
                        SectionName: currentSection.SectionName
                    });
                }
            }
        }
    }, [companies, sites, sections, filter.CompanyID, filter.SiteID, filter.SectionID]);
    // Handle for Company Change:
    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => { // chưa hiểu hàm này cho lắm
        const companyID = e.target.value;
        const company = companies.find(item => item.CompanyID === companyID);
        setDraftFilter(prev => ({
            ...prev,
            CompanyID: companyID,
            CompanyName: company?.CompanyName || '',
            SiteID: '',
            SiteCode: '',
            SectionID: '0',
            SectionName: ''
        }))
    }
    // =========================================================

    // Handle for Site Change:
    const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => { // chưa hiểu hàm này cho lắm
        const siteID = e.target.value;
        const site = sites.find(item => item.SiteID === siteID);
        setDraftFilter(prev => ({
            ...prev,
            SiteID: siteID,
            SiteCode: site?.SiteCode || '',
            SectionID: '0',
            SectionName: ''
        }))
    }
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
        console.log('draftFilter before apply:', draftFilter);
        onApplyFilter({
            ...draftFilter
        });
        setLatestUpdate(
            new Date().toLocaleString('vi-VN', { hour12: false })
        );
    };
    // =========================================================

    // Options for combobox:

    // companyOptionList:
    const companyOptions = companies.map(co => ({
        value: co.CompanyID,
        label: co.CompanyName
    }));
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
                    <span className="text-xs text-slate-400 font-medium mt-0.5">
                        Latest Update: {latestUpdate}
                    </span>
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
                    <div className="relative flex items-center">
                        <input
                            type="date"
                            value={draftFilter.Date}
                            max={todayStr}
                            onChange={handleDateChange}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[14px] font-semibold text-slate-700 shadow-xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                {/* 2. Company Select */}
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                    <div className="flex items-center gap-1.5 text-slate-700">
                        <Building2 size={13} className="text-slate-600" />
                        <span className="text-[12px] font-bold tracking-wider uppercase">COMPANY</span>
                    </div>
                    <div className="relative">
                        <select
                            value={draftFilter.CompanyID}
                            onChange={handleCompanyChange}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-[14px] font-semibold text-slate-700 shadow-xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer appearance-none"
                        >
                            {companyOptions.map(co => (
                                <option key={co.value} value={co.value}>{co.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* 3. Site Select */}
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

                {/* 4. Section Select */}
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

                {/* 5. Action Button: Refresh */}
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
