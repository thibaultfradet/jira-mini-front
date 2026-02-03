import type { Issue } from "@/types";
import IssueRow from "./IssueRow";

interface BacklogSectionProps {
  issues: Issue[];
}

export default function BacklogSection({ issues }: BacklogSectionProps) {
  const totalPoints = issues.reduce(
    (sum, i) => sum + (i.storyPoints || 0),
    0
  );

  return (
    <div className="border rounded-lg">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <span className="font-semibold text-sm">Backlog</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {issues.length} ticket{issues.length > 1 ? "s" : ""}
          {totalPoints > 0 && ` · ${totalPoints} pts`}
        </span>
      </div>
      {issues.length === 0 ? (
        <p className="text-sm text-muted-foreground px-4 py-3">
          Aucun ticket dans le backlog
        </p>
      ) : (
        issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)
      )}
    </div>
  );
}
