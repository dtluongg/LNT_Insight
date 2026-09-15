import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardHeader } from '../components/DashboardHeader';
import { StatCardsGrid } from '../components/StatCardsGrid';
import { SectionPerformanceOverview } from '../components/SectionPerformanceOverview';
import { ProductionChartSection } from '../components/ProductionChartSection';
import { KeyInsightsSection } from '../components/KeyInsightsSection';

import { TeamProductionDetailModal } from '../components/TeamProductionDetailModal';
import { OverallDefectDetailModal } from '../components/OverallDefectDetailModal';
import { ProductionOutputTableModal } from '../components/ProductionOutputTableModal';

import { companiesApi } from '../../../core/api/companies';
import { calculateTrend } from '../../../utils/dateUtils';
import type { SewingTeamSummay, SewingTeamDetail } from '../../../types';
import type { DashboardFilter } from '../types/TeamSewingFilters';

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const todayStr = useMemo(() => new Date().toLocaleDateString('sv-SE'), []);

  // Dashboard Filter State
  const [filter, setFilter] = useState<DashboardFilter>({
    CompanyID: searchParams.get('companyId') || searchParams.get('CompanyId') || 'COM01',
    CompanyName: '',
    SiteID: searchParams.get('siteId') || searchParams.get('SiteId') || 'Site1',
    SiteCode: '',
    SectionID: searchParams.get('sectionId') || searchParams.get('SectionId') || '0',
    SectionName: '',
    Date: searchParams.get('date') || searchParams.get('Date') || todayStr,
  });

  const [productionData, setProductionData] = useState<SewingTeamDetail[]>([]);
  const [filterProductionData, setFilterProductionData] = useState<any[]>([]);
  const [dataSewingTeamSummary, setDataSewingTeamSummary] = useState<SewingTeamSummay[]>([]);
  const [prevDataSewingTeamSummary, setPrevDataSewingTeamSummary] = useState<SewingTeamSummay[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedProduction, setSelectedProduction] = useState<SewingTeamDetail | null>(null);
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);

  // Load Dashboard Data
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const dateObj = new Date(filter.Date);
        const prevDateStr = await companiesApi.getPreviousWorkingDay(filter.CompanyID, filter.SiteID, filter.Date);
        const prevDateObj = new Date(prevDateStr);

        const [prodResult, summaryResult, prevSummaryResult] = await Promise.all([
          companiesApi.getTeamSewingDetail(filter.CompanyID, filter.SiteID, Number(filter.SectionID), dateObj),
          companiesApi.getTeamSewingSummary(filter.CompanyID, filter.SiteID, Number(filter.SectionID), dateObj),
          companiesApi.getTeamSewingSummary(filter.CompanyID, filter.SiteID, Number(filter.SectionID), prevDateObj)
        ]);

        if (!isMounted) return;

        setProductionData(prodResult);
        setDataSewingTeamSummary(summaryResult);
        setPrevDataSewingTeamSummary(prevSummaryResult);

        // Calculate summary grouping for sections safely
        const datafilter = prodResult.reduce((acc, cur) => {
          const dataGroup = cur.SectionID;
          if (!acc[dataGroup]) {
            acc[dataGroup] = {
              DayTargetTotal: 0,
              DayOutputTotal: 0,
              DayPercent: 0
            };
          }
          acc[dataGroup].DayTargetTotal += cur.DayTarget ?? 0;
          acc[dataGroup].DayOutputTotal += cur.DayOutput ?? 0;

          const totalTarget = acc[dataGroup].DayTargetTotal;
          const totalOutput = acc[dataGroup].DayOutputTotal;
          acc[dataGroup].DayPercent = totalTarget > 0 ? (totalOutput / totalTarget) * 100 : 0;

          return acc;
        }, {} as Record<number, any>);

        const mapDataFilter = Object.keys(datafilter).map(keyObj => ({
          SectionID: keyObj,
          ...datafilter[Number(keyObj)]
        }));

        setFilterProductionData(mapDataFilter);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        if (isMounted) {
          setProductionData([]);
          setDataSewingTeamSummary([]);
          setPrevDataSewingTeamSummary([]);
          setFilterProductionData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (filter.CompanyID && filter.SiteID && filter.SectionID && filter.Date) {
      fetchData();
    }
    return () => { isMounted = false; };
  }, [filter.CompanyID, filter.SiteID, filter.SectionID, filter.Date]);

  // Apply Filter callback from DashboardHeader
  const handleApplyFilter = useCallback((newFilter: DashboardFilter) => {
    setFilter(newFilter);
    setSearchParams({
      companyId: newFilter.CompanyID,
      siteId: newFilter.SiteID,
      sectionId: newFilter.SectionID,
      date: newFilter.Date,
    });
  }, [setSearchParams]);

  // Derived KPI Calculations
  const stats = useMemo(() => {
    const totalOutput = dataSewingTeamSummary[0]?.DayOutput ?? 0;
    const totalTarget = dataSewingTeamSummary[0]?.DayTarget ?? 0;
    const achievementRate = totalTarget > 0 ? (totalOutput / totalTarget) * 100 : 0;
    const inspection = dataSewingTeamSummary[0]?.InspectedQty ?? 0;
    const defect = dataSewingTeamSummary[0]?.DefectQty ?? 0;
    const defectRate = dataSewingTeamSummary[0]?.DefectRate ?? 0;
    const defectGMT = `${defect}/${defectRate}%`;

    const prevOutput = prevDataSewingTeamSummary[0]?.DayOutput ?? 0;
    const prevTarget = prevDataSewingTeamSummary[0]?.DayTarget ?? 0;
    const prevAchievementRate = prevTarget > 0 ? (prevOutput / prevTarget) * 100 : 0;
    const prevInspection = prevDataSewingTeamSummary[0]?.InspectedQty ?? 0;
    const prevDefectRate = prevDataSewingTeamSummary[0]?.DefectRate ?? 0;

    const targetTrend = calculateTrend(totalTarget, prevTarget);
    const outputTrend = calculateTrend(totalOutput, prevOutput);
    const rateTrend = calculateTrend(achievementRate, prevAchievementRate, true);
    const qualityTrend = calculateTrend(inspection, prevInspection);
    const defectTrend = calculateTrend(defectRate, prevDefectRate, true);

    return {
      totalOutput,
      totalTarget,
      achievementRate,
      inspection,
      defect,
      defectRate,
      defectGMT,
      targetTrend,
      outputTrend,
      rateTrend,
      qualityTrend,
      defectTrend,
    };
  }, [dataSewingTeamSummary, prevDataSewingTeamSummary]);

  // Key Insights Derived Calculations
  const highestTeam = useMemo(() => {
    if (productionData.length === 0) return null;
    return [...productionData].sort((a, b) => (b.DayOutput ?? 0) - (a.DayOutput ?? 0))[0];
  }, [productionData]);

  const highestContrib = useMemo(() => {
    if (stats.totalOutput > 0 && highestTeam?.DayOutput) {
      return ((highestTeam.DayOutput / stats.totalOutput) * 100).toFixed(1);
    }
    return '0.0';
  }, [stats.totalOutput, highestTeam]);

  // Modal Handlers
  const handleOpenDefectModal = useCallback(() => setIsDefectModalOpen(true), []);
  const handleCloseDefectModal = useCallback(() => setIsDefectModalOpen(false), []);

  const handleOpenTableModal = useCallback(() => setIsTableModalOpen(true), []);
  const handleCloseTableModal = useCallback(() => setIsTableModalOpen(false), []);

  const handleSelectProduction = useCallback((item: SewingTeamDetail) => {
    setSelectedProduction(item);
  }, []);
  const handleCloseProductionModal = useCallback(() => setSelectedProduction(null), []);

  return (
    <div className="space-y-2">
      {/* Header */}
      <DashboardHeader
        filter={filter}
        onApplyFilter={handleApplyFilter}
        isLoading={loading}
      />

      {loading && productionData.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Loading production dashboard...</span>
          </div>
        </div>
      ) : (
        <div className={`space-y-2 transition-opacity duration-200 ${loading ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}>
          {/* 5 KPI Cards */}
          <StatCardsGrid
            totalTarget={stats.totalTarget}
            totalOutput={stats.totalOutput}
            achievementRate={stats.achievementRate}
            inspection={stats.inspection}
            defectGMT={stats.defectGMT}
            defectRate={stats.defectRate}
            targetTrend={stats.targetTrend}
            outputTrend={stats.outputTrend}
            rateTrend={stats.rateTrend}
            qualityTrend={stats.qualityTrend}
            defectTrend={stats.defectTrend}
            onOpenDefectModal={handleOpenDefectModal}
          />

          {/* Section Performance Overview */}
          <SectionPerformanceOverview
            filterProductionData={filterProductionData}
          />

          {/* Production Output Chart */}
          <ProductionChartSection
            productionData={productionData}
            onOpenTableModal={handleOpenTableModal}
            onSelectProduction={handleSelectProduction}
          />

          {/* Key Insights */}
          <KeyInsightsSection
            highestTeam={highestTeam}
            highestContrib={highestContrib}
            outputTrend={stats.outputTrend}
            rateTrend={stats.rateTrend}
            defectTrend={stats.defectTrend}
          />
        </div>
      )}

      {/* Modals */}
      <ProductionOutputTableModal
        open={isTableModalOpen}
        filter={filter}
        data={productionData}
        onClose={handleCloseTableModal}
      />
      {selectedProduction !== null && (
        <TeamProductionDetailModal
          open={true}
          filter={filter}
          production={selectedProduction}
          onClose={handleCloseProductionModal}
        />
      )}
      {isDefectModalOpen && (
        <OverallDefectDetailModal
          open={true}
          filter={filter}
          onClose={handleCloseDefectModal}
          inspectedQty={stats.inspection}
          defectQty={stats.defect}
          defectRate={stats.defectRate}
        />
      )}
    </div>
  );
};
