import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamService } from '@/services/team';
import { userService } from '@/services/user';
import { useAuth } from '@/contexts/useAuth';
import type { Team } from '@/types/team';
import type { User } from '@/types/user';
import { showSuccessToast } from '@/utils/toastHelpers';
import { getInitials, getAvatarColor } from '@/utils/avatarUtils';
import { Plus, Trash2, UserPlus, X, Pencil } from 'lucide-react';

export default function AdminTeams() {
  const { logout } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const [membersTeam, setMembersTeam] = useState<Team | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    Promise.all([teamService.getAll(logout), userService.getAll(logout)]).then(([t, u]) => {
      setTeams(t);
      setAllUsers(u);
      setLoading(false);
    });
  }, [logout]);

  const openCreate = () => {
    setFormName('');
    setFormDesc('');
    setEditTeam(null);
    setCreateOpen(true);
  };

  const openEdit = (team: Team) => {
    setFormName(team.name);
    setFormDesc(team.description ?? '');
    setEditTeam(team);
    setCreateOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    if (editTeam) {
      const updated = await teamService.update(logout, editTeam.id, { name: formName, description: formDesc });
      if (updated) {
        setTeams((prev) => prev.map((t) => (t.id === editTeam.id ? { ...t, name: updated.name, description: updated.description } : t)));
        showSuccessToast('Équipe mise à jour');
      }
    } else {
      const created = await teamService.create(logout, { name: formName, description: formDesc });
      if (created) {
        setTeams((prev) => [...prev, { ...created, members: [] }]);
      }
    }
    setSaving(false);
    setCreateOpen(false);
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(`Supprimer l'équipe "${team.name}" ?`)) return;
    const ok = await teamService.delete(logout, team.id);
    if (ok) {
      setTeams((prev) => prev.filter((t) => t.id !== team.id));
      showSuccessToast('Équipe supprimée');
    }
  };

  const handleAddMember = async () => {
    if (!membersTeam || !selectedUserId) return;
    const ok = await teamService.addMember(logout, membersTeam.id, Number(selectedUserId));
    if (ok) {
      const user = allUsers.find((u) => u.id === Number(selectedUserId));
      if (user) {
        setTeams((prev) => prev.map((t) =>
          t.id === membersTeam.id
            ? { ...t, members: [...(t.members ?? []), user], memberCount: (t.memberCount ?? 0) + 1 }
            : t
        ));
        setMembersTeam((prev) =>
          prev ? { ...prev, members: [...(prev.members ?? []), user] } : prev
        );
      }
      setSelectedUserId('');
    }
  };

  const handleRemoveMember = async (team: Team, userId: number) => {
    const ok = await teamService.removeMember(logout, team.id, userId);
    if (ok) {
      setTeams((prev) => prev.map((t) =>
        t.id === team.id
          ? { ...t, members: (t.members ?? []).filter((m) => m.id !== userId), memberCount: Math.max(0, (t.memberCount ?? 1) - 1) }
          : t
      ));
      setMembersTeam((prev) =>
        prev ? { ...prev, members: (prev.members ?? []).filter((m) => m.id !== userId) } : prev
      );
    }
  };

  const currentMembers = membersTeam?.members ?? [];
  const availableUsers = allUsers.filter((u) => !currentMembers.some((m) => m.id === u.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Équipes</h1>
          <p className="text-muted-foreground text-sm">{teams.length} équipe{teams.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle équipe
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{team.name}</CardTitle>
                  {team.description && (
                    <p className="text-xs text-muted-foreground mt-1">{team.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(team)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => handleDelete(team)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {(team.members ?? []).slice(0, 5).map((member) => {
                    const initials = getInitials(member.firstName, member.lastName);
                    return (
                      <Avatar key={member.id} className="h-7 w-7 border-2 border-white">
                        <AvatarFallback className={`${getAvatarColor(initials)} text-white text-[10px] font-medium`}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {(team.memberCount ?? 0) > 5 && (
                    <div className="h-7 w-7 rounded-full border-2 border-white bg-muted flex items-center justify-center">
                      <span className="text-[10px] text-muted-foreground">+{(team.memberCount ?? 0) - 5}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => { setMembersTeam(team); }}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Membres
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit team dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editTeam ? "Modifier l'équipe" : 'Nouvelle équipe'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="teamName">Nom</Label>
              <Input id="teamName" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Backend Team" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamDesc">Description (optionnel)</Label>
              <Input id="teamDesc" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Description de l'équipe" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving || !formName.trim()}>
              {saving ? 'Enregistrement...' : editTeam ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members management panel */}
      {membersTeam && (
        <Dialog open={!!membersTeam} onOpenChange={(o) => { if (!o) setMembersTeam(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Membres de {membersTeam.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              {currentMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun membre</p>
              ) : (
                <div className="space-y-2">
                  {currentMembers.map((member) => {
                    const initials = getInitials(member.firstName, member.lastName);
                    return (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`${getAvatarColor(initials)} text-white text-xs font-medium`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{member.firstName} {member.lastName}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveMember(membersTeam, member.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {availableUsers.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Ajouter un membre</p>
                  <div className="flex gap-2">
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger className="flex-1 text-sm h-8">
                        <SelectValue placeholder="Sélectionner un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.firstName} {u.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={handleAddMember} disabled={!selectedUserId}>
                      <UserPlus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMembersTeam(null)}>Fermer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
