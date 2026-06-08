import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
      <div className="space-y-2">
        <p className="text-8xl font-bold text-primary/20 select-none">404</p>
        <h1 className="text-2xl font-semibold">Page introuvable</h1>
        <p className="text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Retour
        </Button>
        <Button onClick={() => navigate('/')}>
          Accueil
        </Button>
      </div>
    </div>
  );
}
