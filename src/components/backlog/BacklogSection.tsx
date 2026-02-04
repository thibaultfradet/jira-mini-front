import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Issue } from "@/types";
import IssueRow from "./IssueRow";

interface BacklogSectionProps {
  issues: Issue[];
  onDrop?: (issueId: number) => void;
}

export default function BacklogSection({ issues, onDrop }: BacklogSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const totalPoints = issues.reduce(
    (sum, i) => sum + (i.storyPoints || 0),
    0
  );

  const canDrop = !!onDrop;

  const handleDragOver = (e: React.DragEvent) => {
    if (!canDrop) return;
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
    if (!canDrop) return;
    e.preventDefault();
    setIsDragOver(false);
    const issueId = Number(e.dataTransfer.getData("application/issue-id"));
    if (issueId) {
      onDrop(issueId);
    }
  };

  return (
    <div
      className={cn(
        "border rounded-lg transition-colors",
        isDragOver && "border-blue-400 bg-blue-50/50"
      )}
      onDragOver={canDrop ? handleDragOver : undefined}
      onDragLeave={canDrop ? handleDragLeave : undefined}
      onDrop={canDrop ? handleDrop : undefined}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <span className="font-semibold text-sm">Backlog</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {issues.length} ticket{issues.length > 1 ? "s" : ""}
          {totalPoints > 0 && ` · ${totalPoints} pts`}
        </span>
      </div>
      {issues.length === 0 && !isDragOver ? (
        <p className="text-sm text-muted-foreground px-4 py-3">
          Aucun ticket dans le backlog
        </p>
      ) : (
        <>
          {issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)}
          {isDragOver && (
            <p className="text-sm text-blue-500 px-4 py-2 border-t bg-blue-50/50 text-center">
              Déposer ici pour remettre dans le backlog
            </p>
          )}
        </>
      )}
    </div>
  );
}
