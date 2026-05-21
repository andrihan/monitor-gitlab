import { NextRequest, NextResponse } from "next/server";
import { getProjectCommits } from "@/lib/gitlab";

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const ref = req.nextUrl.searchParams.get("ref") || undefined;

    if (!projectId) {
      return NextResponse.json({ error: "projectId requis" }, { status: 400 });
    }

    const { commits, total, totalPages } = await getProjectCommits(
      parseInt(projectId, 10),
      page,
      ref
    );

    return NextResponse.json({ commits, total, totalPages, page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
