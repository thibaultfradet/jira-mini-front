export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isAdmin: boolean;
  isActive: boolean;
  teams?: Pick<import('./team').Team, 'id' | 'name'>[];
  createdAt: string;
  updatedAt: string;
}
