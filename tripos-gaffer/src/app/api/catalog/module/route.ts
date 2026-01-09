import { NextResponse } from "next/server";
import { getModule } from "@/lib/catalog/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const module = await getModule(id as any);
  return NextResponse.json(module);
}
