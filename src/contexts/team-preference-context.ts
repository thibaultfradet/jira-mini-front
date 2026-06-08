import { createContext } from 'react';
import type { Team } from '@/types/team';

export interface TeamPreferenceContextType {
  teams: Team[];
  selectedTeamId: number | null;
  setSelectedTeamId: (id: number) => void;
  isLoading: boolean;
}

export const TeamPreferenceContext = createContext<TeamPreferenceContextType | undefined>(undefined);
