export type AiSeverity = 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';

export interface AiCardItem {
    id: string;        // e.g. "card_production", "card_defect", "card_shift"
    prompt?: string;   // Optional override instruction; if omitted, backend reads from appsettings.json
    data?: any;        // Real SP query data passed by user
}

export type AiLanguage = 'vi' | 'en' | 'si';

export interface AiBatchRequest {
    cacheKey?: string;
    forceRefresh?: boolean;
    language?: AiLanguage;
    items: AiCardItem[];
}

export interface AiCardTranslation {
    title: string;
    summary: string;
}

export interface AiCardResult {
    title: string;
    summary: string;
    severity: AiSeverity;
    translations?: Record<string, AiCardTranslation>;
}

export interface AiBatchResponse {
    success: boolean;
    errorMessage?: string;
    results: Record<string, AiCardResult>;
    isCached: boolean;
    generatedAt: string;
}
