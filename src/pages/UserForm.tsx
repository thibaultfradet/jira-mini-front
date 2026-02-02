import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { userService } from "@/services/user";
import { ArrowLeft } from "lucide-react";

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      const fetchUser = async () => {
        try {
          const user = await userService.getById(Number(id));
          setFirstName(user.firstName);
          setLastName(user.lastName);
          setEmail(user.email);
          setIsAdmin(user.roles.includes("ROLE_ADMIN"));
        } catch (error) {
          console.error("Failed to fetch user:", error);
          setError("Utilisateur non trouvé");
        } finally {
          setIsFetching(false);
        }
      };

      fetchUser();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const roles = isAdmin ? ["ROLE_USER", "ROLE_ADMIN"] : ["ROLE_USER"];

    try {
      if (isEditing && id) {
        await userService.update(Number(id), {
          firstName,
          lastName,
          roles,
        });
      } else {
        await userService.create({
          email,
          firstName,
          lastName,
          roles,
        });
      }
      navigate("/settings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
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
      <Link
        to="/settings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux paramètres
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Modifier l'utilisateur" : "Créer un utilisateur"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing
            ? "Modifiez les informations de l'utilisateur"
            : "Remplissez les informations pour créer un nouvel utilisateur"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Jean"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Dupont"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="jean.dupont@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isEditing}
            className="h-11"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="isAdmin"
            checked={isAdmin}
            onCheckedChange={(checked) => setIsAdmin(checked as boolean)}
            className="cursor-pointer"
          />
          <Label htmlFor="isAdmin" className="cursor-pointer">
            Administrateur
          </Label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Enregistrement..."
              : isEditing
                ? "Modifier"
                : "Créer l'utilisateur"}
          </Button>
          <Link to="/settings">
            <Button type="button" variant="outline">
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
