export interface Project {
  id: number;
  name: string;
  description: string;
  openedIssueCount?: number;
  finishedIssueCount?: number;
  issues?: import('./issue').Issue[];
  createdAt: string;
  updatedAt: string;
}
