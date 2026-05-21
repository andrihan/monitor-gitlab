import { NextRequest, NextResponse } from "next/server";
import { getGroupPipelines } from "@/lib/gitlab";

export async function GET(req: NextRequest) {
  try {
    const groupId = process.env.GITLAB_GROUP_ID!;
    const status = req.nextUrl.searchParams.get("status") || undefined;

    const pipelines = await getGroupPipelines(groupId, status);
    return NextResponse.json({ pipelines });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
