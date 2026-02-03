import type { Issue } from "@/types";
import { statusConfig } from "@/helpers";
import type { IssueStatus } from "@/types";
import KanbanColumn from "./KanbanColumn";

interface KanbanBoardProps {
  issues: Issue[];
  projectKey?: string;
  onCardClick?: (issue: Issue) => void;
}

const columns: { status: IssueStatus; label: string }[] = [
  { status: "todo", label: statusConfig.todo.label },
  { status: "in_progress", label: statusConfig.in_progress.label },
  { status: "done", label: statusConfig.done.label },
];

export default function KanbanBoard({ issues, projectKey, onCardClick }: KanbanBoardProps) {
  const issuesByStatus = (status: IssueStatus) =>
    issues.filter((issue) => issue.status === status);

  return (
    <div className="flex gap-4 h-full overflow-x-auto">
      {columns.map((col) => (
        <KanbanColumn
          key={col.status}
          status={col.status}
          label={col.label}
          issues={issuesByStatus(col.status)}
          projectKey={projectKey}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
