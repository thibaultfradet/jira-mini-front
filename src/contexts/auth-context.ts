import { createContext } from 'react';
import type { User } from '@/types/user';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  logout: () => void;
  refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
