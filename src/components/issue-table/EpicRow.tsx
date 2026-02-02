import { Fragment } from "react";
import {
  Zap,
  ChevronRight,
  ChevronDown,
  Equal,
  Plus,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import AssigneeCell from "@/components/AssigneeCell";
import StatusBadge from "@/components/StatusBadge";
import type { Issue } from "@/types";
import TaskRow from "./TaskRow";

interface EpicRowProps {
  epic: Issue;
  projectKey: string;
  isExpanded: boolean;
  isLoading: boolean;
  children: Issue[];
  onToggle: (e: React.MouseEvent) => void;
  onClick: () => void;
  onAddChild?: () => void;
  onChildClick: (child: Issue) => void;
}

export default function EpicRow({
  epic,
  projectKey,
  isExpanded,
  isLoading,
  children,
  onToggle,
  onClick,
  onAddChild,
  onChildClick,
}: EpicRowProps) {
  return (
    <Fragment>
      <TableRow
        className="cursor-pointer hover:bg-muted/50 h-11 group border-0"
        onClick={onClick}
      >
        <TableCell className="w-10 pr-0 pl-4">
          <Checkbox
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer"
          />
        </TableCell>

        <TableCell className="py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="p-0.5 hover:bg-muted rounded cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              ) : isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            <Zap className="h-4 w-4 text-violet-500 shrink-0" />
            <span className="text-xs font-medium text-violet-600 shrink-0 hover:underline">
              {projectKey}-{epic.id}
            </span>
            <span className="truncate flex-1 text-sm">{epic.title}</span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onAddChild && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild();
                  }}
                  className="p-1 hover:bg-muted rounded cursor-pointer"
                  title="Ajouter un ticket enfant"
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className="p-1 hover:bg-muted rounded cursor-pointer"
                title="Ouvrir l'epic"
              >
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </TableCell>

        <TableCell className="py-2">
          <AssigneeCell assignee={epic.assignee} />
        </TableCell>

        <TableCell className="py-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Equal className="h-4 w-4" />
            <span className="text-sm">Medium</span>
          </div>
        </TableCell>

        <TableCell className="py-2">
          <StatusBadge status={epic.status} />
        </TableCell>
      </TableRow>

      {isExpanded &&
        children.map((child) => (
          <TaskRow
            key={child.id}
            task={child}
            projectKey={projectKey}
            onClick={() => onChildClick(child)}
          />
        ))}
    </Fragment>
  );
}
