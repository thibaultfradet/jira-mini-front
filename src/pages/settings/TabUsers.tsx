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
import { Checkbox } from '@/components/ui/checkbox';
import { userService } from '@/services/user';
import { useAuth } from '@/contexts/useAuth';
import type { User } from '@/types/user';
import { Pencil } from 'lucide-react';

export default function TabUsers() {
  const { logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userService.getAll(logout).then((data) => {
      setUsers(data);
      setIsLoading(false);
    });
  }, [logout]);

  const handleAdminChange = async (user: User, checked: boolean) => {
    const updated = await userService.update(logout, user.id, { isAdmin: checked });
    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Prénom</TableHead>
            <TableHead className="w-40">Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center w-24">Admin</TableHead>
            <TableHead className="text-center w-24">Actif</TableHead>
            <TableHead className="w-16"></TableHead>
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
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={user.isAdmin}
                    onCheckedChange={(checked) => handleAdminChange(user, checked as boolean)}
                    className="cursor-pointer"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </TableCell>
                <TableCell>
                  <Link to={`/settings/users/${user.id}/edit`}>
                    <Button variant="outline" size="icon" className="h-8 w-8">
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
