import { NextResponse } from "next/server";
import { getGroupMembers } from "@/lib/gitlab";

export async function GET() {
  try {
    const groupId = process.env.GITLAB_GROUP_ID!;
    const members = await getGroupMembers(groupId);
    return NextResponse.json({ members });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
