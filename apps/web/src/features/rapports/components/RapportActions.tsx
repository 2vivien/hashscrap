import { Download, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { useState } from "react";
import { type Rapport } from "../types/rapports.types";

interface RapportActionsProps {
  rapport: Rapport;
}

export function RapportActions({ rapport }: RapportActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} title="Voir le contenu">
        <Eye className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled title="Disponible quand l'API de téléchargement sera exposée">
        <Download className="size-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{rapport.titre}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-invert max-h-[60vh] overflow-auto">
            <pre className="whitespace-pre-wrap">{rapport.contenu}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
