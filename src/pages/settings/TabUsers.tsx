import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { userService } from '@/services/user';
import { useAuth } from '@/contexts/useAuth';
import type { User } from '@/types/user';
import { Pencil, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

type SortCol = 'firstName' | 'lastName' | 'email' | 'role' | 'isActive';
type SortDir = 'asc' | 'desc';

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 ml-1 text-muted-foreground/60" />;
  return dir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 ml-1" />
    : <ChevronDown className="h-3.5 w-3.5 ml-1" />;
}

export default function TabUsers() {
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortCol, setSortCol] = useState<SortCol>('role');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    userService.getAll(logout).then((data) => {
      setUsers(data);
      setIsLoading(false);
    });
  }, [logout]);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const sorted = [...users].sort((a, b) => {
    let cmp = 0;
    switch (sortCol) {
      case 'firstName': cmp = a.firstName.localeCompare(b.firstName); break;
      case 'lastName':  cmp = a.lastName.localeCompare(b.lastName);   break;
      case 'email':     cmp = a.email.localeCompare(b.email);         break;
      case 'role':      cmp = (a.isAdmin ? 1 : 0) - (b.isAdmin ? 1 : 0); break;
      case 'isActive':  cmp = (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0); break;
    }
    return sortDir === 'asc' ? -cmp : cmp;
  });

  const th = (col: SortCol, label: string, className?: string) => (
    <TableHead
      className={`cursor-pointer select-none hover:text-foreground transition-colors ${className ?? ''}`}
      onClick={() => handleSort(col)}
    >
      <div className="flex items-center">
        {label}
        <SortIcon active={sortCol === col} dir={sortDir} />
      </div>
    </TableHead>
  );

  return (
    <div className="bg-card border border-border/40 mt-2">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {th('firstName', 'Prénom', 'w-40')}
            {th('lastName',  'Nom',    'w-40')}
            {th('email',     'Email')}
            {th('role',      'Rôle',   'w-40')}
            {th('isActive',  'Statut', 'w-28')}
            <TableHead className="w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">Chargement...</TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun utilisateur</TableCell>
            </TableRow>
          ) : (
            sorted.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.isAdmin
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {user.isAdmin ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    user.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </TableCell>
                <TableCell>
                  <Link to={`/settings/users/${user.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
