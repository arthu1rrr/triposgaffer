import { index } from "drizzle-orm/gel-core";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

interface RawLecture{
    id: string;
context: string;
            description: string;
            displayName: string;
            end: string;
            location: string;
            notes: string;
            organisers: string[];
            otherOrganisers: string;
            start: string;
            seriesId: number;
            type: string;
updatedAt: string;}

// --- fix __dirname for ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- read file ---
const filePath = path.join(__dirname, "./raw_data/IB.json");
const raw = fs.readFileSync(filePath, "utf-8");

// --- parse JSON ---
const data = JSON.parse(raw);

// --- sanity check ---
if (!Array.isArray(data.events)) {
  throw new Error("Expected data.events to be an array");
}

// --- print first event ---
const firstEvent = data.events[0];

// Process Data 
let allLectures = data.events

// modules is the set of displayName attributes from all lectures

const modules = new Set(
    allLectures.map((lecture: RawLecture) => lecture.displayName)
);
// drop fields: id,context,descripition,location,notes,organisers,otherOrganisers,seriesId,type,updatedAt 
allLectures = allLectures.map((lecture: RawLecture) => {
    return {
        displayName: lecture.displayName,
        start: lecture.start,
        end: lecture.end
    };
});
// rename field displayName to module
allLectures = allLectures.map((lecture: any) => {
    return {
        module: lecture.displayName,
        start: lecture.start,
        end: lecture.end
    };
});
// Add a duration field in minutes
allLectures = allLectures.map((lecture: any) => {
    const start = new Date(lecture.start);
    const end = new Date(lecture.end);
    const length_minutes = (end.getTime() - start.getTime()) / (1000 * 60); // duration in minutes
    return {
        ...lecture,
        length_minutes: length_minutes
    };
});

//sort lectures by module and then by start date
allLectures = allLectures.sort((a: any, b: any) => {
    if (a.module < b.module) return -1;
    if (a.module > b.module) return 1;
    // same module, sort by start date
    const dateA = new Date(a.start);
    const dateB = new Date(b.start);
    return dateA.getTime() - dateB.getTime();
});

// add index field for each lecture within each module (earliest lecture by date is index 1)


const moduleLectureCounts: { [module: string]: number } = {};
allLectures = allLectures.map((lecture: any) => {
    const module = lecture.module;
    if (!moduleLectureCounts[module]) {
        moduleLectureCounts[module] = 1;
    } else {
        moduleLectureCounts[module]++;
    }
    return {
        ...lecture,
        index: moduleLectureCounts[module]
    };
});

// create title field as Module + " #" + index
allLectures = allLectures.map((lecture: any) => {
    return {
        ...lecture,
        title: `${lecture.module} #${lecture.index}`
    };
});

// produce module JSON list with fields id, courseId, year, name
const modulesList = Array.from(modules).map((module: any) => {
    return {
        id: `cs-tripos-ib-module-${module.replace(/\s+/g, "-").toLowerCase()}`,
        courseId: "cs-tripos",
        year: "IB",
        name: module,
    };
});

//produce lectures JSON list with fields id, moduleId, title, date, lengthMinutes
const lecturesList = allLectures.map((lecture: any) => {
    return {
        id: `cs-tripos-ib-${lecture.module.replace(/\s+/g, "-").toLowerCase()}-${String(lecture.index).padStart(2, "0")}`,
        moduleId: `cs-tripos-ib-module-${lecture.module.replace(/\s+/g, "-").toLowerCase()}`,
        title: lecture.title,
        index: lecture.index,
        date: lecture.start,
        lengthMinutes: lecture.length_minutes,
    };
});

// --- write processed data to file ---
const outputData = {
    modules: modulesList,
    lectures: lecturesList,
};

const outputFilePath = path.join(__dirname, "./processed_data/IB.json");
fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), "utf-8");

