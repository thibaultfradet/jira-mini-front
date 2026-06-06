import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusConfig } from "@/utils/issueUtils";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.todo;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold cursor-pointer",
        config.className
      )}
    >
      {config.label}
      <ChevronDown className="h-3 w-3" />
    </div>
  );
}
