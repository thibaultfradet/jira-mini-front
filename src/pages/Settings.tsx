import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Plus, UsersRound } from 'lucide-react';
import TabUsers from './settings/TabUsers';
import AdminTeams from './admin/Teams';

export default function Settings() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">Gérez les paramètres de l'application</p>
      </div>

      <Card className="flex-1">
        <CardContent className="h-full pt-4">
          <Tabs defaultValue="users" className="h-full flex flex-col">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="h-4 w-4" />
                  Utilisateurs
                </TabsTrigger>
                <TabsTrigger value="teams" className="gap-2">
                  <UsersRound className="h-4 w-4" />
                  Équipes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="m-0">
                <Link to="/settings/users/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Créer un utilisateur
                  </Button>
                </Link>
              </TabsContent>
            </div>

            <TabsContent value="users" className="flex-1 mt-4">
              <TabUsers />
            </TabsContent>

            <TabsContent value="teams" className="flex-1 mt-4">
              <AdminTeams />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
