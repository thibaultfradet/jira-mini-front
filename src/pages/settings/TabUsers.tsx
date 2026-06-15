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
import UserAvatar from '@/components/UserAvatar';
import ViewToggle from '@/components/ViewToggle';
import { readStoredView, storeView, type ViewMode } from '@/utils/viewMode';
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
  const [viewMode, setViewMode] = useState<ViewMode>(readStoredView);

  const changeViewMode = (mode: ViewMode) => {
    storeView(mode);
    setViewMode(mode);
  };

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

  const roleBadge = (user: User) => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
      user.isAdmin ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
    }`}>
      {user.isAdmin ? 'Administrateur' : 'Utilisateur'}
    </span>
  );

  const statusBadge = (user: User) => (
    <span className={`text-xs px-2 py-0.5 rounded-full ${
      user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {user.isActive ? 'Actif' : 'Inactif'}
    </span>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Bascule vue tableau / cartes */}
      <div className="flex justify-end">
        <ViewToggle value={viewMode} onChange={changeViewMode} />
      </div>

      {viewMode === 'card' ? (
        isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Aucun utilisateur</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sorted.map((user) => (
              <div
                key={user.id}
                className="relative bg-card border border-border/40 rounded-lg p-4 flex flex-col items-center text-center gap-2 aspect-square justify-center"
              >
                <Link to={`/settings/users/${user.id}/edit`} className="absolute top-2 right-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <UserAvatar user={user} className="h-14 w-14" textClassName="text-lg" />
                <div className="min-w-0 w-full">
                  <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {roleBadge(user)}
                  {statusBadge(user)}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
      <div className="bg-card border border-border/40">
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
                <TableCell>{roleBadge(user)}</TableCell>
                <TableCell>{statusBadge(user)}</TableCell>
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
      )}
    </div>
  );
}
