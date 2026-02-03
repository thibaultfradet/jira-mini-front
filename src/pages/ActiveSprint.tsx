import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/kanban";
import { BacklogTab } from "@/components/backlog";
import ConfirmDialog from "@/components/ConfirmDialog";
import { sprintService } from "@/services/sprint";
import { issueService } from "@/services/issue";
import type { Sprint, IssueStatus } from "@/types";

export default function ActiveSprint() {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Confirm dialog state
  const [pendingMove, setPendingMove] = useState<{
    issueId: number;
    targetStatus: IssueStatus;
  } | null>(null);

  useEffect(() => {
    const fetchSprint = async () => {
      try {
        const data = await sprintService.getActive();
        setSprint(data);
      } catch (err) {
        console.error("Failed to fetch active sprint:", err);
        setError("Aucun sprint actif trouvé");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSprint();
  }, []);

  const applyStatusChange = async (
    issueId: number,
    targetStatus: IssueStatus
  ) => {
    if (!sprint) return;

    // Optimistic update
    setSprint((prev) => {
      if (!prev?.issues) return prev;
      return {
        ...prev,
        issues: prev.issues.map((issue) =>
          issue.id === issueId ? { ...issue, status: targetStatus } : issue
        ),
      };
    });

    try {
      await issueService.update(issueId, { status: targetStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
      // Rollback
      const data = await sprintService.getActive();
      setSprint(data);
    }
  };

  const handleStatusChange = (
    issueId: number,
    targetStatus: IssueStatus
  ) => {
    if (!sprint?.issues) return;

    const issue = sprint.issues.find((i) => i.id === issueId);
    if (!issue || issue.status === targetStatus) return;

    // in_progress → done requires confirmation
    if (issue.status === "in_progress" && targetStatus === "done") {
      setPendingMove({ issueId, targetStatus });
      return;
    }

    applyStatusChange(issueId, targetStatus);
  };

  const handleConfirm = () => {
    if (pendingMove) {
      applyStatusChange(pendingMove.issueId, pendingMove.targetStatus);
      setPendingMove(null);
    }
  };

  const handleCancel = () => {
    setPendingMove(null);
  };

  const pendingIssue = sprint?.issues?.find(
    (i) => i.id === pendingMove?.issueId
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Sprint actif</h1>

      <Tabs defaultValue="active" className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="active" className="cursor-pointer">
            Sprints actifs
          </TabsTrigger>
          <TabsTrigger value="backlog" className="cursor-pointer">
            Backlog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 mt-4">
          {error || !sprint ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-muted-foreground">
                {error || "Aucun sprint actif"}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3 h-full">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{sprint.name}</h2>
                <span className="text-sm text-muted-foreground">
                  {new Date(sprint.startDate).toLocaleDateString("fr-FR")} —{" "}
                  {new Date(sprint.endDate).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <KanbanBoard
                issues={sprint.issues || []}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="backlog" className="flex-1 mt-4">
          <BacklogTab />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!pendingMove}
        onOpenChange={(open) => !open && handleCancel()}
        title="Marquer comme terminé"
        description={`Voulez-vous marquer "${pendingIssue?.title}" comme terminé ?`}
        cancelLabel="Annuler"
        confirmLabel="Terminer"
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
