import { NextResponse } from "next/server";
import { listLecturesForModule, listLecturesForCourse } from "@/lib/catalog/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
   const courseId = decodeURIComponent(searchParams.get("courseId") || "");
  const moduleId = decodeURIComponent(searchParams.get("moduleId") || "");

  if (courseId) {
    const lecs = await listLecturesForCourse(courseId as any);
    return NextResponse.json(lecs);
  }

  if (moduleId) {
    const lecs = await listLecturesForModule(moduleId as any);
    return NextResponse.json(lecs);
  }

  return NextResponse.json(
    { error: "Missing courseId or moduleId" },
    { status: 400 },
  );
}
