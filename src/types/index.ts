export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  issues?: Issue[];
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  storyPoints: number | null;
  project: Project | null;
  parent: Issue | null;
  assignee: User | null;
  reporter: User | null;
  comments?: Comment[];
  issues?: Issue[];
  createdAt: string;
  updatedAt: string;
}

export type IssueType = "epic" | "story" | "task" | "bug";
export type IssueStatus = "todo" | "in_progress" | "done";

export interface Comment {
  id: number;
  content: string;
  issue: Issue;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
