'use client';

import { useEffect, useMemo, useState } from 'react';
import type { StudyStateV1, Module, Lecture, Course } from './types';
import { defaultState, loadState, saveState } from './storage';
import { uid } from './id';

export function useStudyState() {
    const [state, setState] = useState<StudyStateV1>(() => loadState());
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
    setHydrated(true);
    }, [])
    // Save state to localStorage whenever it changes
    useEffect(() => {
    if (!hydrated) return;
    saveState(state);
}, [state, hydrated]);


    const actions = useMemo(() => {
        function addModule(courseId: string, name: string, year: 'IA' | 'IB' | 'II' | 'III', difficulty?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, comfort?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10){
            const trimmed = name.trim();
            if (!trimmed) return;
            const newModule: Module = {
                id: uid('module'),
                name: trimmed,
                createdAt: Date.now(),
                courseId,
                year,
                difficulty,
                comfort,
            };
            setState((prev) => ({
                ...prev,
                modules: [newModule, ...prev.modules],
            }));
        }
        function addLecture(moduleId: string, title: string, date: number, lengthMinutes: number, index: number){
            const trimmed = title.trim();
            if (!trimmed) return;

            const newLecture: Lecture = {
                id: uid('lecture'),
                moduleId,
                title: trimmed,
                date,
                completed: false,
                lengthMinutes,
                index,
            };
            setState((prev) => ({
                ...prev,
                lectures: [newLecture, ...prev.lectures],
            }));
        }
        function toggleLectureCompletion(lectureId: string){
            setState((prev) => ({
                ...prev,
                lectures: prev.lectures.map((lec) =>
                    lec.id === lectureId ? { ...lec, completed: !lec.completed } : lec
                ),
            }));
        }
        function deleteLecture(lectureId: string){
            setState((prev) => ({
                ...prev,
                lectures: prev.lectures.filter((lec) => lec.id !== lectureId),
            }));
        }
        function deleteModule(moduleId: string){
            setState((prev) => ({
                ...prev,
                modules: prev.modules.filter((mod) => mod.id !== moduleId),
                lectures: prev.lectures.filter((lec) => lec.moduleId !== moduleId),
            }));
        }
        function setModuleRatings(moduleId: string, difficulty?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10, comfort?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10){
            setState((prev) => ({
                ...prev,
                modules: prev.modules.map((mod) =>
                    mod.id === moduleId ? { ...mod, difficulty, comfort } : mod
                ),
            }));
        }
        function setCourse(course: Course){
            setState((prev) => ({
                ...prev,
                course
            }));
        }
        return { addModule, addLecture, toggleLectureCompletion, deleteLecture, deleteModule, setModuleRatings, setCourse };
    }, []);


    return { state, setState, ...actions };
}
