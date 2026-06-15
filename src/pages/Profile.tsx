import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserAvatar from '@/components/UserAvatar';
import { useAuth } from '@/contexts/useAuth';
import { userService } from '@/services/user';
import { showSuccessToast, showErrorToast } from '@/utils/toastHelpers';

export default function Profile() {
  const { user, logout, refetchUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  if (!user) return null;

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updated = await userService.update(logout, user.id, { firstName, lastName });
    if (updated) {
      showSuccessToast('Profil mis à jour');
      refetchUser();
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showErrorToast('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 8) {
      showErrorToast('Le mot de passe doit faire au moins 8 caractères');
      return;
    }
    setSavingPassword(true);
    const updated = await userService.update(logout, user.id, { password: newPassword });
    if (updated) {
      showSuccessToast('Mot de passe modifié');
      setNewPassword('');
      setConfirmPassword('');
    }
    setSavingPassword(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <UserAvatar user={user} className="h-16 w-16" textClassName="text-xl font-semibold" />
            <div>
              <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {user.isAdmin && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                  Administrateur
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled className="bg-muted/50" />
              <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié.</p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Changer le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? 'Modification...' : 'Changer le mot de passe'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {user.teams && user.teams.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mes équipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.teams.map((team) => (
                <div key={team.id} className="flex items-center gap-2 py-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm">{team.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
