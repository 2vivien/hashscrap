import { useFormContext } from 'react-hook-form';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { SourceFormData } from '../types/source-new.types';

interface SourceFormProps {
  onNext: () => void;
}

export function SourceForm({ onNext }: SourceFormProps) {
  const {
    register,
    formState: { errors },
    control,
    watch,
  } = useFormContext<SourceFormData>();

  const domaines = watch('domaines');

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nom">Nom</Label>
        <Input id="nom" {...register('nom')} className="mt-1" />
        {errors.nom && <p className="text-sm text-red">{errors.nom.message}</p>}
      </div>

      <div>
        <Label htmlFor="url">URL</Label>
        <Input id="url" {...register('url')} className="mt-1" />
        {errors.url && <p className="text-sm text-red">{errors.url.message}</p>}
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select {...register('type')}>
          <SelectTrigger id="type" className="mt-1">
            <SelectValue placeholder="Sélectionnez un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="web">Web</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="reseau">Réseau</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-red">{errors.type.message}</p>}
      </div>

      <div>
        <Label>Domaines autorisés</Label>
        <div className="flex gap-2 mt-1">
          <Input
            placeholder="Ajouter un domaine"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                e.preventDefault();
                const newDomain = e.currentTarget.value.trim();
                if (!domaines.includes(newDomain)) {
                  control.setValue('domaines', [...domaines, newDomain]);
                }
                e.currentTarget.value = '';
              }
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {domaines.map((domaine, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => {
                control.setValue(
                  'domaines',
                  domaines.filter((_, i) => i !== index),
                );
              }}
            >
              {domaine} ×
            </Button>
          ))}
        </div>
        {errors.domaines && <p className="text-sm text-red">{errors.domaines.message}</p>}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext}>Suivant</Button>
      </div>
    </div>
  );
}
