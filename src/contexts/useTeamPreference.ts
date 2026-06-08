import { useContext } from 'react';
import { TeamPreferenceContext } from './team-preference-context';

export function useTeamPreference() {
  const context = useContext(TeamPreferenceContext);
  if (context === undefined) {
    throw new Error('useTeamPreference must be used within a TeamPreferenceProvider');
  }
  return context;
}
