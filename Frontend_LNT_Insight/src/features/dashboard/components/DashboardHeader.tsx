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

    const [date, setDate] = useState(searchParams.get('date') || todayStr); // set lại không cho chọn quá ngày hôm nay.
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
            } catch (err) {
                console.error('Failed to fetch companies', err);
            }
        };
        fetchCompanies();
    }, []);

    // Fetch sites when selected company changes
    useEffect(() => {
        if (!draftFilter.companyID) return;
        const fetchSites = async () => {
            try {
                const data = await companiesApi.getSites(draftFilter.companyID);
                setSites(data);
                const currentSite = data.find(
                    site =>
                        site.siteID === draftFilter.siteID
                );
                if (!currentSite) {
                    const firstSite = data[0];
                    if (firstSite) {
                        setDraftFilter(prev => ({
                            ...prev,

                            siteID: firstSite.siteID,
                            siteCode: firstSite.siteCode,
                            sectionID: '',
                            sectionName: ''
                        }));
                    } else {
                        setDraftFilter(prev => ({
                            ...prev,

                            siteID: '',
                            siteCode: '',
                            sectionID: '',
                            sectionName: ''
                        }));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch sites', err);
                setSites([]);
            }
        };
        fetchSites();
    }, [draftFilter.companyID]);
    // =========================================================


    // Fetch sections when selected company or site changes
    useEffect(() => {
        if (!draftFilter.companyID || !draftFilter.siteID) return;
        const fetchSections = async () => {
            try {
                const data = await companiesApi.getSections(draftFilter.companyID, draftFilter.siteID);
                setSections(data);
                const currentSection = data.find(
                    section =>
                        section.sectionID === draftFilter.sectionID
                );

                if (!currentSection) {
                    const firstSection = data[0];
                    if (firstSection) {
                        setDraftFilter(prev => ({
                            ...prev,
                            sectionID: firstSection.sectionID,
                            sectionName: firstSection.sectionName
                        }))
                    } else {
                        setDraftFilter(prev => ({
                            ...prev,
                            sectionID: '',
                            sectionName: ''
                        }))
                    }
                }
            } catch (err) {
                console.error('Failed to fetch sections', err);
                setSections([]);
            }
        };
        fetchSections();
    }, [draftFilter.companyID, draftFilter.sectionID]);

    // Sync state if URL search parameters change externally
    useEffect(() => {
        const urlCompany = searchParams.get('companyId');
        const urlSite = searchParams.get('siteId');
        const urlSection = searchParams.get('sectionId');
        const urlDate = searchParams.get('date');

        if (urlCompany) setSelectedCompany(urlCompany);
        if (urlSite) setSelectedSite(urlSite);
        if (urlSection) setSelectedSection(urlSection);
        if (urlDate) setDate(urlDate);
    }, [searchParams]);

    const handleSearch = () => {
        if (selectedCompany && selectedSite && selectedSection) {
            setSearchParams({
                companyId: selectedCompany,
                siteId: selectedSite,
                sectionId: selectedSection,
                date: date,
                _t: Date.now().toString()
            });
            setLatestUpdate(new Date().toLocaleString('vi-VN', { hour12: false }));
        }
    };

    const companyOptions = companies.map(c => ({ value: c.companyID, label: c.companyName }));
    const siteOptions = sites.map(s => ({ value: s.siteID, label: s.siteCode }));
    const sectionOptions = sections.map(se => ({ value: se.sectionID, label: se.sectionName }));

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
            <div className="flex flex-wrap items-end gap-3">
                {/* Date Input */}
                <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Day</span>
                    <div className="relative flex items-center">
                        <Calendar size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                        <input
                            type="date"
                            value={date}
                            max={todayStr}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-10 rounded-lg border border-slate-200 pl-10 pr-3 text-sm font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-xs"
                        />
                    </div>
                </div>

                {/* Company Select */}
                <Select
                    label="Company"
                    options={companyOptions}
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                />

                {/* Site Select */}
                <Select
                    label="Site"
                    options={siteOptions}
                    value={selectedSite}
                    onChange={(e) => setSelectedSite(e.target.value)}
                    disabled={siteOptions.length === 0}
                />

                {/* Section Select */}
                <Select
                    label="Section"
                    options={sectionOptions}
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
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

                    <Button variant="secondary" className="h-10 px-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-xs">
                        <Download size={16} />
                        Export file
                    </Button>
                </div>
            </div>
        </header>
    );
};
