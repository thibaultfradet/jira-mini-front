import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { userService } from '@/services/user';
import { useAuth } from '@/contexts/useAuth';
import { showSuccessToast } from '@/utils/toastHelpers';
import { ArrowLeft } from 'lucide-react';

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { logout } = useAuth();
  const isEditing = Boolean(id);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);

  useEffect(() => {
    if (!isEditing || !id) return;
    userService.getById(logout, Number(id)).then((user) => {
      if (user) {
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setIsAdmin(user.isAdmin);
        setIsActive(user.isActive);
      }
      setIsFetching(false);
    });
  }, [logout, id, isEditing]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (isEditing && id) {
      const updated = await userService.update(logout, Number(id), { firstName, lastName, isAdmin, isActive });
      if (updated) {
        showSuccessToast('Utilisateur mis à jour');
        navigate('/settings');
      }
    } else {
      const created = await userService.create(logout, { email, firstName, lastName, isAdmin });
      if (created) {
        showSuccessToast('Utilisateur créé');
        navigate('/settings');
      }
    }
    setIsLoading(false);
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <Link to="/settings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Retour aux paramètres
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{isEditing ? "Modifier l'utilisateur" : 'Créer un utilisateur'}</h1>
        <p className="text-muted-foreground">
          {isEditing ? "Modifiez les informations de l'utilisateur" : 'Remplissez les informations pour créer un nouvel utilisateur'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="h-11" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isEditing} className="h-11" />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox id="isAdmin" checked={isAdmin} onCheckedChange={(c) => setIsAdmin(c as boolean)} className="cursor-pointer" />
            <Label htmlFor="isAdmin" className="cursor-pointer">Administrateur</Label>
          </div>
          {isEditing && (
            <div className="flex items-center gap-2">
              <Checkbox id="isActive" checked={isActive} onCheckedChange={(c) => setIsActive(c as boolean)} className="cursor-pointer" />
              <Label htmlFor="isActive" className="cursor-pointer">Actif</Label>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : isEditing ? 'Modifier' : "Créer l'utilisateur"}
          </Button>
          <Link to="/settings">
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
