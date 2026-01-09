import { NextResponse } from "next/server";
import { listModulesForCourse } from "@/lib/catalog/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId) return NextResponse.json({ error: "Missing courseId" }, { status: 400 });

  const mods = await listModulesForCourse(courseId as any);
  return NextResponse.json(mods);
}
