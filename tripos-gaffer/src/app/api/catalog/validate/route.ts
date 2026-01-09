import { NextResponse } from "next/server";
import {
  isValidCourseId,
  isValidModuleId,
  isValidLectureId,
} from "@/lib/catalog/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "course" | "module" | "lecture"
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json(
      { ok: false, error: "Missing type or id" },
      { status: 400 },
    );
  }

  if (type !== "course" && type !== "module" && type !== "lecture") {
    return NextResponse.json(
      { ok: false, error: "Invalid type" },
      { status: 400 },
    );
  }

  let valid = false;
  if (type === "course") valid = await isValidCourseId(id);
  if (type === "module") valid = await isValidModuleId(id);
  if (type === "lecture") valid = await isValidLectureId(id);

  return NextResponse.json({ ok: true, valid });
}
