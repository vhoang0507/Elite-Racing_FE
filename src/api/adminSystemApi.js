import { apiRequest } from './httpClient';

async function getSystemTime() {
    return apiRequest('/admin/system/time');
}

async function overrideSystemTime(payload) {
    return apiRequest('/admin/system/time/override', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

async function advanceSystemTime(payload) {
    return apiRequest('/admin/system/time/advance', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

async function clearSystemTimeOverride() {
    return apiRequest('/admin/system/time/override', {
        method: 'DELETE',
    });
}

async function syncTimeStatuses() {
    return apiRequest('/admin/system/sync-time-statuses', {
        method: 'POST',
    });
}

export const adminSystemApi = {
    getSystemTime,
    overrideSystemTime,
    advanceSystemTime,
    clearSystemTimeOverride,
    syncTimeStatuses,
};
