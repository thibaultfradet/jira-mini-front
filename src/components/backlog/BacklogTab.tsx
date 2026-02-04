import { useEffect, useState } from "react";
import { sprintService } from "@/services/sprint";
import { issueService } from "@/services/issue";
import type { Sprint, Issue } from "@/types";
import SprintSection from "./SprintSection";
import BacklogSection from "./BacklogSection";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function BacklogTab() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDrop, setPendingDrop] = useState<{
    issueId: number;
    target: { type: "sprint"; sprintId: number } | { type: "backlog" };
  } | null>(null);

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

  const moveIssueToSprint = async (issueId: number, sprintId: number) => {
    const issue =
      backlogIssues.find((i) => i.id === issueId) ||
      sprints.flatMap((s) => s.issues || []).find((i) => i.id === issueId);

    if (!issue) return;

    // Optimistic update: move issue to target sprint
    setBacklogIssues((prev) => prev.filter((i) => i.id !== issueId));
    setSprints((prev) =>
      prev.map((s) => {
        const filtered = (s.issues || []).filter((i) => i.id !== issueId);
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
      const [sprintsData, backlogData] = await Promise.all([
        sprintService.getAll(),
        issueService.getBacklog(),
      ]);
      setSprints(sprintsData);
      setBacklogIssues(backlogData);
    }
  };

  const handleDropOnSprint = (issueId: number, sprintId: number) => {
    const targetSprint = sprints.find((s) => s.id === sprintId);
    if (targetSprint?.isActive) {
      setPendingDrop({ issueId, target: { type: "sprint", sprintId } });
    } else {
      moveIssueToSprint(issueId, sprintId);
    }
  };

  const handleDropOnBacklog = (issueId: number) => {
    // Check if the issue comes from an active sprint
    const fromActiveSprint = sprints.some(
      (s) => s.isActive && (s.issues || []).some((i) => i.id === issueId)
    );

    if (fromActiveSprint) {
      setPendingDrop({ issueId, target: { type: "backlog" } });
    } else {
      moveIssueToBacklog(issueId);
    }
  };

  const moveIssueToBacklog = async (issueId: number) => {
    const issue = sprints
      .flatMap((s) => s.issues || [])
      .find((i) => i.id === issueId);

    if (!issue) return;

    setSprints((prev) =>
      prev.map((s) => ({
        ...s,
        issues: (s.issues || []).filter((i) => i.id !== issueId),
      }))
    );
    setBacklogIssues((prev) => [...prev, issue]);

    try {
      await issueService.update(issueId, { sprintId: null });
    } catch (error) {
      console.error("Failed to move issue to backlog:", error);
      const [sprintsData, backlogData] = await Promise.all([
        sprintService.getAll(),
        issueService.getBacklog(),
      ]);
      setSprints(sprintsData);
      setBacklogIssues(backlogData);
    }
  };

  const handleConfirmDrop = async () => {
    if (!pendingDrop) return;
    const { issueId, target } = pendingDrop;
    setPendingDrop(null);
    if (target.type === "sprint") {
      await moveIssueToSprint(issueId, target.sprintId);
    } else {
      await moveIssueToBacklog(issueId);
    }
  };

  const handleCancelDrop = () => {
    setPendingDrop(null);
  };

  // Resolve pending drop info for the dialog
  const pendingIssue = pendingDrop
    ? backlogIssues.find((i) => i.id === pendingDrop.issueId) ||
      sprints
        .flatMap((s) => s.issues || [])
        .find((i) => i.id === pendingDrop.issueId)
    : null;
  const pendingTarget = pendingDrop?.target;
  const pendingSprint =
    pendingTarget?.type === "sprint"
      ? sprints.find((s) => s.id === pendingTarget.sprintId)
      : null;
  const pendingDialogDescription =
    pendingDrop?.target.type === "sprint"
      ? `Vous êtes sur le point d'ajouter "${pendingIssue?.title ?? ""}" au sprint "${pendingSprint?.name ?? ""}". Cette action modifie le périmètre du sprint en cours.`
      : `Vous êtes sur le point de retirer "${pendingIssue?.title ?? ""}" du sprint actif. Cette action modifie le périmètre du sprint en cours.`;

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
      <BacklogSection issues={backlogIssues} onDrop={handleDropOnBacklog} />

      <ConfirmDialog
        open={!!pendingDrop}
        onOpenChange={(open) => !open && handleCancelDrop()}
        title="⚠️ Modification de périmètre"
        description={pendingDialogDescription}
        cancelLabel="Annuler"
        confirmLabel={pendingDrop?.target.type === "sprint" ? "Confirmer l'ajout" : "Confirmer le retrait"}
        onCancel={handleCancelDrop}
        onConfirm={handleConfirmDrop}
        variant="destructive"
      />
    </div>
  );
}
