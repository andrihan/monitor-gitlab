import { NextRequest, NextResponse } from "next/server";
import { getGroupProjects, getProjectLatestPipeline } from "@/lib/gitlab";

export async function GET(req: NextRequest) {
  try {
    const groupId = process.env.GITLAB_GROUP_ID!;
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);

    const { projects, total, totalPages } = await getGroupProjects(groupId, page);

    // Fetch latest pipeline for each project in parallel with concurrency limit
    const results = await Promise.allSettled(
      projects.map((project) => getProjectLatestPipeline(project.id))
    );

    const withPipelines = projects.map((project, i) => ({
      ...project,
      latest_pipeline: results[i].status === "fulfilled" ? results[i].value : null,
    }));

    return NextResponse.json({ projects: withPipelines, total, totalPages, page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
