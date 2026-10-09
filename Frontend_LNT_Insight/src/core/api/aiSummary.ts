import { apiFetch } from './httpClient';
import type {
    AiOverviewRequest,
    AiOverviewResponse,
    AiDrillDownRequest,
    AiDrillDownResponse
} from '../../types/aiSummary';

export const aiSummaryApi = {
    getOverview: async (payload: AiOverviewRequest = {}): Promise<AiOverviewResponse> => {
        return await apiFetch<AiOverviewResponse>('/v1/ai/overview', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    getDrillDown: async (payload: AiDrillDownRequest): Promise<AiDrillDownResponse> => {
        return await apiFetch<AiDrillDownResponse>('/v1/ai/drill-down', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
};
