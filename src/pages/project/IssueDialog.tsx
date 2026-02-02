import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IssueDialogProps {
  issueId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function IssueDialog({ issueId, open, onOpenChange }: IssueDialogProps) {
  // TODO: Fetch issue details when issueId changes

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails du ticket</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {issueId ? (
            <p className="text-muted-foreground">
              Chargement du ticket #{issueId}...
            </p>
          ) : (
            <p className="text-muted-foreground">Aucun ticket sélectionné</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
