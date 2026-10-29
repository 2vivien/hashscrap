import { useFormContext } from 'react-hook-form';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { ValidationStep } from '../types/source-new.types';

interface ValidationStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export function ValidationStep({ onNext, onPrev }: ValidationStepProps) {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<ValidationStep>();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="protocoleHttps" {...register('protocoleHttps')} />
        <Label htmlFor="protocoleHttps">Protocole HTTPS</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="resolutionDns" {...register('resolutionDns')} />
        <Label htmlFor="resolutionDns">Résolution DNS</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="accessibilite" {...register('accessibilite')} />
        <Label htmlFor="accessibilite">Accessibilité</Label>
      </div>

      <div>
        <Label htmlFor="maxPages">Maximum de pages</Label>
        <Input
          id="maxPages"
          type="number"
          {...register('maxPages', { valueAsNumber: true })}
          className="mt-1"
        />
        {errors.maxPages && <p className="text-sm text-red">{errors.maxPages.message}</p>}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Précédent
        </Button>
        <Button onClick={onNext}>Suivant</Button>
      </div>
    </div>
  );
}
