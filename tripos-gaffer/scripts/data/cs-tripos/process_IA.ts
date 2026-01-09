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
const filePath = path.join(__dirname, "./raw_data/IA.json");
const raw = fs.readFileSync(filePath, "utf-8");

// --- parse JSON ---
const data = JSON.parse(raw);

// --- sanity check ---
if (!Array.isArray(data.events)) {
  throw new Error("Expected data.events to be an array");
}

// --- print first event ---

// Process Data 
let allLectures = data.events

// modules is the set of displayName attributes from all lectures

const modules: Set<string> = new Set(
    allLectures.map((lecture: RawLecture) => lecture.displayName)
);

// drop lectures with displayName "Python Bootcamp", "No Lecture Interaction Design"
allLectures = allLectures.filter((lecture: RawLecture) => 
    lecture.displayName !== "Python Bootcamp" && 
    lecture.displayName !== "No Lecture Interaction Design"
);
// change lectures with displayName "Interaction Design Student Group Presentation" to "Interaction Design" 
allLectures = allLectures.map((lecture: RawLecture) => {
    if (lecture.displayName === "Interaction Design Student Group Presentation") {
        return {
            ...lecture,
            displayName: "Interaction Design"
        };
    }
    return lecture;
});

// drop modules that are no longer present
modules.delete("Python Bootcamp");
modules.delete("No Lecture Interaction Design");
modules.delete("Interaction Design Student Group Presentation");

// drop fields: id,context,descripition,location,notes,organisers,otherOrganisers,seriesId,type,updatedAt 
allLectures = allLectures.map((lecture: RawLecture) => {
    return {
        displayName: lecture.displayName,
        start: lecture.start,
        end: lecture.end
    };
});
// rename field displayName to module
allLectures = allLectures.map((lecture: { displayName: string; start: string; end: string }) => {
    return {
        module: lecture.displayName,
        start: lecture.start,
        end: lecture.end
    };
});
// Add a duration field in minutes
allLectures = allLectures.map((lecture: { module: string; start: string; end: string }) => {
    const start = new Date(lecture.start);
    const end = new Date(lecture.end);
    const length_minutes = (end.getTime() - start.getTime()) / (1000 * 60); // duration in minutes
    return {
        ...lecture,
        length_minutes: length_minutes
    };
});

//sort lectures by module and then by start date
allLectures = allLectures.sort((a: { module: string; start: string; end: string }, b: { module: string; start: string; end: string }) => {
    if (a.module < b.module) return -1;
    if (a.module > b.module) return 1;
    // same module, sort by start date
    const dateA = new Date(a.start);
    const dateB = new Date(b.start);
    return dateA.getTime() - dateB.getTime();
});

// add index field for each lecture within each module (earliest lecture by date is index 1)


const moduleLectureCounts: { [module: string]: number } = {};
allLectures = allLectures.map((lecture: { module: string; start: string; end: string }) => {
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
allLectures = allLectures.map((lecture: { module: string; start: string; end: string; index: number }) => {
    return {
        ...lecture,
        title: `${lecture.module} #${lecture.index}`
    };
});

// produce module JSON list with fields id, courseId, year, name
const modulesList = Array.from(modules).map((module: string) => {
    return {
        id: `cs-tripos-ia-module-${module.replace(/\s+/g, "-").toLowerCase()}`,
        courseId: "cs-tripos",
        year: "IA",
        name: module,
    };
});

//produce lectures JSON list with fields id, moduleId, title, date, lengthMinutes
const lecturesList = allLectures.map((lecture: { module: string; start: string; end: string; index: number; title: string; length_minutes: number }) => {
    return {
        id: `cs-tripos-ia-${lecture.module.replace(/\s+/g, "-").toLowerCase()}-${String(lecture.index).padStart(2, "0")}`,
        moduleId: `cs-tripos-ia-module-${lecture.module.replace(/\s+/g, "-").toLowerCase()}`,
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

const outputFilePath = path.join(__dirname, "./processed_data/IA.json");
fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), "utf-8");

