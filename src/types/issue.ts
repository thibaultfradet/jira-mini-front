import type { User } from './user';
import type { Project } from './project';
import type { Comment } from './comment';
import type { SubTask } from './subtask';

export type IssueType = 'epic' | 'story' | 'task' | 'bug';
export type IssueStatus = 'todo' | 'in_progress' | 'done';
export type IssueUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  storyPoints: number | null;
  urgency: IssueUrgency | null;
  deadline: string | null;
  project: Pick<Project, 'id' | 'name'>;
  parent: Pick<Issue, 'id' | 'title'> | null;
  assignee: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | null;
  reporter: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  children?: Pick<Issue, 'id' | 'title' | 'type' | 'status' | 'storyPoints'>[];
  subTasks?: SubTask[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}
