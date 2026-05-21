import axios, { AxiosInstance } from "axios";
import { cacheLife } from "next/cache";
import type {
  GitLabProject,
  GitLabPipeline,
  GitLabCommit,
  GitLabMergeRequest,
  GitLabIssue,
  GitLabUser,
  GitLabGroup,
} from "@/types/gitlab";

const PAGE_SIZE = 20;

function createGitLabClient(): AxiosInstance {
  const token = process.env.GITLAB_TOKEN;
  const baseURL = process.env.GITLAB_URL || "https://gitlab.com";
  return axios.create({
    baseURL: `${baseURL}/api/v4`,
    headers: { "PRIVATE-TOKEN": token, "Content-Type": "application/json" },
    timeout: 15000,
  });
}

/** Run promises with max concurrency to avoid rate limiting */
async function withConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = [];
  const running: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task()
      .then((v) => { results.push({ status: "fulfilled", value: v }); })
      .catch((e) => { results.push({ status: "rejected", reason: e }); });
    running.push(p);
    if (running.length >= limit) await Promise.race(running.map((r) => r));
  }
  await Promise.all(running);
  return results;
}

async function paginate<T>(
  client: AxiosInstance,
  url: string,
  params: Record<string, string | number | boolean> = {}
): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  while (true) {
    const response = await client.get<T[]>(url, {
      params: { ...params, per_page: 100, page },
    });
    results.push(...response.data);
    const totalPages = parseInt(response.headers["x-total-pages"] || "1", 10);
    if (page >= totalPages) break;
    page++;
  }
  return results;
}

export async function getGroup(groupId: string): Promise<GitLabGroup> {
  "use cache";
  cacheLife("minutes");
  const client = createGitLabClient();
  const response = await client.get<GitLabGroup>(`/groups/${groupId}`, {
    params: { with_projects: false },
  });
  return response.data;
}

export async function getAllGroupProjects(groupId: string): Promise<GitLabProject[]> {
  "use cache";
  cacheLife("minutes");
  const client = createGitLabClient();
  return paginate<GitLabProject>(client, `/groups/${groupId}/projects`, {
    include_subgroups: true,
    with_shared: false,
    order_by: "last_activity_at",
    sort: "desc",
    simple: false,
  });
}

export async function getGroupProjects(
  groupId: string,
  page = 1
): Promise<{ projects: GitLabProject[]; total: number; totalPages: number }> {
  "use cache";
  cacheLife("minutes");
  const client = createGitLabClient();
  const response = await client.get<GitLabProject[]>(
    `/groups/${groupId}/projects`,
    {
      params: {
        include_subgroups: true,
        with_shared: false,
        order_by: "last_activity_at",
        sort: "desc",
        per_page: PAGE_SIZE,
        page,
      },
    }
  );
  return {
    projects: response.data,
    total: parseInt(response.headers["x-total"] || "0", 10),
    totalPages: parseInt(response.headers["x-total-pages"] || "1", 10),
  };
}

export async function getProjectLatestPipeline(
  projectId: number
): Promise<GitLabPipeline | null> {
  const client = createGitLabClient();
  try {
    const response = await client.get<GitLabPipeline[]>(
      `/projects/${projectId}/pipelines`,
      { params: { per_page: 1, page: 1 } }
    );
    return response.data[0] || null;
  } catch {
    return null;
  }
}

export async function getGroupPipelines(
  groupId: string,
  status?: string
): Promise<Array<GitLabPipeline & { project: GitLabProject }>> {
  const projects = await getAllGroupProjects(groupId);
  const client = createGitLabClient();

  // Fetch recent pipelines per project with concurrency limit
  const listTasks = projects.slice(0, 30).map((project) => async () => {
    const params: Record<string, string | number> = {
      per_page: 5,
      page: 1,
      order_by: "id",
      sort: "desc",
    };
    if (status) params.status = status;
    const res = await client.get<GitLabPipeline[]>(
      `/projects/${project.id}/pipelines`,
      { params }
    );
    return res.data.map((p) => ({ ...p, project }));
  });

  const listResults = await withConcurrency(listTasks, 8);

  const flat = listResults
    .filter(
      (r): r is PromiseFulfilledResult<Array<GitLabPipeline & { project: GitLabProject }>> =>
        r.status === "fulfilled"
    )
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Enrich top 20 with detail (duration, user) using concurrency limit
  const toEnrich = flat.slice(0, 20);
  const detailMap = new Map<number, Partial<GitLabPipeline>>();

  const detailTasks = toEnrich.map((p) => async () => {
    const r = await client.get<GitLabPipeline>(`/projects/${p.project_id}/pipelines/${p.id}`);
    detailMap.set(p.id, {
      duration: r.data.duration,
      user: r.data.user,
      started_at: r.data.started_at,
      finished_at: r.data.finished_at,
    });
  });

  await withConcurrency(detailTasks, 6);

  return flat.map((p) => {
    const detail = detailMap.get(p.id);
    return detail ? { ...p, ...detail } : p;
  });
}

