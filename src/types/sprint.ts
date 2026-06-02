import type { Issue } from './issue';
import type { Team } from './team';

export type SprintStatus = 'planned' | 'active' | 'completed';

export interface Sprint {
  id: number;
  name: string;
  goal: string | null;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  team: Pick<Team, 'id' | 'name'> | null;
  issueCount: number;
  issues?: Pick<Issue, 'id' | 'title' | 'type' | 'status' | 'storyPoints' | 'urgency' | 'deadline' | 'assignee'>[];
  createdAt: string;
  updatedAt: string;
}
