import type { Issue } from '../issue';
import type { Project } from '../project';

export interface DashboardData {
  projects: Pick<Project, 'id' | 'name' | 'description' | 'openedIssueCount' | 'finishedIssueCount'>[];
  myTasks: {
    inProgress: Pick<Issue, 'id' | 'title' | 'type' | 'status' | 'storyPoints' | 'urgency' | 'deadline' | 'project'>[];
    todo: Pick<Issue, 'id' | 'title' | 'type' | 'status' | 'storyPoints' | 'urgency' | 'deadline' | 'project'>[];
  };
  unreadNotificationCount: number;
}
