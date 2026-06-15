import { UserPlus, MessageSquare, Play, CheckCircle2, RefreshCw, Bell } from 'lucide-react';
import type { NotificationType } from '@/types/notification';

interface NotificationVisual {
  icon: React.ReactNode;
  /** Tailwind classes for the icon container background + text color */
  className: string;
}

const config: Record<NotificationType, NotificationVisual> = {
  task_assigned: { icon: <UserPlus className="h-4 w-4" />, className: 'bg-primary/10 text-primary' },
  comment_added: { icon: <MessageSquare className="h-4 w-4" />, className: 'bg-blue-100 text-blue-600' },
  sprint_started: { icon: <Play className="h-4 w-4" />, className: 'bg-green-100 text-green-600' },
  sprint_completed: { icon: <CheckCircle2 className="h-4 w-4" />, className: 'bg-emerald-100 text-emerald-600' },
  status_changed: { icon: <RefreshCw className="h-4 w-4" />, className: 'bg-amber-100 text-amber-600' },
};

const fallback: NotificationVisual = { icon: <Bell className="h-4 w-4" />, className: 'bg-muted text-muted-foreground' };

export function getNotificationVisual(type: NotificationType): NotificationVisual {
  return config[type] ?? fallback;
}
