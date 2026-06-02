import type { User } from './user';

export interface Team {
  id: number;
  name: string;
  description: string | null;
  memberCount: number;
  members?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'roles'>[];
  createdAt: string;
  updatedAt: string;
}
