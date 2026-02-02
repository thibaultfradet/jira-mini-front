import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { userService } from "@/services/user";
import type { User } from "@/types";
import { Pencil } from "lucide-react";

export default function TabUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAll();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAdminChange = async (user: User, checked: boolean) => {
    const newRoles = checked
      ? [...user.roles.filter((r) => r !== "ROLE_ADMIN"), "ROLE_ADMIN"]
      : user.roles.filter((r) => r !== "ROLE_ADMIN");

    try {
      const updatedUser = await userService.update(user.id, { roles: newRoles });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? updatedUser : u))
      );
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const isAdmin = (user: User) => user.roles.includes("ROLE_ADMIN");

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-45">Prénom</TableHead>
            <TableHead className="w-45">Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-center w-24">Admin</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Chargement...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                Aucun utilisateur
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.firstName}
                </TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="text-center">
                  <Checkbox
                    checked={isAdmin(user)}
                    onCheckedChange={(checked) =>
                      handleAdminChange(user, checked as boolean)
                    }
                    className="cursor-pointer"
                  />
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
