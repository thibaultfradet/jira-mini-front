import { useEffect, useState } from "react";
import { sprintService } from "@/services/sprint";
import { issueService } from "@/services/issue";
import type { Sprint, Issue } from "@/types";
import SprintSection from "./SprintSection";
import BacklogSection from "./BacklogSection";

export default function BacklogTab() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sprintsData, backlogData] = await Promise.all([
          sprintService.getAll(),
          issueService.getBacklog(),
        ]);
        setSprints(sprintsData);
        setBacklogIssues(backlogData);
      } catch (error) {
        console.error("Failed to fetch backlog data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDropOnSprint = async (issueId: number, sprintId: number) => {
    // Find the issue in backlog or other sprints
    const issue =
      backlogIssues.find((i) => i.id === issueId) ||
      sprints.flatMap((s) => s.issues || []).find((i) => i.id === issueId);

    if (!issue) return;

    // Optimistic update: move issue to target sprint
    setBacklogIssues((prev) => prev.filter((i) => i.id !== issueId));
    setSprints((prev) =>
      prev.map((s) => {
        // Remove from other sprints
        const filtered = (s.issues || []).filter((i) => i.id !== issueId);
        // Add to target sprint
        if (s.id === sprintId) {
          return { ...s, issues: [...filtered, issue] };
        }
        return { ...s, issues: filtered };
      })
    );

    try {
      await issueService.update(issueId, { sprintId });
    } catch (error) {
      console.error("Failed to assign issue to sprint:", error);
      // Rollback: refetch data
      const [sprintsData, backlogData] = await Promise.all([
        sprintService.getAll(),
        issueService.getBacklog(),
      ]);
      setSprints(sprintsData);
      setBacklogIssues(backlogData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sprints.map((sprint) => (
        <SprintSection
          key={sprint.id}
          sprint={sprint}
          onDrop={(issueId) => handleDropOnSprint(issueId, sprint.id)}
        />
      ))}
      <BacklogSection issues={backlogIssues} />
    </div>
  );
}
