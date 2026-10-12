import { apiFetch } from './httpClient';
import type { AiBatchRequest, AiBatchResponse } from '../../types/aiSummary';

export async function batchGenerate(payload: AiBatchRequest): Promise<AiBatchResponse> {
    return await apiFetch<AiBatchResponse>('/v1/ai/batch-generate', {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

export const aiSummaryApi = {
    batchGenerate
};

export default aiSummaryApi;
