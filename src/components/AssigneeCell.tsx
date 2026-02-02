import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/types";
import { getInitials, getAvatarColor } from "@/helpers";

interface AssigneeCellProps {
  assignee: UserType | null;
}

export default function AssigneeCell({ assignee }: AssigneeCellProps) {
  if (assignee?.firstName && assignee?.lastName) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback
            className={cn(
              "text-[10px] text-white",
              getAvatarColor(assignee.firstName + assignee.lastName)
            )}
          >
            {getInitials(assignee.firstName, assignee.lastName)}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">
          {assignee.firstName} {assignee.lastName}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
        <User className="h-3.5 w-3.5" />
      </div>
      <span className="text-sm">Non assignée</span>
    </div>
  );
}
