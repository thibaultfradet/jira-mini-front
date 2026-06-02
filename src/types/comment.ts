import type { User } from './user';

export interface Comment {
  id: number;
  content: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  createdAt: string;
  updatedAt: string;
}
