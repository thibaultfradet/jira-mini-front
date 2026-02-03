import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Issue, IssueStatus } from "@/types";
import KanbanCard from "./KanbanCard";

interface KanbanColumnProps {
  status: IssueStatus;
  label: string;
  issues: Issue[];
  projectKey?: string;
  onCardClick?: (issue: Issue) => void;
  onDrop?: (issueId: number, targetStatus: IssueStatus) => void;
}

const columnStyles: Record<IssueStatus, string> = {
  todo: "border-t-gray-400",
  in_progress: "border-t-blue-500",
  done: "border-t-green-500",
};

export default function KanbanColumn({
  status,
  label,
  issues,
  projectKey,
  onCardClick,
  onDrop,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const totalPoints = issues.reduce((sum, issue) => {
    const childPoints = (issue.children || []).reduce(
      (s, c) => s + (c.storyPoints || 0),
      0
    );
    return sum + (issue.storyPoints || 0) + childPoints;
  }, 0);

  const handleDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("application/kanban-issue-id")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const issueId = Number(e.dataTransfer.getData("application/kanban-issue-id"));
    if (issueId && onDrop) {
      onDrop(issueId, status);
    }
  };

  return (
    <div
      className={cn(
        "flex-1 min-w-[280px] bg-muted/40 rounded-lg border-t-3 transition-colors",
        columnStyles[status],
        isDragOver && "bg-blue-50/60 ring-2 ring-blue-300 ring-inset"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase">
            {label}
          </h3>
          <span className="text-xs text-muted-foreground">
            {issues.length}
          </span>
        </div>
        {totalPoints > 0 && (
          <span className="text-xs font-medium bg-white border rounded-full px-2 py-0.5 text-muted-foreground">
            {totalPoints} pts
          </span>
        )}
      </div>

      <div className="px-2 pb-2 space-y-2 min-h-[100px]">
        {issues.map((issue) => (
          <KanbanCard
            key={issue.id}
            issue={issue}
            projectKey={projectKey}
            onClick={() => onCardClick?.(issue)}
          />
        ))}
      </div>
    </div>
  );
}
