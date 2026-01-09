

import { db } from "../src/db/index";
import { courses, courseParts, modules, lectures } from "../src/db/schema";

async function main() {
  // 1) Course
  await db
    .insert(courses)
    .values({
      id: "cs-tripos",
      name: "Computer Science Tripos",
      department: "Department of Computer Science and Technology",
    })
    .onConflictDoNothing();

  // 2) Parts
  await db
    .insert(courseParts)
    .values([
      { courseId: "cs-tripos", year: "IA" },
      { courseId: "cs-tripos", year: "IB" },
      { courseId: "cs-tripos", year: "II" },
    ])
    .onConflictDoNothing();

  // 3) One sample module
  await db
    .insert(modules)
    .values({
      id: "cs-ia-sample-module",
      courseId: "cs-tripos",
      year: "IA",
      name: "Sample Module",
        })
    .onConflictDoNothing();

  // 4) Two sample lectures
  await db
    .insert(lectures)
    .values([
      {
        id: "cs-ia-sample-module-01",
        moduleId: "cs-ia-sample-module",
        title: "Intro",
        index: 1,
        date: "2026-01-01",
        lengthMinutes: 60,
      },
      {
        id: "cs-ia-sample-module-02",
        moduleId: "cs-ia-sample-module",
        title: "Next Steps",
        index: 2,
        date: "2026-01-03",
        lengthMinutes: 60,
      },
    ])
    .onConflictDoNothing();

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
