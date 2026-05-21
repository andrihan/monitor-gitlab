import { NextRequest, NextResponse } from "next/server";
import { getGroupMergeRequests } from "@/lib/gitlab";

export async function GET(req: NextRequest) {
  try {
    const groupId = process.env.GITLAB_GROUP_ID!;
    const state = (req.nextUrl.searchParams.get("state") as "opened" | "closed" | "merged" | "all") || "opened";
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);

    const { mrs, total, totalPages } = await getGroupMergeRequests(groupId, state, page);
    return NextResponse.json({ mrs, total, totalPages, page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
