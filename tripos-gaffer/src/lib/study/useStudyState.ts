'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CourseId, LectureId, ModuleId } from "@/lib/catalog/types";
import type { Rating10, StudyState, UserModuleRating, Task } from "./types";
import { loadState, saveState } from "./storage";


export function useStudyState() {
    const [state, setState] = useState<StudyState>(loadState());
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        saveState(state);
    }, [state, hydrated]);

    const actions = useMemo(() => {
        function setSelectedCourse(courseId: CourseId | null) {
            setState((prev) => ({
                ...prev,
                selectedCourseId: courseId,
            }));
        }
        function toggleLectureCompleted(lectureId: LectureId) {
            setState((prev) => {
                const completedLectureIds = { ...prev.completedLectureIds };
                if (completedLectureIds[lectureId]) {
                    delete completedLectureIds[lectureId];
                } else {
                    completedLectureIds[lectureId] = true;
                }
                return {
                    ...prev,
                    completedLectureIds,
                };
            });
        }
        function setLectureMinutesOverride(lectureId: LectureId, minutes: number | null) {
            setState((prev) => {
                const lectureMinutesOverride = { ...prev.lectureMinutesOverride };
                if (minutes === null) {
                    delete lectureMinutesOverride[lectureId];
                    return {
                        ...prev,
                        lectureMinutesOverride,
                    };
                } 
                const safe = Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 0;
                if (safe === 0) {
                    return prev;
                }
                lectureMinutesOverride[lectureId] = safe;
                return {
                    ...prev,
                    lectureMinutesOverride,
                };
            });
        }
        function setModuleRatings(moduleId: ModuleId, difficulty?: Rating10, comfort?: Rating10) {
            setState((prev) => {
                const moduleRatings: Record<ModuleId, UserModuleRating> = { ...prev.moduleRatings }
                const rating: UserModuleRating = { difficulty, comfort };

                if (difficulty === undefined && comfort === undefined) {
                    delete moduleRatings[moduleId];
                } else {
                    if (difficulty === undefined && prev.moduleRatings[moduleId]) {
                        rating.difficulty = prev.moduleRatings[moduleId].difficulty;
                    }
                    if (comfort === undefined && prev.moduleRatings[moduleId]) {
                        rating.comfort = prev.moduleRatings[moduleId].comfort;
                    }
                    moduleRatings[moduleId] = rating;
                }

                return {
                    ...prev,
                    moduleRatings,
                };
            });
    }
    function clearAllData() {
        setState({
            schemaVersion: 2,
            selectedCourseId: null,
            completedLectureIds: {},
            lectureMinutesOverride: {},
            moduleRatings: {},
            tasks: [],
            supervisors: []
        });
    }
    function createTask(task: Task){
        setState((prev) => ({
            ...prev,
            tasks: [...prev.tasks, task],
        }));
    }
    function toggleTaskCompleted(taskId: string){
        setState((prev) => ({
            ...prev,
            tasks: prev.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            ),
        }));
    }
    function deleteTask(taskId: string){
        setState((prev) => ({
            ...prev,
            tasks: prev.tasks.filter((task) => task.id !== taskId),
        }));
    }
    function updateTask(taskId: string, updates:Partial<Omit<Task, "id" | "type">>){ //cannot change id or type
        setState((prev) => ({
            ...prev,
            tasks: prev.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
            ),
        }));
    }
    
        return {
            setSelectedCourse,
            toggleLectureCompleted,
            setLectureMinutesOverride,
            setModuleRatings,
            clearAllData,
            createTask,
            toggleTaskCompleted,
            deleteTask,
            updateTask,
        };
    }, []);

    return { state, setState, ...actions, hydrated };
}