import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import TabUsers from './settings/TabUsers';

export default function Settings() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground text-sm">Gérez les comptes utilisateurs</p>
        </div>
        <Link to="/settings/users/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un utilisateur
          </Button>
        </Link>
      </div>

      <TabUsers />
    </div>
  );
}
