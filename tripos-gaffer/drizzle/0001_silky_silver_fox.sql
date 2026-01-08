CREATE TABLE "course_parts" (
	"course_id" text NOT NULL,
	"year" text NOT NULL,
	CONSTRAINT "course_parts_course_id_year_pk" PRIMARY KEY("course_id","year")
);
--> statement-breakpoint
CREATE TABLE "lectures" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"title" text NOT NULL,
	"index" integer NOT NULL,
	"date" date NOT NULL,
	"length_minutes" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"year" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_parts" ADD CONSTRAINT "course_parts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lectures" ADD CONSTRAINT "lectures_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_year_course_parts_course_id_year_fk" FOREIGN KEY ("course_id","year") REFERENCES "public"."course_parts"("course_id","year") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lectures_module_idx" ON "lectures" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "modules_course_part_idx" ON "modules" USING btree ("course_id","year");