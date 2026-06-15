import { Bookmark } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import AssigneeCell from "@/components/AssigneeCell";
import StatusSelect from "@/components/StatusSelect";
import type { Issue, IssueStatus } from "@/types";

interface TaskRowProps {
  task: Issue;
  projectKey: string;
  onClick: () => void;
  onStatusChange: (issueId: number, status: IssueStatus) => void;
}

export default function TaskRow({ task, projectKey, onClick, onStatusChange }: TaskRowProps) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 h-11"
      onClick={onClick}
    >
      <TableCell className="w-10 pr-0 pl-4">
        <Checkbox
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer"
        />
      </TableCell>

      <TableCell className="py-2">
        <div className="flex items-center gap-2 pl-8">
          <Bookmark className="h-4 w-4 text-blue-500 shrink-0" />
          <span className="text-xs font-medium text-blue-600 shrink-0 hover:underline">
            {projectKey}-{task.id}
          </span>
          <span className="truncate text-sm">{task.title}</span>
        </div>
      </TableCell>

      <TableCell className="py-2">
        <AssigneeCell assignee={task.assignee} />
      </TableCell>

      <TableCell className="py-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm">{task.storyPoints ? task.storyPoints : "-"}</span>
        </div>
      </TableCell>

      <TableCell className="py-2">
        <StatusSelect status={task.status} onChange={(s) => onStatusChange(task.id, s)} />
      </TableCell>
    </TableRow>
  );
}
