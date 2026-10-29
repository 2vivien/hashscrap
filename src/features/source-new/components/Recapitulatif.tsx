import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { SourceFormData, ValidationStep } from '../types/source-new.types';

interface RecapitulatifProps {
  onPrev: () => void;
  onSubmit: () => Promise<any>;
  isSubmitting: boolean;
  submitError: string | null;
}

export function Recapitulatif({ onPrev, onSubmit, isSubmitting, submitError }: RecapitulatifProps) {
  const formContext = useFormContext<SourceFormData>();
  const validationContext = useFormContext<ValidationStep>();

  const formData = formContext.watch();
  const validationData = validationContext.watch();

  return (
    <div className="space-y-6">
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Nom:</span> {formData.nom}
            </div>
            <div>
              <span className="font-medium">URL:</span> {formData.url}
            </div>
            <div>
              <span className="font-medium">Type:</span> {formData.type}
            </div>
            <div>
              <span className="font-medium">Domaines autorisés:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.domaines.map((domaine, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-bg rounded-[10px]">
                    {domaine}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={validationData.protocoleHttps}
                readOnly
                className="mr-2"
              />
              <span>Protocole HTTPS</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={validationData.resolutionDns}
                readOnly
                className="mr-2"
              />
              <span>Résolution DNS</span>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={validationData.accessibilite}
                readOnly
                className="mr-2"
              />
              <span>Accessibilité</span>
            </div>
            <div>
              <span className="font-medium">Maximum de pages:</span> {validationData.maxPages}
            </div>
          </div>
        </CardContent>
      </Card>

      {submitError && (
        <div className="p-4 text-sm text-red bg-red-dim rounded-[10px]">
          {submitError}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Précédent
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          title="Disponible quand l'API de création de source sera exposée"
        >
          {isSubmitting ? 'Création en cours...' : 'Créer la source'}
        </Button>
      </div>
    </div>
  );
}
