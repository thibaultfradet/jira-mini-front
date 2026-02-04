import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sprint } from "@/types";
import IssueRow from "./IssueRow";

interface SprintSectionProps {
  sprint: Sprint;
  onDrop?: (issueId: number) => void;
}

export default function SprintSection({ sprint, onDrop }: SprintSectionProps) {
  const [isExpanded, setIsExpanded] = useState(sprint.isActive);
  const [isDragOver, setIsDragOver] = useState(false);
  const issues = sprint.issues || [];
  const totalPoints = issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

  const isFutureSprint = new Date(sprint.endDate) >= new Date();
  const canDrop = (sprint.isActive || isFutureSprint) && !!onDrop;

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
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/50 cursor-pointer"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="font-semibold text-sm">{sprint.name}</span>
        {sprint.isActive && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            Actif
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {issues.length} ticket{issues.length > 1 ? "s" : ""}
          {totalPoints > 0 && ` · ${totalPoints} pts`}
        </span>
      </button>

      {isExpanded && (
        <div className="border-t">
          {issues.length === 0 && !isDragOver && (
            <p className="text-sm text-muted-foreground px-4 py-3">
              Aucun ticket dans ce sprint
            </p>
          )}
          {issues.map((issue) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
          {isDragOver && (
            <p className="text-sm text-blue-500 px-4 py-2 border-t bg-blue-50/50 text-center">
              Déposer ici pour ajouter au sprint
            </p>
          )}
        </div>
      )}
    </div>
  );
}