export async function getProjectCommits(
  projectId: number,
  page = 1,
  ref?: string
): Promise<{ commits: GitLabCommit[]; total: number; totalPages: number }> {
  const client = createGitLabClient();
  const params: Record<string, string | number | boolean> = {
    per_page: PAGE_SIZE,
    page,
    with_stats: true,
  };
  if (ref) params.ref_name = ref;
  const response = await client.get<GitLabCommit[]>(
    `/projects/${projectId}/repository/commits`,
    { params }
  );
  return {
    commits: response.data,
    total: parseInt(response.headers["x-total"] || "0", 10),
    totalPages: parseInt(response.headers["x-total-pages"] || "1", 10),
  };
}

export async function getGroupMergeRequests(
  groupId: string,
  state: "opened" | "closed" | "merged" | "all" = "opened",
  page = 1
): Promise<{ mrs: GitLabMergeRequest[]; total: number; totalPages: number }> {
  const client = createGitLabClient();
  const response = await client.get<GitLabMergeRequest[]>(
    `/groups/${groupId}/merge_requests`,
    {
      params: {
        state,
        per_page: PAGE_SIZE,
        page,
        order_by: "updated_at",
        sort: "desc",
      },
    }
  );
  return {
    mrs: response.data,
    total: parseInt(response.headers["x-total"] || "0", 10),
    totalPages: parseInt(response.headers["x-total-pages"] || "1", 10),
  };
}

export async function getGroupIssues(
  groupId: string,
  state: "opened" | "closed" | "all" = "opened",
  page = 1
): Promise<{ issues: GitLabIssue[]; total: number; totalPages: number }> {
  const client = createGitLabClient();
  const response = await client.get<GitLabIssue[]>(
    `/groups/${groupId}/issues`,
    {
      params: {
        state,
        per_page: PAGE_SIZE,
        page,
        order_by: "updated_at",
        sort: "desc",
      },
    }
  );
  return {
    issues: response.data,
    total: parseInt(response.headers["x-total"] || "0", 10),
    totalPages: parseInt(response.headers["x-total-pages"] || "1", 10),
  };
}

export async function getGroupMembers(groupId: string): Promise<GitLabUser[]> {
  "use cache";
  cacheLife("hours");
  const client = createGitLabClient();
  return paginate<GitLabUser>(client, `/groups/${groupId}/members/all`);
}

export async function getDashboardStats(groupId: string) {
  "use cache";
  cacheLife("minutes");
  const [projects, { mrs }, { issues }, members] = await Promise.all([
    getAllGroupProjects(groupId),
    getGroupMergeRequests(groupId, "opened"),
    getGroupIssues(groupId, "opened"),
    getGroupMembers(groupId),
  ]);

  const client = createGitLabClient();

  // Sample the 20 most recently active projects for pipeline counts
  const recentProjects = projects.slice(0, 20);
  const pipelineTasks = recentProjects.map((p) => async () => {
    const res = await client.get<GitLabPipeline[]>(
      `/projects/${p.id}/pipelines`,
      { params: { per_page: 1, page: 1 } }
    );
    return res.data[0] || null;
  });

  const pipelineResults = await withConcurrency(pipelineTasks, 8);
  const pipelines = pipelineResults
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<GitLabPipeline | null>).value)
    .filter((p): p is GitLabPipeline => p !== null);

  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return {
    totalProjects: projects.length,
    runningPipelines: pipelines.filter((p) => p.status === "running").length,
    failedPipelines: pipelines.filter((p) => p.status === "failed").length,
    successPipelines: pipelines.filter((p) => p.status === "success").length,
    openMergeRequests: mrs.length,
    openIssues: issues.length,
    totalMembers: members.length,
    recentActivity: projects.filter(
      (p) => Date.now() - new Date(p.last_activity_at).getTime() < sevenDays
    ).length,
  };
}
