import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, getAvatarColor } from "@/helpers";
import type { Issue } from "@/types";
import { Bookmark, Bug } from "lucide-react";

interface KanbanCardProps {
  issue: Issue;
  projectKey?: string;
  onClick?: () => void;
}

const typeIcons: Record<string, { icon: typeof Bookmark; color: string }> = {
  task: { icon: Bookmark, color: "text-blue-500" },
  bug: { icon: Bug, color: "text-red-500" },
  sub_task: { icon: Bookmark, color: "text-gray-400" },
};

export default function KanbanCard({ issue, projectKey = "PROJ", onClick }: KanbanCardProps) {
  const typeConfig = typeIcons[issue.type] || typeIcons.task;
  const TypeIcon = typeConfig.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <p className="text-sm mb-2 line-clamp-2">{issue.title}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TypeIcon className={cn("h-3.5 w-3.5", typeConfig.color)} />
          <span className="text-xs text-muted-foreground">
            {projectKey}-{issue.id}
          </span>
          {issue.storyPoints != null && (
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium ml-1">
              {issue.storyPoints}
            </span>
          )}
        </div>

        {issue.assignee?.firstName && issue.assignee?.lastName && (
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
        )}
      </div>

      {/* Subtasks */}
      {issue.children && issue.children.length > 0 && (
        <div className="mt-2 pt-2 border-t space-y-1.5">
          {issue.children.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Bookmark className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="truncate">{child.title}</span>
              {child.storyPoints != null && (
                <span className="bg-gray-100 text-gray-500 px-1 py-0.5 rounded-full text-[10px] ml-auto shrink-0">
                  {child.storyPoints}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
