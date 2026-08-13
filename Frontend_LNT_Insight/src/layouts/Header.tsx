import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { companiesApi } from '../core/api/companies';
import type { CompanyInfo, SiteInfo } from '../types';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState('2026-08-13');

  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [sites, setSites] = useState<SiteInfo[]>([]);

  const [selectedCompany, setSelectedCompany] = useState(searchParams.get('companyId') || '');
  const [selectedSite, setSelectedSite] = useState(searchParams.get('siteId') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('departmentId') || 'DEP05');

  // Hardcoded departments for now
  const deptOptions = [
    { value: 'DEP01', label: 'Department 01' },
    { value: 'DEP02', label: 'Department 02' },
    { value: 'DEP03', label: 'Department 03' },
    { value: 'DEP04', label: 'Department 04' },
    { value: 'DEP05', label: 'Department 05' },
  ];

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await companiesApi.getCompanies();
        setCompanies(data);
        if (data.length > 0 && !selectedCompany) {
          setSelectedCompany(data[0].companyID);
        }
      } catch (err) {
        console.error('Failed to fetch companies', err);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch sites when selected company changes
  useEffect(() => {
    if (!selectedCompany) return;
    const fetchSites = async () => {
      try {
        const data = await companiesApi.getSites(selectedCompany);
        setSites(data);
        if (data.length > 0) {
          const hasCurrentSite = data.some(s => s.siteID === selectedSite);
          if (!hasCurrentSite) {
            setSelectedSite(data[0].siteID);
          }
        } else {
          setSelectedSite('');
        }
      } catch (err) {
        console.error('Failed to fetch sites', err);
      }
    };
    fetchSites();
  }, [selectedCompany]);

  // Sync state if URL search parameters change externally
  useEffect(() => {
    const urlCompany = searchParams.get('companyId');
    const urlSite = searchParams.get('siteId');
    const urlDept = searchParams.get('departmentId');

    if (urlCompany) setSelectedCompany(urlCompany);
    if (urlSite) setSelectedSite(urlSite);
    if (urlDept) setSelectedDept(urlDept);
  }, [searchParams]);

  const handleSearch = () => {
    if (selectedCompany && selectedSite) {
      setSearchParams({
        companyId: selectedCompany,
        siteId: selectedSite,
        departmentId: selectedDept,
        date: date
      });
    }
  };

  const companyOptions = companies.map(c => ({ value: c.companyID, label: c.companyName }));
  const siteOptions = sites.map(s => ({ value: s.siteID, label: s.siteName }));


  return (
    <header className="bg-white border-b border-slate-100 px-8 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
      {/* Title info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
          <div className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 text-xs flex items-center justify-center font-semibold cursor-help select-none">
            i
          </div>
        </div>
        <span className="text-xs text-slate-400 mt-1">Latest Update: 13/08/2025 11:21</span>
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

        {/* Department Select */}
        <Select
          label="Department"
          options={deptOptions}
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            className="h-10 px-4 flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-xs text-white"
          >
            <Search size={16} />
            Find
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
