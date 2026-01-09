import {
  pgTable,
  text,
  integer,
  date,
  primaryKey,
  index,
  foreignKey,
  timestamp,
} from "drizzle-orm/pg-core";

export const courses = pgTable("courses", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
});

export const courseParts = pgTable(
  "course_parts",
  {
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    year: text("year").notNull(), // "IA" | "IB" | "II" | "III"
  },
  (t) => ({
    pk: primaryKey({ columns: [t.courseId, t.year] }),
  }),
);

export const modules = pgTable(
  "modules",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id").notNull(),
    year: text("year").notNull(), // same value as in course_parts.year
    name: text("name").notNull(),
  },
  (t) => ({
    // composite FK -> course_parts(course_id, year)
    coursePartFk: foreignKey({
      columns: [t.courseId, t.year],
      foreignColumns: [courseParts.courseId, courseParts.year],
    }).onDelete("cascade"),

    coursePartIdx: index("modules_course_part_idx").on(t.courseId, t.year),
  }),
);

export const lectures = pgTable(
  "lectures",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    index: integer("index").notNull(), // order within module
date: timestamp("date", { withTimezone: true, mode: "string" }).notNull(),
    lengthMinutes: integer("length_minutes").notNull(),
  },
  (t) => ({
    moduleIdx: index("lectures_module_idx").on(t.moduleId),
  }),
);
