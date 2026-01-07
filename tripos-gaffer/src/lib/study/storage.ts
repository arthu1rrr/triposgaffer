import {SCHEMA_VERSION_LATEST, type StudyStateV2} from "./types";
import { isValidLectureId, isValidModuleId, isValidCourseId } from "@/lib/catalog";

const KEY = 'tripos-gaffer:study';

export function defaultState(): StudyStateV2 {
    return {
        schemaVersion: SCHEMA_VERSION_LATEST,
        selectedCourseId: null,
        completedLectureIds: {},
        lectureMinutesOverride: {},
        moduleRatings: {},
        tasks: [],
    };
}

function reconcileWithCatalog(state: StudyStateV2): StudyStateV2 { //removes invalid ids when catalog changes
  const next: StudyStateV2 = {
    ...state,
    completedLectureIds: { ...state.completedLectureIds },
    lectureMinutesOverride: { ...state.lectureMinutesOverride },
    moduleRatings: { ...state.moduleRatings },
  };

  if (next.selectedCourseId && !isValidCourseId(next.selectedCourseId)) {
    next.selectedCourseId = null;
  }

  for (const lectureId of Object.keys(next.completedLectureIds)) {
    if (!isValidLectureId(lectureId)) delete next.completedLectureIds[lectureId as any];
  }

  for (const lectureId of Object.keys(next.lectureMinutesOverride)) {
    if (!isValidLectureId(lectureId)) delete next.lectureMinutesOverride[lectureId as any];
  }

  for (const moduleId of Object.keys(next.moduleRatings)) {
    if (!isValidModuleId(moduleId)) delete next.moduleRatings[moduleId as any];
  }

  return next;
}


export function loadState(): StudyStateV2 {
    if (typeof window === 'undefined') {
        return defaultState();
    }
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) {
            return defaultState();
        }
        const parsed = JSON.parse(raw) as StudyStateV2;
        if (parsed.schemaVersion !== SCHEMA_VERSION_LATEST) {
            return defaultState();
        }
        const state: StudyStateV2 = {
            schemaVersion: 2,
            selectedCourseId: parsed.selectedCourseId ?? null,
            completedLectureIds: parsed.completedLectureIds ?? {},
            lectureMinutesOverride: parsed.lectureMinutesOverride ?? {},
            moduleRatings: parsed.moduleRatings ?? {},
            tasks: parsed.tasks ?? [],
        };
        return reconcileWithCatalog(state);
    } catch {
        console.error('Failed to load study state from localStorage');
        return defaultState();
    }
}

export function saveState(state: StudyStateV2): void {
    if (typeof window === 'undefined') {
        return;
    }
    window.localStorage.setItem(KEY, JSON.stringify(state));
}