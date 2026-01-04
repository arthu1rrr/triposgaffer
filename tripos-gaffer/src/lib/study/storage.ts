import {SCHEMA_VERSION_LATEST, type StudyStateV1} from "./types";

const KEY = 'tripos-gaffer:study';

export function defaultState(): StudyStateV1 {
    return {
        schemaVersion: SCHEMA_VERSION_LATEST,
        course: null,
        modules: [],
        lectures: [],
    };
}

export function loadState(): StudyStateV1 {
    if (typeof window === 'undefined') {
        return defaultState();
    }

    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) {
            return defaultState();
        }
        const parsed = JSON.parse(raw) as StudyStateV1;
        if (parsed.schemaVersion !== SCHEMA_VERSION_LATEST) {
            // Handle migrations here in future versions
            return defaultState();
        }
        return parsed;
    } catch (e) {
        console.error('Failed to load study state from localStorage', e);
        return defaultState();
    }
}

export function saveState(state: StudyStateV1): void {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(KEY, JSON.stringify(state));
}