import { Download, Eye } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { useState } from "react";
import { type Rapport } from "../types/rapports.types";

interface RapportActionsProps { rapport: Rapport; }
export function RapportActions({ rapport }: RapportActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const canDownloadMarkdown = rapport.format === "markdown";
  function downloadMarkdown() {
    if (!canDownloadMarkdown) return;
    const blob = new Blob([rapport.contenu], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeName = rapport.titre.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "rapport";
    anchor.href = url; anchor.download = safeName + ".md"; anchor.click();
    URL.revokeObjectURL(url);
  }
  return <div className="flex gap-1">
    <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} title="Voir le contenu"><Eye className="size-4" /></Button>
    <Button variant="ghost" size="icon" onClick={downloadMarkdown} disabled={!canDownloadMarkdown} title={canDownloadMarkdown ? "Télécharger le contenu Markdown reçu de l’API" : "Le backend ne fournit pas de fichier binaire pour ce format"}><Download className="size-4" /></Button>
    <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{rapport.titre}</DialogTitle></DialogHeader><div className="prose prose-invert max-h-[60vh] overflow-auto"><pre className="whitespace-pre-wrap">{rapport.contenu}</pre></div></DialogContent></Dialog>
  </div>;
}
