import { Bookmark, Bug, GripVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "@/helpers";
import type { Issue } from "@/types";

const typeIcons: Record<string, { icon: typeof Bookmark; color: string }> = {
  task: { icon: Bookmark, color: "text-blue-500" },
  bug: { icon: Bug, color: "text-red-500" },
  sub_task: { icon: Bookmark, color: "text-gray-400" },
};

export default function IssueRow({ issue }: { issue: Issue }) {
  const typeConfig = typeIcons[issue.type] || typeIcons.task;
  const TypeIcon = typeConfig.icon;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/issue-id", String(issue.id));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 border-b last:border-b-0 cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={handleDragStart}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
      <TypeIcon className={cn("h-4 w-4 shrink-0", typeConfig.color)} />
      <span className="text-sm flex-1 truncate">{issue.title}</span>
      {issue.storyPoints != null && (
        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
          {issue.storyPoints}
        </span>
      )}
      <StatusBadge status={issue.status} />
      {issue.assignee?.firstName && issue.assignee?.lastName ? (
        <Avatar className="h-6 w-6">
          <AvatarFallback
            className={cn(
              "text-[10px] text-white",
              getAvatarColor(issue.assignee.firstName + issue.assignee.lastName)
            )}
          >
            {getInitials(issue.assignee.firstName, issue.assignee.lastName)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-6" />
      )}
    </div>
  );
}
