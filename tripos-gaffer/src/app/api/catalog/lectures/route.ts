import { NextResponse } from "next/server";
import { listLecturesForModule } from "@/lib/catalog/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");
  if (!moduleId) return NextResponse.json({ error: "Missing moduleId" }, { status: 400 });

  const lecs = await listLecturesForModule(moduleId as any);
  return NextResponse.json(lecs);
}
