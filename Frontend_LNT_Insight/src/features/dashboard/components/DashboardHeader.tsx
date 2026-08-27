import React, { useState, useEffect } from 'react';
import { Download, Calendar, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { companiesApi } from '../../../core/api/companies';
import type { CompanyInfo, SiteInfo, SectionInfo } from '../../../types';
import type { DashboardFilter } from '../types/TeamSewingFilters';

interface DashboardHeaderProps {
    filter: DashboardFilter,
    onApplyFilter: (filter: DashboardFilter) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ filter, onApplyFilter }) => {

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
                const currentSection = data.find(
                    section =>
                        String(section.SectionID) === draftFilter.SectionID
                );
                if (currentSection) {
                    setDraftFilter(prev => ({
                        ...prev,
                        SectionName: currentSection.SectionName
                    }));
                    // Đồng bộ lên filter cha ở DashboardPage nếu chưa có sectionName
                    // if (!filter.sectionName) {
                    //     onApplyFilter({
                    //         ...filter,
                    //         sectionName: currentSection.sectionName
                    //     });
                    // }
                } else {
                    const firstSection = data[0];
                    if (firstSection) {
                        setDraftFilter(prev => ({
                            ...prev,
                            SectionID: String(firstSection.SectionID),
                            SectionName: firstSection.SectionName
                        }))
                    } else {
                        setDraftFilter(prev => ({
                            ...prev,
                            SectionID: '',
                            SectionName: ''
                        }))
                    }
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
            SectionID: '',
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
            SectionID: '',
            SectionName: ''
        }))
    }
    // =========================================================

    // Handle for Section Change:
    const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => { // chưa hiểu hàm này cho lắm
        const sectionID = e.target.value;
        const section = sections.find(item => item.SectionID === sectionID);
        setDraftFilter(prev => ({
            ...prev,
            SectionID: sectionID,
            SectionName: section?.SectionName || ''
        }))
    }
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
        if (!draftFilter.CompanyID || !draftFilter.SiteID || !draftFilter.SectionID || !draftFilter.Date) {
            return;
        }
        console.log('draftFilter before apply:', draftFilter);
        onApplyFilter({
            ...draftFilter // không hiểu lắm
        });
        setLatestUpdate(
            new Date().toLocaleString('vi-VN', { hour12: false })
        );
    }
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
    const sectionOptions = sections.map(se => ({
        value: se.SectionID,
        label: se.SectionName
    }));
    // =========================================================

    return (
        <header className="bg-white border-b border-slate-100 px-8 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
            {/* Title info */}
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                        Sewing Team Performance
                    </h1>
                    <div className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 text-xs flex items-center justify-center font-semibold cursor-help select-none">
                        i
                    </div>
                </div>
                <span className="text-xs text-slate-400 mt-1">Latest Update: {latestUpdate}</span>
            </div>

            {/* Filters & Actions */}
            <div className="flex items-end gap-3">
                {/* Date Input */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Day</span>
                    <div className="relative flex items-center">
                        <Calendar size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                        <input
                            type="date"
                            value={draftFilter.Date}
                            max={todayStr}
                            onChange={handleDateChange}
                            className="h-10 rounded-lg border border-slate-200 pl-10 pr-3 text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-xs"
                        />
                    </div>
                </div>

                {/* Company Select */}
                <Select
                    label="Company"
                    options={companyOptions}
                    value={draftFilter.CompanyID}
                    onChange={handleCompanyChange}
                />

                {/* Site Select */}
                <Select
                    label="Site"
                    options={siteOptions}
                    value={draftFilter.SiteID}
                    onChange={handleSiteChange}
                    disabled={siteOptions.length === 0}
                />

                {/* Section Select */}
                <Select
                    label="Section"
                    options={sectionOptions}
                    value={draftFilter.SectionID}
                    onChange={handleSectionChange}
                    disabled={sectionOptions.length === 0}
                />

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleSearch}
                        className="h-10 px-4 flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-xs text-white"
                    >
                        <RefreshCw size={20} />
                    </Button>

                    {/* <Button variant="secondary" className="h-10 px-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs">
                        <Download size={16} />
                        Export file
                    </Button> */}
                </div>
            </div>
        </header>
    );
};
