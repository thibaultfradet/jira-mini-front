import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Issue } from "@/types";
import { Zap, SquareCheck, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface IssueTableProps {
  issues: Issue[];
  onIssueClick: (issueId: number) => void;
}

const statusLabels: Record<string, string> = {
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminé",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  todo: "outline",
  in_progress: "secondary",
  done: "default",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getAssigneeName(issue: Issue): string {
  if (!issue.assignee) return "-";
  return `${issue.assignee.firstName} ${issue.assignee.lastName}`;
}

export default function IssueTable({ issues, onIssueClick }: IssueTableProps) {
  const [expandedEpics, setExpandedEpics] = useState<Set<number>>(new Set());

  const toggleEpic = (epicId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedEpics((prev) => {
      const next = new Set(prev);
      if (next.has(epicId)) {
        next.delete(epicId);
      } else {
        next.add(epicId);
      }
      return next;
    });
  };

  // Filter to only show epics and tasks without parent (top-level items)
  const topLevelIssues = issues.filter(
    (issue) => issue.type === "epic" || (!issue.parent && issue.type !== "epic")
  );

  const renderIssueRow = (issue: Issue, isChild = false) => {
    const isEpic = issue.type === "epic";
    const isExpanded = expandedEpics.has(issue.id);
    const childIssues = issues.filter((i) => i.parent?.id === issue.id);
    const hasChildren = childIssues.length > 0;

    return (
      <>
        <TableRow
          key={issue.id}
          className="cursor-pointer hover:bg-muted/50"
          onClick={() => onIssueClick(issue.id)}
        >
          <TableCell>
            <div className={cn("flex items-center gap-2", isChild && "ml-6")}>
              {isEpic && hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={(e) => toggleEpic(issue.id, e)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {isEpic && !hasChildren && <span className="w-6" />}
              {isEpic ? (
                <Zap className="h-4 w-4 text-violet-500 shrink-0" />
              ) : (
                <SquareCheck className="h-4 w-4 text-green-500 shrink-0" />
              )}
              <span className="font-medium">{issue.title}</span>
            </div>
          </TableCell>
          <TableCell>{getAssigneeName(issue)}</TableCell>
          <TableCell>
            <Badge variant={statusVariants[issue.status]}>
              {statusLabels[issue.status]}
            </Badge>
          </TableCell>
          <TableCell className="text-muted-foreground">
            {formatDate(issue.createdAt)}
          </TableCell>
          <TableCell className="text-muted-foreground">
            {formatDate(issue.updatedAt)}
          </TableCell>
        </TableRow>
        {isEpic && isExpanded && childIssues.map((child) => renderIssueRow(child, true))}
      </>
    );
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[300px]">Ticket</TableHead>
            <TableHead className="w-40">Assigné</TableHead>
            <TableHead className="w-32">État</TableHead>
            <TableHead className="w-32">Créé le</TableHead>
            <TableHead className="w-32">Mis à jour</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topLevelIssues.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Aucun ticket
              </TableCell>
            </TableRow>
          ) : (
            topLevelIssues.map((issue) => renderIssueRow(issue))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
