import { NextResponse } from "next/server";
import { getLecture } from "@/lib/catalog/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const lecture = await getLecture(id as any);
  return NextResponse.json(lecture);
}
