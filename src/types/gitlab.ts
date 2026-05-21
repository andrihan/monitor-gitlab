export interface GitLabNamespace {
  id: number;
  name: string;
  path: string;
  kind: "group" | "user";
  full_path: string;
  avatar_url: string | null;
  web_url: string;
}

export interface GitLabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  description: string | null;
  visibility: "private" | "internal" | "public";
  ssh_url_to_repo: string;
  http_url_to_repo: string;
  web_url: string;
  avatar_url: string | null;
  star_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  last_activity_at: string;
  created_at: string;
  namespace: GitLabNamespace;
  statistics?: {
    commit_count: number;
    storage_size: number;
    repository_size: number;
  };
}

export type PipelineStatus =
  | "created"
  | "waiting_for_resource"
  | "preparing"
  | "pending"
  | "running"
  | "success"
  | "failed"
  | "canceled"
  | "skipped"
  | "manual"
  | "scheduled";

export interface GitLabPipeline {
  id: number;
  iid: number;
  project_id: number;
  status: PipelineStatus;
  source: string;
  ref: string;
  sha: string;
  web_url: string;
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  duration?: number | null;
  queued_duration?: number | null;
  user?: GitLabUser;
}

export interface GitLabUser {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
  web_url: string;
  state: string;
  access_level?: number;
  expires_at?: string | null;
}

export interface GitLabCommit {
  id: string;
  short_id: string;
  title: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
  web_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export type MergeRequestState = "opened" | "closed" | "merged" | "locked";

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string | null;
  state: MergeRequestState;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  target_branch: string;
  source_branch: string;
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  author: GitLabUser;
  assignees: GitLabUser[];
  reviewers: GitLabUser[];
  web_url: string;
  labels: string[];
  draft: boolean;
  has_conflicts: boolean;
}

export type IssueState = "opened" | "closed";

export interface GitLabIssue {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string | null;
  state: IssueState;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  labels: string[];
  milestone: { id: number; title: string } | null;
  assignees: GitLabUser[];
  author: GitLabUser;
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  web_url: string;
  weight: number | null;
  due_date: string | null;
}

export interface GitLabGroup {
  id: number;
  name: string;
  path: string;
  description: string | null;
  visibility: string;
  avatar_url: string | null;
  web_url: string;
  full_name: string;
  full_path: string;
  parent_id: number | null;
  statistics?: {
    storage_size: number;
    repository_size: number;
    lfs_objects_size: number;
    job_artifacts_size: number;
  };
}

export interface DashboardStats {
  totalProjects: number;
  runningPipelines: number;
  failedPipelines: number;
  successPipelines: number;
  openMergeRequests: number;
  openIssues: number;
  totalMembers: number;
  recentActivity: number;
}
