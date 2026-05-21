import { cn, pipelineStatusColor, pipelineStatusLabel } from "@/lib/utils";
import type { PipelineStatus } from "@/types/gitlab";
import { CheckCircle2, XCircle, Loader2, Clock, Slash, SkipForward, Circle } from "lucide-react";

const statusIcons: Partial<Record<PipelineStatus, React.ElementType>> = {
  success: CheckCircle2,
  failed: XCircle,
  running: Loader2,
  pending: Clock,
  canceled: Slash,
  skipped: SkipForward,
  created: Circle,
  manual: Circle,
  scheduled: Clock,
};

interface PipelineBadgeProps {
  status: PipelineStatus;
  className?: string;
}

export default function PipelineBadge({ status, className }: PipelineBadgeProps) {
  const Icon = statusIcons[status] || Circle;
  const isRunning = status === "running";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        pipelineStatusColor(status),
        className
      )}
    >
      <Icon className={cn("w-3 h-3 flex-shrink-0", isRunning && "animate-spin")} />
      {pipelineStatusLabel(status)}
    </span>
  );
}
