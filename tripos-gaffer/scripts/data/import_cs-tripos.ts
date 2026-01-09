import fs from 'fs';
import path from 'path';

import { db } from '@/db/index';
import { modules, lectures } from '@/db/schema';
import type { Year } from '@/lib/catalog/types';

type ModuleRow = {
    id: string;
    courseId: string;
    year: Year;
    name: string;
}
type LectureRow = {
    id: string;
    moduleId: string;
    title: string;
    index: number;
    date: string;
    lengthMinutes: number;
}

type TriposData = {
    modules: ModuleRow[];
    lectures: LectureRow[];
}

function readJsonFile(filePath: string): TriposData {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as TriposData;
}



async function main() {
    const dataFilePath = path.join(process.cwd(), './scripts/data/cs-tripos/processed_data/');
    const files = ['IA.json', 'IB.json', 'II.json'].map(fileName => path.join(dataFilePath, fileName));
    const all: TriposData[] = files.map(readJsonFile);
    const allModules = all.flatMap(d => d.modules);
    const allLectures = all.flatMap(d => d.lectures);

    await db.transaction(async (tx) => {
        // Insert modules
        for (const module of allModules) {
            await tx
            .insert(modules)
            .values(module)
            .onConflictDoNothing();
        }
        // Insert lectures (500 at a time)
        const chunkSize = 500;
        for (let i = 0; i < allLectures.length; i += chunkSize) {
            const chunk = allLectures.slice(i, i + chunkSize);
            await tx
            .insert(lectures)
            .values(chunk)
            .onConflictDoNothing();
        }
    });
    console.log('Import completed successfully.');
}
    
main().catch((e) => {
  console.error(e);
  process.exit(1);
});