import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/kanban";
import { BacklogTab } from "@/components/backlog";
import { sprintService } from "@/services/sprint";
import type { Sprint } from "@/types";

export default function ActiveSprint() {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
                  {new Date(sprint.startDate).toLocaleDateString("fr-FR")} — {new Date(sprint.endDate).toLocaleDateString("fr-FR")}
                </span>
              </div>
              <KanbanBoard issues={sprint.issues || []} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="backlog" className="flex-1 mt-4">
          <BacklogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
