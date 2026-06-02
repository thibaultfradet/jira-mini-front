export type NotificationType =
  | 'task_assigned'
  | 'comment_added'
  | 'sprint_started'
  | 'sprint_completed'
  | 'status_changed';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  isRead: boolean;
  relatedIssueId: number | null;
  createdAt: string;
}
