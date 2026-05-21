import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/gitlab";

export async function GET() {
  try {
    const groupId = process.env.GITLAB_GROUP_ID;
    if (!groupId) {
      return NextResponse.json({ error: "GITLAB_GROUP_ID non configuré" }, { status: 500 });
    }
    const stats = await getDashboardStats(groupId);
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
