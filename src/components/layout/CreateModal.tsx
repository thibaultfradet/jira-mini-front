import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { projectService } from '@/services/project';
import { issueService } from '@/services/issue';
import { useAuth } from '@/contexts/useAuth';
import type { Project } from '@/types/project';
import type { Issue } from '@/types/issue';
import { FolderKanban, Zap, SquareCheck, ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type CreateType = 'project' | 'epic' | 'task' | null;

interface CreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createTypes = [
  {
    id: 'project' as const,
    label: 'Projet',
    description: 'Organiser vos tickets dans un nouvel espace de travail',
    icon: FolderKanban,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'epic' as const,
    label: 'Epic',
    description: 'Regrouper plusieurs tâches liées sous un même objectif',
    icon: Zap,
    iconClass: 'bg-violet-50 text-violet-600',
  },
  {
    id: 'task' as const,
    label: 'Tâche',
    description: 'Créer une tâche à rattacher à une epic existante',
    icon: SquareCheck,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
];

export default function CreateModal({ open, onOpenChange }: CreateModalProps) {
  const { logout } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<CreateType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedEpicId, setSelectedEpicId] = useState<string>('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [epics, setEpics] = useState<Issue[]>([]);

  useEffect(() => {
    if (open && step === 2 && (selectedType === 'epic' || selectedType === 'task')) {
      projectService.getAll(logout).then(setProjects);
    }
  }, [logout, open, step, selectedType]);

  useEffect(() => {
    if (!selectedProjectId || selectedType !== 'task') return;
    projectService.getById(logout, Number(selectedProjectId)).then((project) => {
      const projectEpics = (project?.issues ?? []).filter((i) => i.type === 'epic');
      setEpics(projectEpics as Issue[]);
    });
  }, [logout, selectedProjectId, selectedType]);

  const resetForm = () => {
    setStep(1);
    setSelectedType(null);
    setName('');
    setDescription('');
    setTitle('');
    setSelectedProjectId('');
    setSelectedEpicId('');
    setError('');
    setEpics([]);
  };

  const handleClose = (open: boolean) => {
    if (!open) resetForm();
    onOpenChange(open);
  };

  const handleTypeSelect = (type: CreateType) => {
    setSelectedType(type);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      if (selectedType === 'project') {
        await projectService.create(logout, { name, description });
      } else if (selectedType === 'epic') {
        await issueService.create(logout, {
          title,
          type: 'epic',
          projectId: Number(selectedProjectId),
        });
      } else if (selectedType === 'task') {
        await issueService.create(logout, {
          title,
          type: 'task',
          parentId: Number(selectedEpicId),
        });
      }
      handleClose(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (selectedType === 'project') return name.trim().length > 0;
    if (selectedType === 'epic') return title.trim().length > 0 && !!selectedProjectId;
    if (selectedType === 'task') return title.trim().length > 0 && !!selectedEpicId;
    return false;
  };

  const selectedMeta = createTypes.find((t) => t.id === selectedType);

  const errorBanner = error && (
    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>
  );

  const footer = (
    <div className="mt-auto flex justify-end gap-2 pt-6">
      <Button variant="outline" onClick={() => handleClose(false)}>
        Annuler
      </Button>
      <Button onClick={handleSubmit} disabled={!isFormValid() || isLoading}>
        {isLoading ? 'Création...' : 'Créer'}
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 2 && (
              <Button variant="ghost" size="icon" className="h-7 w-7 -ml-1.5" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step === 1 ? 'Créer' : `Nouveau ${selectedMeta?.label.toLowerCase()}`}
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Que souhaitez-vous créer ?' : selectedMeta?.description}
          </DialogDescription>
        </DialogHeader>

        {/* min-height fixe : la modale ne change pas de taille entre les étapes / types */}
        <div className="flex min-h-80 flex-col">
          {step === 1 && (
            <div className="flex flex-1 flex-col justify-center gap-2.5">
              {createTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className="group flex items-center gap-4 rounded-lg border bg-card p-4 text-left transition-colors cursor-pointer hover:border-primary hover:bg-accent"
                  >
                    <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', type.iconClass)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-tight">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && selectedType === 'project' && (
            <div className="flex flex-1 flex-col space-y-4">
              {errorBanner}
              <div className="space-y-2">
                <Label htmlFor="name">Nom du projet</Label>
                <Input id="name" placeholder="Mon projet" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea id="description" placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              {footer}
            </div>
          )}

          {step === 2 && selectedType === 'epic' && (
            <div className="flex flex-1 flex-col space-y-4">
              {errorBanner}
              <div className="space-y-2">
                <Label>Projet</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner un projet" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'epic</Label>
                <Input id="title" placeholder="Mon epic" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              {footer}
            </div>
          )}

          {step === 2 && selectedType === 'task' && (
            <div className="flex flex-1 flex-col space-y-4">
              {errorBanner}
              <div className="space-y-2">
                <Label>Projet</Label>
                <Select value={selectedProjectId} onValueChange={(val) => { setSelectedProjectId(val); setSelectedEpicId(''); }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner un projet" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Epic</Label>
                <Select value={selectedEpicId} onValueChange={setSelectedEpicId} disabled={!selectedProjectId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedProjectId ? 'Sélectionner une epic' : "Sélectionner d'abord un projet"} />
                  </SelectTrigger>
                  <SelectContent>
                    {epics.map((e) => <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la tâche</Label>
                <Input id="title" placeholder="Ma tâche" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              {footer}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
