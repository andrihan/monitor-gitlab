import { NextRequest, NextResponse } from "next/server";
import { getGroupIssues } from "@/lib/gitlab";

export async function GET(req: NextRequest) {
  try {
    const groupId = process.env.GITLAB_GROUP_ID!;
    const state = (req.nextUrl.searchParams.get("state") as "opened" | "closed" | "all") || "opened";
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);

    const { issues, total, totalPages } = await getGroupIssues(groupId, state, page);
    return NextResponse.json({ issues, total, totalPages, page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
