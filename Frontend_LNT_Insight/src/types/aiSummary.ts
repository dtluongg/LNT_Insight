export interface DrillDownOption {
    optionId: string;
    optionLabel: string;
    subModuleCode: string;
    params?: Record<string, any>;
}

export interface AiInsightCard {
    insightId: string;
    title: string;
    summaryText: string;
    severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
    moduleCode: string;
    subModuleCode: string;
    drillDownTarget?: DrillDownOption;
}

export interface AiOverviewRequest {
    pageCode?: string;
    companyId?: string;
    siteId?: string;
    sectionId?: number;
    filterDate?: string;
    forceRefresh?: boolean;
}

export interface AiOverviewResponse {
    success: boolean;
    pageCode: string;
    overviewTitle: string;
    rawMarkdown: string;
    insights: AiInsightCard[];
    availableOptions: DrillDownOption[];
    isCached: boolean;
    generatedAt: string;
}

export interface AiDrillDownRequest {
    subModuleCode: string;
    optionId: string;
    companyId?: string;
    siteId?: string;
    sectionId?: number;
    teamId?: number;
    shiftWorkId?: number;
    filterDate?: string;
    forceRefresh?: boolean;
}

export interface AiDrillDownResponse {
    success: boolean;
    subModuleCode: string;
    optionId: string;
    title: string;
    rootCauseAnalysis: string;
    keyHighlights: string[];
    warnings: string[];
    actionItems: string[];
    rawMarkdown: string;
    isCached: boolean;
    generatedAt: string;
}
