export interface DailyDataPoint {
  date: string;
  completedPoints: number;
  remainingPoints: number;
  idealCompleted: number;
  idealRemaining: number;
}

export interface SprintStatsData {
  sprint: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
    team: { id: number; name: string } | null;
  };
  totalPoints: number;
  dailyData: DailyDataPoint[];
  issueBreakdown: { todo: number; in_progress: number; done: number };
}

export interface VelocitySprint {
  sprintId: number;
  sprintName: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPoints: number;
  completedPoints: number;
}
