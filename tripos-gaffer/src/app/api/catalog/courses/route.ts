import { NextResponse } from "next/server";
import { getAllCourses } from "@/lib/catalog/queries";

export async function GET() {
  const courses = await getAllCourses();
  return NextResponse.json(courses);
}
